import { NextResponse } from "next/server";
import { z } from "zod";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { fetchWebPage, SsrfError } from "@/lib/ssrf";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const bodySchema = z.object({
  url: z.string().min(1, "请提供链接").max(2048),
});

function htmlToText(html: string): string {
  // 先在块级元素结束标签处补换行，避免 textContent 把段落拼成一行
  const withBreaks = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<br[^>]*>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|section|article|tr|table)>/gi, "\n");
  const dom = new JSDOM(withBreaks);
  const text = dom.window.document.body.textContent || "";
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t 　]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function POST(req: Request) {
  const rl = checkRateLimit(getClientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      { error: `请求过于频繁，已达每日上限（${rl.limit} 次），请明天再试` },
      { status: 429, headers: { "x-ratelimit-remaining": "0" } }
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
    const { html, finalUrl } = await fetchWebPage(parsed.data.url);

    const dom = new JSDOM(html, { url: finalUrl });
    const article = new Readability(dom.window.document).parse();

    if (!article || (!article.content && !article.textContent)) {
      return NextResponse.json(
        { error: "无法从该页面提取正文，可能不是文章类网页，请改用粘贴文本" },
        { status: 422 }
      );
    }

    const title = (article.title || article.siteName || "").trim();
    const contentHtml = article.content || "";
    const content = htmlToText(contentHtml);

    if (content.length < 50) {
      return NextResponse.json(
        { error: "提取到的正文过短，可能不是文章类网页，请改用粘贴文本" },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        title,
        content: content.slice(0, 20000),
        excerpt: (article.excerpt || content.slice(0, 120)).slice(0, 300),
        sourceUrl: finalUrl,
      },
      { headers: { "x-ratelimit-remaining": String(rl.remaining) } }
    );
  } catch (err) {
    if (err instanceof SsrfError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "网页抓取失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
