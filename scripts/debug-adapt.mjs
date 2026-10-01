// 调试用：直接调 DeepSeek 复现 generateObject schema 失败，打印原始响应与 zod 校验细节
// 用法：DSKEY=sk-xxx node scripts/debug-adapt.mjs
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateObject } from "ai";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAdaptPrompt } from "../lib/prompts.ts";
import { xiaohongshuDraftSchema } from "../lib/schemas.ts";

const content = fs.readFileSync(
  path.join(os.tmpdir(), "postonce-e2e", "article.txt"),
  "utf8"
);
const analysis = {
  summary: "作者把收藏 AI 工具的习惯改成串联流水线，发布效率大幅提升。",
  keyPoints: ["工具越多越低效", "只有提炼观点需要人做", "全流程从三小时压到四十分钟"],
  audience: "内容创作者与自媒体人",
  tone: "理性干货",
  goldenQuotes: ["工具是点，流程是线。"],
};

const provider = createOpenAICompatible({
  name: "deepseek",
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DSKEY,
});

try {
  const r = await generateObject({
    model: provider.chatModel("deepseek-chat"),
    schema: xiaohongshuDraftSchema,
    prompt: buildAdaptPrompt("xiaohongshu", "我为什么放弃了收藏 AI 工具，改用一条流水线", content, analysis),
    temperature: 0.7,
    maxOutputTokens: 8000,
  });
  console.log("OK:", JSON.stringify(r.object).slice(0, 500));
} catch (e) {
  console.log("name:", e.name);
  console.log("message:", e.message);
  if (e.text) console.log("\n===== RAW TEXT 前 2000 字 =====\n" + e.text.slice(0, 2000));
  if (e.cause) console.log("\n===== CAUSE =====\n" + JSON.stringify(e.cause, null, 2).slice(0, 2000));
}
