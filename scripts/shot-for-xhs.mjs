// 小红书发布用产品截图（900×1200，3:4）：逐区块截取真实 UI
// 用法：DSKEY=sk-xxx node scripts/shot-for-xhs.mjs（需 dev server 在 :3000）
// 产出：C:/Users/13609/postonce-launch/screenshots/
import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const OUT = "C:/Users/13609/postonce-launch/screenshots";
fs.mkdirSync(OUT, { recursive: true });

const article = fs.readFileSync(path.join(os.tmpdir(), "postonce-e2e", "launch-article.txt"), "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 900, height: 1200 },
  deviceScaleFactor: 2,
});

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate((key) => {
  localStorage.setItem(
    "postonce-byok",
    JSON.stringify({ baseURL: "https://api.deepseek.com", apiKey: key, model: "deepseek-chat" })
  );
}, process.env.DSKEY);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1000);

async function shot(name) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, name) });
  console.log("✓", name);
}

// 1. 首页（输入区+三步流程空状态）
await shot("01-首页-输入.png");

// 2. 跑真实流程（发布原文）
await page.fill("#src-title", "我开源了一个 AI Agent：一篇文章，30 秒变成五个平台的原生内容");
await page.fill("#src-content", article);
await page.getByRole("button", { name: "开始理解" }).click();
await page.getByRole("button", { name: /生成草稿/ }).waitFor({ timeout: 90000 });
await page.getByText("所有字段都可以手动修改").scrollIntoViewIfNeeded();
await shot("02-AI理解-可编辑.png");

// 3. 生成五平台草稿
await page.getByRole("button", { name: /生成草稿/ }).click();
await page.getByText("③ 平台草稿", { exact: false }).waitFor({ timeout: 150000 });
await page.waitForFunction(() => !document.querySelector(".animate-spin"), { timeout: 150000 });
await page.waitForTimeout(1500);

// 4. 各平台卡片逐张截
const cards = [
  ["小红书", "03-平台卡-小红书.png"],
  ["公众号", "04-平台卡-公众号.png"],
  ["知乎", "05-平台卡-知乎.png"],
  ["微博", "06-平台卡-微博.png"],
  ["头条", "07-平台卡-头条.png"],
];
for (const [label, file] of cards) {
  let loc = page.locator('[data-slot="card-title"]', { hasText: label }).first();
  if ((await loc.count()) === 0) loc = page.getByText(label, { exact: true }).last();
  await loc.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -60)); // 露出卡片标题栏
  await shot(file);
}

// 5. 封面工作台：生成三模板缩略图
try {
  const btn = page.getByRole("button", { name: /一键生成/ });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(5000);
  await shot("08-封面工作台-三模板.png");
} catch (e) {
  console.log("⚠ 封面工作台跳过:", e.message?.slice(0, 100));
}

await browser.close();
console.log("done →", OUT);
