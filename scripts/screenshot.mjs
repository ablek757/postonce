// README 演示截图 + UI 级端到端验证
// 用法：DSKEY=sk-xxx node scripts/screenshot.mjs（需要 dev server 运行在 :3000）
import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const outDir = path.join(process.cwd(), "docs", "images");
fs.mkdirSync(outDir, { recursive: true });

const article = fs.readFileSync(
  path.join(os.tmpdir(), "postonce-e2e", "article.txt"),
  "utf8"
);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});

// BYOK 配置（与前端 localStorage 约定一致）
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate((key) => {
  localStorage.setItem(
    "postonce-byok",
    JSON.stringify({ baseURL: "https://api.deepseek.com", apiKey: key, model: "deepseek-chat" })
  );
}, process.env.DSKEY);
await page.reload({ waitUntil: "networkidle" });

await page.screenshot({ path: path.join(outDir, "01-input.png") });
console.log("✓ 01-input");

// ① 输入 → 开始理解
await page.fill("#src-title", "我为什么放弃了收藏 AI 工具，改用一条流水线");
await page.fill("#src-content", article);
await page.getByRole("button", { name: "开始理解" }).click();
await page.getByRole("button", { name: /生成草稿/ }).waitFor({ timeout: 90000 });
await page.getByText("所有字段都可以手动修改").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, "02-analysis.png") });
console.log("✓ 02-analysis");

// ② 生成平台草稿（M3 起按钮文案为「生成草稿（N 个平台）」）
await page.getByRole("button", { name: /生成草稿/ }).click();
await page.getByText("③ 平台草稿", { exact: false }).waitFor({ timeout: 120000 });
await page.waitForFunction(() => !document.querySelector(".animate-spin"), { timeout: 120000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(outDir, "03-drafts.png"), fullPage: true });
console.log("✓ 03-drafts");

// ③ 封面工作台（尽力而为，失败不阻塞）
try {
  const btn = page.getByRole("button", { name: "生成封面" });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(outDir, "04-cover.png"), fullPage: true });
  console.log("✓ 04-cover");
} catch (e) {
  console.log("⚠ 04-cover skipped:", e.message?.slice(0, 120));
}

await browser.close();
console.log("done → docs/images/");
