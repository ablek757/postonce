// 平台卡片元素级截图（localStorage 历史种子，零 LLM 消耗）
// 用法：node scripts/shot-cards.mjs（需 dev server 在 :3000）
// 产出：C:/Users/13609/postonce-launch/screenshots/
import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const OUT = "C:/Users/13609/postonce-launch/screenshots";
const tmp = path.join(os.tmpdir(), "postonce-e2e");

// 从历史产物构造 HistoryRun
const adapt = JSON.parse(fs.readFileSync(path.join(tmp, "launch-adapt.json"), "utf8"));
const understand = JSON.parse(fs.readFileSync(path.join(tmp, "launch-understand.json"), "utf8"));
const content = fs.readFileSync(path.join(tmp, "launch-article.txt"), "utf8");
const { usage: _u1, ...analysis } = understand;
const run = {
  id: "shot-seed-1",
  time: Date.now(),
  title: "我开源了一个 AI Agent：一篇文章，30 秒变成五个平台的原生内容",
  doc: { title: "我开源了一个 AI Agent：一篇文章，30 秒变成五个平台的原生内容", content, excerpt: "" },
  analysis,
  results: adapt.results,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate((r) => {
  localStorage.setItem("postonce-history", JSON.stringify([r]));
}, run);
await page.reload({ waitUntil: "networkidle" });

// 打开历史记录并载入
await page.getByRole("button", { name: "历史记录" }).click();
await page.getByRole("button", { name: "载入" }).first().click();
await page.getByText("③ 平台草稿", { exact: false }).waitFor({ timeout: 30000 });
await page.waitForTimeout(1500);

const cards = [
  ["小红书", "03-平台卡-小红书.png"],
  ["公众号", "04-平台卡-公众号.png"],
  ["知乎", "05-平台卡-知乎.png"],
  ["微博", "06-平台卡-微博.png"],
  ["头条", "07-平台卡-头条.png"],
];
for (const [label, file] of cards) {
  let title = page.locator('[data-slot="card-title"]', { hasText: label }).first();
  if ((await title.count()) === 0) title = page.getByText(label, { exact: true }).last();
  const card = title.locator('xpath=ancestor::*[contains(@class,"bg-card")][1]');
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await card.screenshot({ path: path.join(OUT, file) });
  console.log("✓", file);
}

await browser.close();
console.log("done →", OUT);
