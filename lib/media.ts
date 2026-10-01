// 视频/播客 → 音频提取与压缩：yt-dlp 提取音频 / 直链下载 → ffmpeg 转 16kHz 单声道 mp3 → 超大按时长切片
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { assertUrlAllowed, SsrfError } from "./ssrf";

const execFileAsync = promisify(execFile);

/** 默认上限：90 分钟，可用 MEDIA_MAX_MINUTES 调整 */
export const MAX_AUDIO_MINUTES = Number(process.env.MEDIA_MAX_MINUTES ?? 90) || 90;
/** 直链媒体下载体积上限（默认 300MB） */
const MAX_DOWNLOAD_BYTES =
  (Number(process.env.MEDIA_MAX_DOWNLOAD_MB ?? 300) || 300) * 1024 * 1024;

const DIRECT_MEDIA_EXT = /\.(mp3|m4a|wav|flac|aac|ogg|opus|wma|mp4|m4v|mkv|webm|mov|avi|flv|ts)(\?.*)?$/i;

/* ---------- 二进制路径解析（支持 assets/bin 手动放置兜底） ---------- */

function binCandidate(names: string[]): string | null {
  for (const name of names) {
    const p = path.join(process.cwd(), "assets", "bin", name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

let cachedFfmpeg: string | null = null;
export function resolveFfmpegPath(): string {
  if (cachedFfmpeg) return cachedFfmpeg;
  const fromEnv = process.env.FFMPEG_PATH?.trim();
  if (fromEnv && fs.existsSync(fromEnv)) return (cachedFfmpeg = fromEnv);
  const manual = binCandidate(["ffmpeg.exe", "ffmpeg"]);
  if (manual) return (cachedFfmpeg = manual);
  try {
    // ffmpeg-static：导出值为二进制绝对路径
    const mod = require("ffmpeg-static") as string | null;
    if (mod && fs.existsSync(mod)) return (cachedFfmpeg = mod);
  } catch {
    /* 未安装则走手动兜底 */
  }
  // 兜底：Turbopack 下 require 可能失效，按项目根目录约定路径直接探测
  const cwdFallback = path.join(
    process.cwd(),
    "node_modules",
    "ffmpeg-static",
    process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"
  );
  if (fs.existsSync(cwdFallback)) return (cachedFfmpeg = cwdFallback);
  throw new Error("未找到 ffmpeg 二进制：请确认 ffmpeg-static 安装成功，或手动放置 ffmpeg 到 assets/bin/（见 README）");
}

let cachedYtdlp: string | null = null;
export function resolveYtdlpPath(): string {
  if (cachedYtdlp) return cachedYtdlp;
  const fromEnv = process.env.YTDLP_PATH?.trim();
  if (fromEnv && fs.existsSync(fromEnv)) return (cachedYtdlp = fromEnv);
  const manual = binCandidate(["yt-dlp.exe", "yt-dlp"]);
  if (manual) return (cachedYtdlp = manual);
  // yt-dlp-exec：包内 bin 目录
  try {
    const pkgDir = path.dirname(require.resolve("yt-dlp-exec/package.json"));
    for (const name of process.platform === "win32" ? ["yt-dlp.exe", "yt-dlp"] : ["yt-dlp", "yt-dlp.exe"]) {
      const p = path.join(pkgDir, "bin", name);
      if (fs.existsSync(p)) return (cachedYtdlp = p);
    }
  } catch {
    /* 未安装则走手动兜底 */
  }
  // 兜底：Turbopack 下 require.resolve 可能失效，按项目根目录约定路径直接探测
  for (const name of process.platform === "win32" ? ["yt-dlp.exe", "yt-dlp"] : ["yt-dlp", "yt-dlp.exe"]) {
    const p = path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", name);
    if (fs.existsSync(p)) return (cachedYtdlp = p);
  }
  throw new Error("未找到 yt-dlp 二进制：请确认 yt-dlp-exec 安装成功，或手动下载 yt-dlp 到 assets/bin/（见 README）");
}

/* ---------- 工具 ---------- */

async function run(cmd: string, args: string[], timeoutMs = 240_000): Promise<string> {
  try {
    const { stdout } = await execFileAsync(cmd, args, {
      timeout: timeoutMs,
      maxBuffer: 16 * 1024 * 1024,
      windowsHide: true,
    });
    return stdout;
  } catch (err) {
    const e = err as Error & { stderr?: string; killed?: boolean };
    if (e.killed) throw new Error(`命令执行超时：${path.basename(cmd)}`);
    const detail = (e.stderr || e.message || "").trim().slice(-500);
    throw new Error(`${path.basename(cmd)} 执行失败：${detail}`);
  }
}

/** 解析 ffmpeg -i 输出中的时长（秒） */
async function probeDurationSec(filePath: string): Promise<number> {
  const ffmpeg = resolveFfmpegPath();
  try {
    await execFileAsync(ffmpeg, ["-hide_banner", "-i", filePath], { windowsHide: true });
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr || "";
    const m = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(stderr);
    if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  }
  return 0;
}

function fileSize(p: string): number {
  try {
    return fs.statSync(p).size;
  } catch {
    return 0;
  }
}

/** 直链媒体下载（逐跳 SSRF 校验 + 体积上限） */
async function downloadMedia(url: string, dest: string): Promise<void> {
  let current = (await assertUrlAllowed(url)).toString();
  for (let hop = 0; hop <= 3; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    let res: Response;
    try {
      res = await fetch(current, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36" },
      });
    } catch {
      clearTimeout(timer);
      throw new Error("媒体下载失败：无法连接到目标地址");
    }
    clearTimeout(timer);

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      await res.arrayBuffer().catch(() => undefined);
      if (!loc) throw new Error("媒体下载失败：重定向地址缺失");
      current = (await assertUrlAllowed(new URL(loc, current).toString())).toString();
      continue;
    }
    if (!res.ok) throw new Error(`媒体下载失败：目标返回 ${res.status}`);

    const reader = res.body?.getReader();
    if (!reader) throw new Error("媒体下载失败：响应为空");
    const fd = fs.openSync(dest, "w");
    let total = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_DOWNLOAD_BYTES) {
          throw new Error(`媒体文件超过下载上限（${Math.round(MAX_DOWNLOAD_BYTES / 1024 / 1024)}MB），请改用音频直链或分段链接`);
        }
        fs.writeSync(fd, value);
      }
    } finally {
      fs.closeSync(fd);
    }
    return;
  }
  throw new Error("媒体下载失败：重定向次数过多");
}

/* ---------- 主流程 ---------- */

export interface PreparedAudio {
  /** 待转写的音频分片（mp3 16kHz 单声道） */
  files: string[];
  /** 总时长（秒），直链且无法探测时可能为 0 */
  durationSec: number;
  /** 来源标题（yt-dlp 元数据或文件名） */
  title: string;
  cleanup: () => void;
}

export function isDirectMediaUrl(url: string): boolean {
  try {
    return DIRECT_MEDIA_EXT.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

/**
 * URL → 音频分片：
 * 1. 平台 URL（B 站/YouTube 等）经 yt-dlp 提取音频；直链媒体直接下载
 * 2. ffmpeg 统一转 16kHz 单声道 mp3 64kbps（~0.48MB/分钟）
 * 3. 超过单片上限（时长或体积）按时长切片
 */
export async function prepareAudio(
  url: string,
  chunkMaxSeconds: number,
  chunkMaxBytes: number
): Promise<PreparedAudio> {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "postonce-media-"));
  const cleanup = () => {
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch {
      /* 忽略清理失败 */
    }
  };

  let sourceFile: string;
  let title = "";
  let sourceDurationSec = 0;

  if (isDirectMediaUrl(url)) {
    sourceFile = path.join(workDir, "source" + (path.extname(new URL(url).pathname) || ".bin"));
    await downloadMedia(url, sourceFile);
    title = decodeURIComponent(path.basename(new URL(url).pathname)).replace(/\.[a-z0-9]+$/i, "");
  } else {
    const ytdlp = resolveYtdlpPath();
    const ffmpeg = resolveFfmpegPath();
    const template = path.join(workDir, "audio.%(ext)s");

    // 第一步：只取元数据（--dump-single-json 隐含 skip-download，不会落盘）
    let infoRaw = "";
    try {
      infoRaw = await run(
        ytdlp,
        ["--no-playlist", "--no-warnings", "--dump-single-json", "--skip-download", url],
        60_000
      );
    } catch (err) {
      cleanup();
      const msg = err instanceof Error ? err.message : "yt-dlp 执行失败";
      if (/Unsupported URL|unable to extract/i.test(msg)) {
        throw new Error("暂不支持该链接：目前支持 B 站、YouTube 及常见音视频直链");
      }
      throw new Error(`获取视频信息失败：${msg}`);
    }
    try {
      const info = JSON.parse(infoRaw) as { title?: string; duration?: number };
      title = info.title || "";
      sourceDurationSec = Number(info.duration ?? 0) || 0;
    } catch {
      /* 元数据缺失不致命 */
    }

    // 第二步：下载并提取音频
    try {
      await run(
        ytdlp,
        [
          "--no-playlist",
          "--no-warnings",
          "--extract-audio",
          "--ffmpeg-location",
          path.dirname(ffmpeg),
          "-o",
          template,
          url,
        ],
        300_000
      );
    } catch (err) {
      cleanup();
      throw new Error(`音频提取失败：${err instanceof Error ? err.message : "yt-dlp 执行失败"}`);
    }
    // yt-dlp -o 模板落盘的实际文件
    const candidates = fs
      .readdirSync(workDir)
      .filter((f) => !f.endsWith(".part") && !f.endsWith(".ytdl"))
      .map((f) => path.join(workDir, f))
      .filter((f) => fileSize(f) > 0);
    if (candidates.length === 0) {
      cleanup();
      throw new Error("音频提取失败：未生成音频文件");
    }
    sourceFile = candidates[0];
  }

  // 时长防御
  if (sourceDurationSec <= 0) {
    sourceDurationSec = await probeDurationSec(sourceFile);
  }
  if (sourceDurationSec > MAX_AUDIO_MINUTES * 60) {
    cleanup();
    throw new Error(`音视频时长超过上限（${MAX_AUDIO_MINUTES} 分钟），请截取片段后再试`);
  }

  // 统一压缩：16kHz 单声道 mp3 64kbps
  const ffmpeg = resolveFfmpegPath();
  const mono = path.join(workDir, "mono.mp3");
  try {
    await run(
      ffmpeg,
      ["-y", "-i", sourceFile, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "64k", mono],
      300_000
    );
  } catch (err) {
    cleanup();
    throw err;
  }
  const monoSize = fileSize(mono);
  if (monoSize === 0) {
    cleanup();
    throw new Error("音频转码失败：输出为空");
  }

  // 需要按时长估算（压缩后仍超大时）
  const estSeconds = sourceDurationSec > 0 ? sourceDurationSec : Math.round((monoSize * 8) / 64_000);
  const needSplit =
    estSeconds > chunkMaxSeconds || monoSize > chunkMaxBytes;

  if (!needSplit) {
    return { files: [mono], durationSec: sourceDurationSec, title, cleanup };
  }

  const chunkTime = Math.max(
    60,
    Math.floor(
      Math.min(chunkMaxSeconds, (chunkMaxBytes * 8 * 0.92) / 64_000) 
    )
  );
  const segPattern = path.join(workDir, "chunk-%03d.mp3");
  try {
    await run(
      ffmpeg,
      [
        "-y", "-i", mono,
        "-f", "segment",
        "-segment_time", String(chunkTime),
        "-c", "copy",
        segPattern,
      ],
      300_000
    );
  } catch (err) {
    cleanup();
    throw err;
  }
  const chunks = fs
    .readdirSync(workDir)
    .filter((f) => /^chunk-\d+\.mp3$/.test(f))
    .sort()
    .map((f) => path.join(workDir, f))
    .filter((f) => fileSize(f) > 0);

  if (chunks.length === 0) {
    cleanup();
    throw new Error("音频切片失败：未生成分片");
  }
  return { files: chunks, durationSec: sourceDurationSec, title, cleanup };
}

/** 供本机脚本测试：打印解析到的二进制路径（不输出到日志服务） */
export function mediaBinPaths(): { ffmpeg: string; ytdlp: string } {
  return { ffmpeg: resolveFfmpegPath(), ytdlp: resolveYtdlpPath() };
}
