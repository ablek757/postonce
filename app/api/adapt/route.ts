import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { createModel, resolveLlmConfig } from "@/lib/llm";
import { platformDraftSchemas } from "@/lib/schemas";
import { buildAdaptPrompt } from "@/lib/prompts";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { PLATFORM_IDS, type ContentAnalysis, type PlatformId, type PlatformResult } from "@/lib/types";
import { friendlyLlmError } from "@/lib/llm-errors";

const MAX_CONTENT_CHARS = 8000;

const analysisSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  audience: z.string(),
  tone: z.string(),
  goldenQuotes: z.array(z.string()),
});

const bodySchema = z.object({
  title: z.string().max(500).default(""),
  content: z.string().min(1, "请提供正文内容").max(20000),
  analysis: analysisSchema,
  platforms: z
    .array(z.enum(["xiaohongshu", "gongzhonghao"] as const))
    .min(1, "请至少选择一个平台")
    .max(2),
});

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

  const config = resolveLlmConfig(req.headers);
  if (!config) {
    return NextResponse.json(
      {
        error:
          "服务端未配置模型 API Key，且请求未携带自定义模型配置。请在 .env.local 中设置 MODEL_PROVIDER 与对应密钥，或在前端设置面板中填写自己的 baseURL / API Key / 模型名。",
      },
      { status: 401 }
    );
  }

  const { title, analysis } = parsed.data;
  const content = Array.from(parsed.data.content)
    .slice(0, MAX_CONTENT_CHARS)
    .join("");
  const platforms = parsed.data.platforms.filter((p): p is PlatformId =>
    (PLATFORM_IDS as string[]).includes(p)
  );

  const model = createModel(config);

  // 各平台并行生成，单平台失败不影响其他平台
  const settled = await Promise.allSettled(
    platforms.map(async (platform) => {
      const result = await generateObject({
        model,
        schema: platformDraftSchemas[platform],
        prompt: buildAdaptPrompt(platform, title, content, analysis as ContentAnalysis),
        temperature: 0.7,
      });
      return {
        platform,
        data: result.object,
        usage: {
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
          totalTokens: result.usage.totalTokens ?? 0,
        },
      };
    })
  );

  const results: PlatformResult[] = settled.map((outcome, i) => {
    const platform = platforms[i];
    if (outcome.status === "fulfilled") {
      return {
        platform,
        ok: true,
        data: outcome.value.data as PlatformResult["data"],
        usage: outcome.value.usage,
      };
    }
    return {
      platform,
      ok: false,
      error: friendlyLlmError(outcome.reason),
    };
  });

  const totalUsage = results.reduce(
    (acc, r) => ({
      inputTokens: acc.inputTokens + (r.usage?.inputTokens ?? 0),
      outputTokens: acc.outputTokens + (r.usage?.outputTokens ?? 0),
      totalTokens: acc.totalTokens + (r.usage?.totalTokens ?? 0),
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
  );

  // 全部平台都失败 → 整体报错；部分失败 → 200 + 分平台错误（前端分开展示+重试）
  const allFailed = results.length > 0 && results.every((r) => !r.ok);
  if (allFailed) {
    return NextResponse.json(
      { error: results[0].error || "生成失败", results },
      { status: 502 }
    );
  }

  return NextResponse.json({ results, usage: totalUsage });
}
