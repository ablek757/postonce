// README 演示区补拍：03 草稿区视口图 + 04 封面工作台视口图（1280×900）
// 用法：node scripts/shot-readme.mjs（需 dev server 在 :3000；无需 LLM key）
import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = path.join(os.tmpdir(), "postonce-e2e");
const adapt = JSON.parse(fs.readFileSync(path.join(tmp, "launch-adapt.json"), "utf8"));
const understand = JSON.parse(fs.readFileSync(path.join(tmp, "launch-understand.json"), "utf8"));
const content = fs.readFileSync(path.join(tmp, "launch-article.txt"), "utf8");
const { usage: _u, ...analysis } = understand;
const run = {
  id: "shot-seed-1",
  time: Date.now(),
  title: "我开源了一个 AI Agent：一篇文章，30 秒变成五个平台的原生内容",
  doc: { title: "我开源了一个 AI Agent：一篇文章，30 秒变成五个平台的原生内容", content, excerpt: "" },
  analysis,
  results: adapt.results,
};

const OUT = path.join(process.cwd(), "assets", "images");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate((r) => localStorage.setItem("postonce-history", JSON.stringify([r])), run);
await page.reload({ waitUntil: "networkidle" });

await page.getByRole("button", { name: "历史记录" }).click();
await page.getByRole("button", { name: "载入" }).first().click();
await page.getByText("③ 平台草稿", { exact: false }).waitFor({ timeout: 30000 });
await page.waitForTimeout(1500);

// 03：草稿区（小红书卡顶部对齐视口）
let xhs = page.locator('[data-slot="card-title"]', { hasText: "小红书" }).first();
if ((await xhs.count()) === 0) xhs = page.getByText("小红书", { exact: true }).last();
await xhs.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -70));
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(OUT, "03-drafts.png") });
console.log("✓ 03-drafts");

// 04：封面工作台（一键生成三模板后截）
const btn = page.getByRole("button", { name: /一键生成/ });
await btn.scrollIntoViewIfNeeded();
await btn.click();
await page.waitForTimeout(5000);
await page.evaluate(() => window.scrollBy(0, -40));
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "04-cover.png") });
console.log("✓ 04-cover");

await browser.close();
