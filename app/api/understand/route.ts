import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { createModel, resolveLlmConfig } from "@/lib/llm";
import { understandingSchema } from "@/lib/schemas";
import { buildUnderstandPrompt, UNDERSTAND_SYSTEM } from "@/lib/prompts";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { friendlyLlmError } from "@/lib/llm-errors";

const MAX_CONTENT_CHARS = 8000;

const bodySchema = z.object({
  title: z.string().max(500).default(""),
  content: z.string().min(1, "请提供正文内容").max(20000),
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

  const content = Array.from(parsed.data.content)
    .slice(0, MAX_CONTENT_CHARS)
    .join("");

  try {
    const result = await generateObject({
      model: createModel(config),
      schema: understandingSchema,
      system: UNDERSTAND_SYSTEM,
      prompt: buildUnderstandPrompt(parsed.data.title, content),
      temperature: 0.3,
      maxOutputTokens: 4000,
    });

    return NextResponse.json({
      ...result.object,
      usage: {
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
        totalTokens: result.usage.totalTokens ?? 0,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: friendlyLlmError(err) },
      { status: 502 }
    );
  }
}

