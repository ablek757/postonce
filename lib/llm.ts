import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

export interface LlmConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

export interface ProviderPreset {
  label: string;
  baseURL: string;
  model: string;
  /** 对应 .env.local 里的环境变量名 */
  envKey: string;
}

export const PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  glm: {
    label: "智谱 GLM（默认，glm-4-flash 免费）",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash",
    envKey: "GLM_API_KEY",
  },
  deepseek: {
    label: "DeepSeek",
    baseURL: "https://api.deepseek.com",
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
  },
  qwen: {
    label: "通义千问",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
    envKey: "DASHSCOPE_API_KEY",
  },
  kimi: {
    label: "Kimi（Moonshot）",
    baseURL: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
    envKey: "MOONSHOT_API_KEY",
  },
  openai: {
    label: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    envKey: "OPENAI_API_KEY",
  },
};

export const DEFAULT_PROVIDER = "glm";

export function getServerProviderId(): string {
  const id = process.env.MODEL_PROVIDER;
  return id && PROVIDER_PRESETS[id] ? id : DEFAULT_PROVIDER;
}

/** 返回当前服务端预设（不含密钥），供 /api/config 告知前端 */
export function getServerProviderInfo() {
  const id = getServerProviderId();
  const preset = PROVIDER_PRESETS[id];
  return {
    provider: id,
    providerLabel: preset.label,
    model: preset.model,
    keyConfigured: Boolean(process.env[preset.envKey]?.trim()),
  };
}

function normalizeBaseURL(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * 从请求头解析模型配置。
 * 优先级：BYOK 自定义 header > 服务端预设。
 * 返回 null 表示完全无可用配置（无 key）。
 */
export function resolveLlmConfig(headers: Headers): LlmConfig | null {
  const byokBase = headers.get("x-postonce-base-url")?.trim();
  const byokKey = headers.get("x-postonce-api-key")?.trim();
  const byokModel = headers.get("x-postonce-model")?.trim();

  if (byokBase && byokKey && byokModel) {
    if (
      !/^https?:\/\//i.test(byokBase) ||
      byokBase.includes("localhost") ||
      byokBase.includes("127.0.0.1")
    ) {
      // BYOK 只允许 http(s) 且不允许指向本机
      return null;
    }
    return {
      baseURL: normalizeBaseURL(byokBase),
      apiKey: byokKey,
      model: byokModel,
    };
  }

  const preset = PROVIDER_PRESETS[getServerProviderId()];
  const apiKey = process.env[preset.envKey]?.trim();
  if (!apiKey) return null;
  return { baseURL: preset.baseURL, apiKey, model: preset.model };
}

export function createModel(config: LlmConfig): LanguageModel {
  const provider = createOpenAICompatible({
    name: "postonce",
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });
  return provider.chatModel(config.model);
}
