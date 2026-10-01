import { NextResponse } from "next/server";
import { z } from "zod";
import { assertUrlAllowed, SsrfError } from "@/lib/ssrf";
import { isDirectMediaUrl, prepareAudio } from "@/lib/media";
import { AsrConfigError, getAsrProvider, transcribeAudio } from "@/lib/asr";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

// 提取 + 转写是长任务，放宽到 5 分钟（自托管可继续上调）
export const maxDuration = 300;

const bodySchema = z.object({
  url: z.string().min(1, "请提供视频/播客链接").max(2048),
});

/** 支持的平台域名白名单（可经 MEDIA_EXTRA_HOSTS 追加，逗号分隔） */
const PLATFORM_HOSTS = [
  "bilibili.com",
  "b23.tv",
  "youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
];

function isAllowedMediaHost(hostname: string): boolean {
  const all = [
    ...PLATFORM_HOSTS,
    ...(process.env.MEDIA_EXTRA_HOSTS?.split(",").map((h) => h.trim()).filter(Boolean) ?? []),
  ];
  return all.some((h) => hostname === h || hostname.endsWith(`.${h}`));
}

export async function POST(req: Request) {
  const rl = checkRateLimit(getClientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      { error: `请求过于频繁，已达每日上限（${rl.limit} 次），请明天再试` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法的 JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数错误" },
      { status: 400 }
    );
  }

  // 1) URL 校验（协议 + SSRF）
  let url: URL;
  try {
    url = await assertUrlAllowed(parsed.data.url);
  } catch (err) {
    if (err instanceof SsrfError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "链接格式不正确" }, { status: 400 });
  }

  // 2) 平台白名单：平台链接需命中白名单；音视频直链跳过
  if (!isDirectMediaUrl(url.toString()) && !isAllowedMediaHost(url.hostname.toLowerCase())) {
    return NextResponse.json(
      { error: "暂不支持该链接：目前支持 B 站、YouTube，或直接粘贴 .mp3/.m4a/.wav/.mp4 等音视频直链" },
      { status: 400 }
    );
  }

  // 3) ASR 配置（先校验，避免下载完才发现没 key）
  let provider;
  try {
    provider = getAsrProvider();
  } catch (err) {
    if (err instanceof AsrConfigError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "ASR 配置错误" }, { status: 500 });
  }

  // 4) 提取音频（含切片）
  let prepared;
  try {
    prepared = await prepareAudio(
      url.toString(),
      provider.chunkMaxSeconds,
      provider.chunkMaxBytes
    );
  } catch (err) {
    if (err instanceof SsrfError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "音频提取失败" },
      { status: 502 }
    );
  }

  // 5) 转写 + 清理
  try {
    const { text } = await transcribeAudio(provider, prepared.files);
    const content = text.replace(/\r/g, "").trim();
    if (content.length < 2) {
      return NextResponse.json({ error: "转写结果为空，请换一条音视频试试" }, { status: 422 });
    }
    const title = prepared.title || "音视频转写稿";
    return NextResponse.json({
      title,
      content: content.slice(0, 50000),
      excerpt: content.slice(0, 120),
      sourceUrl: url.toString(),
      duration: Math.round(prepared.durationSec),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "转写失败" },
      { status: 502 }
    );
  } finally {
    prepared.cleanup();
  }
}
