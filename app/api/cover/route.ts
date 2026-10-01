import { NextResponse } from "next/server";
import { z } from "zod";
import { renderCoverPng } from "@/lib/cover";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { COVER_TEMPLATES, type CoverTemplateId } from "@/lib/types";

// 封面渲染涉及字体加载，放宽 serverless 上限（秒）
export const maxDuration = 30;

const bodySchema = z.object({
  template: z.enum(["solid", "gradient", "split"] as const),
  main: z.string().min(1, "请提供封面主标题").max(60),
  sub: z.string().max(120).default(""),
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

  try {
    const png = await renderCoverPng(
      parsed.data.template as CoverTemplateId,
      parsed.data.main,
      parsed.data.sub
    );
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store",
        "x-ratelimit-remaining": String(rl.remaining),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "封面渲染失败";
    const status = message.includes("字体") ? 500 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  return NextResponse.json({
    templates: COVER_TEMPLATES,
    width: 900,
    height: 1200,
  });
}
