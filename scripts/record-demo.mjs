// 录制 README 演示视频：完整跑一遍「输入 → 理解 → 五平台草稿 → 封面」
// 用法：DSKEY=sk-xxx node scripts/record-demo.mjs（需 dev server 在 :3000）
// 产出：$TEMP/postonce-video/*.webm（后续用 ffmpeg 转 GIF）
import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const article = fs.readFileSync(
  path.join(os.tmpdir(), "postonce-e2e", "launch-article.txt"),
  "utf8"
);
const videoDir = path.join(os.tmpdir(), "postonce-video");
fs.rmSync(videoDir, { recursive: true, force: true });
fs.mkdirSync(videoDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate((key) => {
  localStorage.setItem(
    "postonce-byok",
    JSON.stringify({ baseURL: "https://api.deepseek.com", apiKey: key, model: "deepseek-chat" })
  );
}, process.env.DSKEY);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// ① 输入
await page.fill("#src-title", "我开源了一个 AI Agent：一篇文章，30 秒变成五个平台的原生内容");
await page.locator("#src-content").click();
await page.locator("#src-content").pressSequentially(article.slice(0, 60), { delay: 25 });
await page.fill("#src-content", article); // 剩余部分快速填完
await page.waitForTimeout(600);
await page.getByRole("button", { name: "开始理解" }).click();

// ② 理解结果
await page.getByRole("button", { name: /生成草稿/ }).waitFor({ timeout: 90000 });
await page.getByText("所有字段都可以手动修改").scrollIntoViewIfNeeded();
await page.waitForTimeout(2000);

// ③ 生成五平台草稿
await page.getByRole("button", { name: /生成草稿/ }).click();
await page.waitForTimeout(1500);
await page.getByText("③ 平台草稿", { exact: false }).waitFor({ timeout: 150000 });
await page.waitForFunction(() => !document.querySelector(".animate-spin"), { timeout: 150000 });
await page.waitForTimeout(1200);

// 缓慢滚动展示五张卡片
for (let y = 0; y <= 4; y++) {
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(900);
}

// ④ 封面
try {
  const btn = page.getByRole("button", { name: "生成封面" });
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await btn.click();
  await page.waitForTimeout(4500);
} catch (e) {
  console.log("封面步骤跳过:", e.message?.slice(0, 100));
}
await page.waitForTimeout(1000);

await context.close(); // 触发视频落盘
await browser.close();

const files = fs.readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
console.log("video:", files.map((f) => path.join(videoDir, f)).join("\n"));
