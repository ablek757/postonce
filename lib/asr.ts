// 可插拔 ASR 抽象：
// - whisper：OpenAI 兼容 POST {baseURL}/audio/transcriptions（multipart 文件上传）
// - qwen-asr：DashScope 兼容模式 chat/completions + input_audio（base64 Data URL）
//   （官方文档：仅 Qwen3-ASR-Flash 系列支持 OpenAI 兼容方式，且不收本地文件路径，需 base64/公网 URL）
import fs from "node:fs";
import path from "node:path";

export type AsrKind = "whisper" | "qwen-asr";

export interface AsrProvider {
  id: string;
  label: string;
  kind: AsrKind;
  baseURL: string;
  apiKey: string;
  model: string;
  /** 单片转写上限：超时长的音频会先按时长切片 */
  chunkMaxSeconds: number;
  /** 单片字节上限（转写前据此再切） */
  chunkMaxBytes: number;
}

interface AsrPreset {
  label: string;
  kind: AsrKind;
  baseURL: string;
  model: string;
  chunkMaxSeconds: number;
  chunkMaxBytes: number;
  envKey: string;
}

const ASR_PRESETS: Record<string, AsrPreset> = {
  // 默认：阿里云百炼 qwen3-asr-flash（同步识别，≤5 分钟/≤10MB 每次 → 保守按 4 分钟切片）
  // 文档：https://help.aliyun.com/zh/model-studio/non-realtime-speech-recognition-user-guide
  dashscope: {
    label: "阿里云百炼 Qwen3-ASR-Flash（默认）",
    kind: "qwen-asr",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3-asr-flash",
    chunkMaxSeconds: 240,
    chunkMaxBytes: 6 * 1024 * 1024,
    envKey: "DASHSCOPE_API_KEY",
  },
  // Groq Whisper（本机网络区域受限，仅作备用预设）
  groq: {
    label: "Groq Whisper",
    kind: "whisper",
    baseURL: "https://api.groq.com/openai/v1",
    model: "whisper-large-v3",
    chunkMaxSeconds: 600,
    chunkMaxBytes: 24 * 1024 * 1024,
    envKey: "GROQ_API_KEY",
  },
  openai: {
    label: "OpenAI Whisper",
    kind: "whisper",
    baseURL: "https://api.openai.com/v1",
    model: "whisper-1",
    chunkMaxSeconds: 600,
    chunkMaxBytes: 24 * 1024 * 1024,
    envKey: "OPENAI_API_KEY",
  },
};

export const DEFAULT_ASR_PROVIDER = "dashscope";

export class AsrConfigError extends Error {}

/**
 * 解析 ASR 配置：
 * 1. ASR_BASE_URL + ASR_API_KEY + ASR_MODEL 全填 → 自定义（协议按 ASR_PROVIDER 推断，默认 whisper 兼容）
 * 2. 否则按 ASR_PROVIDER 预设取密钥（dashscope 预设复用 DASHSCOPE_API_KEY）
 * 未配置 → 抛 AsrConfigError（中文指引）
 */
export function getAsrProvider(): AsrProvider {
  const customBase = process.env.ASR_BASE_URL?.trim();
  const customKey = process.env.ASR_API_KEY?.trim();
  const customModel = process.env.ASR_MODEL?.trim();
  const providerId = process.env.ASR_PROVIDER?.trim() || DEFAULT_ASR_PROVIDER;

  if (customBase && customKey && customModel) {
    if (!/^https?:\/\//i.test(customBase)) {
      throw new AsrConfigError("ASR_BASE_URL 必须是 http(s) 地址");
    }
    const kind: AsrKind =
      providerId === "dashscope" || /dashscope/i.test(customBase) ? "qwen-asr" : "whisper";
    return {
      id: "custom",
      label: `自定义（${providerId}）`,
      kind,
      baseURL: customBase.replace(/\/+$/, ""),
      apiKey: customKey,
      model: customModel,
      chunkMaxSeconds:
        kind === "qwen-asr"
          ? ASR_PRESETS.dashscope.chunkMaxSeconds
          : ASR_PRESETS.openai.chunkMaxSeconds,
      chunkMaxBytes:
        kind === "qwen-asr"
          ? ASR_PRESETS.dashscope.chunkMaxBytes
          : ASR_PRESETS.openai.chunkMaxBytes,
    };
  }

  const preset = ASR_PRESETS[providerId];
  if (!preset) {
    throw new AsrConfigError(`未知的 ASR_PROVIDER「${providerId}」，可选：${Object.keys(ASR_PRESETS).join(" / ")}`);
  }
  const apiKey = process.env[preset.envKey]?.trim();
  if (!apiKey) {
    throw new AsrConfigError(
      `未配置 ASR 密钥：请设置环境变量 ${preset.envKey}（当前预设：${preset.label}），或在 .env.local 中填写 ASR_BASE_URL / ASR_API_KEY / ASR_MODEL 指向自定义服务。百炼密钥获取：https://bailian.console.aliyun.com/`
    );
  }
  return {
    id: providerId,
    label: preset.label,
    kind: preset.kind,
    baseURL: preset.baseURL,
    apiKey,
    model: preset.model,
    chunkMaxSeconds: preset.chunkMaxSeconds,
    chunkMaxBytes: preset.chunkMaxBytes,
  };
}

const CHUNK_TIMEOUT_MS = 120_000;

async function postJson(url: string, apiKey: string, body: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHUNK_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    clearTimeout(timer);
    throw new Error("ASR 服务连接失败，请检查网络或 ASR_BASE_URL 配置");
  }
  clearTimeout(timer);

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (data as { error?: { message?: string }; message?: string })?.error?.message ||
      (data as { message?: string })?.message ||
      `HTTP ${res.status}`;
    if (res.status === 401) throw new Error("ASR API Key 无效或已过期（401），请检查密钥配置");
    if (res.status === 429) throw new Error("ASR 服务限流（429），请稍后重试");
    throw new Error(`ASR 服务返回错误：${msg}`);
  }
  return data;
}

/** whisper 兼容：multipart 上传单个音频文件 → { text } */
async function transcribeWhisper(provider: AsrProvider, filePath: string): Promise<string> {
  const bytes = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1) || "mp3";
  const mime = ext === "mp3" || ext === "mpeg" ? "audio/mpeg" : ext === "wav" ? "audio/wav" : `audio/${ext}`;

  const form = new FormData();
  form.append("model", provider.model);
  form.append("language", "zh");
  form.append("response_format", "json");
  form.append("file", new Blob([new Uint8Array(bytes)], { type: mime }), `audio.${ext}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHUNK_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${provider.baseURL}/audio/transcriptions`, {
      method: "POST",
      signal: controller.signal,
      headers: { authorization: `Bearer ${provider.apiKey}` },
      body: form,
    });
  } catch {
    clearTimeout(timer);
    throw new Error("ASR 服务连接失败，请检查网络或 ASR_BASE_URL 配置");
  }
  clearTimeout(timer);

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`;
    if (res.status === 401) throw new Error("ASR API Key 无效或已过期（401），请检查密钥配置");
    throw new Error(`ASR 服务返回错误：${msg}`);
  }
  const text = (data as { text?: string })?.text?.trim();
  if (!text) throw new Error("ASR 服务返回了空文本");
  return text;
}

/** DashScope 兼容模式：qwen3-asr-flash，base64 Data URL 作为 input_audio */
async function transcribeQwenAsr(provider: AsrProvider, filePath: string): Promise<string> {
  const base64 = fs.readFileSync(filePath).toString("base64");
  const data = await postJson(`${provider.baseURL}/chat/completions`, provider.apiKey, {
    model: provider.model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "input_audio",
            input_audio: { data: `data:audio/mpeg;base64,${base64}` },
          },
        ],
      },
    ],
    stream: false,
    asr_options: { enable_itn: true },
  });
  const text = (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("ASR 服务返回了空文本");
  return text;
}

async function transcribeChunk(provider: AsrProvider, filePath: string): Promise<string> {
  return provider.kind === "qwen-asr"
    ? transcribeQwenAsr(provider, filePath)
    : transcribeWhisper(provider, filePath);
}

/** 依次转写所有分片并拼接（顺序执行，规避并行限流） */
export async function transcribeAudio(
  provider: AsrProvider,
  files: string[]
): Promise<{ text: string }> {
  const parts: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const text = await transcribeChunk(provider, files[i]);
    parts.push(text);
  }
  const text = parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join("\n\n");
  if (!text) throw new Error("转写结果为空");
  return { text };
}
