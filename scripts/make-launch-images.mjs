// 生成小红书内图（900×1200）：痛点对比 / 流程图 / 数据透明 / 开源 CTA
// 用法：node scripts/make-launch-images.mjs
import fs from "node:fs";
import path from "node:path";
import { createElement as el } from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// 字体直接就地加载（避免 import lib/cover.ts 带来的扩展名解析问题）
function loadFonts() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  return [
    { name: "PostOnceCJK", data: fs.readFileSync(path.join(dir, "NotoSansSC-Regular.ttf")), weight: 400, style: "normal" },
    { name: "PostOnceCJK", data: fs.readFileSync(path.join(dir, "NotoSansSC-Bold.ttf")), weight: 700, style: "normal" },
  ];
}

const OUT = "C:/Users/13609/postonce-launch/images";
fs.mkdirSync(OUT, { recursive: true });
const W = 900;
const H = 1200;
const F = "PostOnceCJK";

const div = (style, ...children) => el("div", { style }, ...children);

async function render(name, node) {
  const svg = await satori(node, { width: W, height: H, fonts: loadFonts() });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W }, background: "#ffffff" })
    .render()
    .asPng();
  fs.writeFileSync(path.join(OUT, name), Buffer.from(png));
  console.log("✓", name);
}

const badge = (text, bg, color) =>
  div(
    {
      display: "flex",
      alignSelf: "flex-start",
      backgroundColor: bg,
      color,
      borderRadius: 999,
      padding: "10px 28px",
      fontSize: 30,
      fontWeight: 700,
      fontFamily: F,
    },
    text
  );

/* ---------- 图 2：痛点对比 ---------- */
await render(
  "图2-痛点对比.png",
  div(
    {
      width: W,
      height: H,
      display: "flex",
      flexDirection: "column",
      padding: 72,
      backgroundColor: "#FAFAF7",
      fontFamily: F,
    },
    div({ fontSize: 34, color: "#9c9c9c", marginBottom: 16 }, "做自媒体的都懂"),
    div(
      { fontSize: 62, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3, marginBottom: 56 },
      "一篇文章发五个平台，要多久？"
    ),
    // 传统方式
    div(
      {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        border: "2px solid #e5e5e5",
        borderRadius: 24,
        padding: 48,
        marginBottom: 32,
      },
      div({ fontSize: 30, color: "#dc2626", marginBottom: 12 }, "× 传统方式"),
      div({ fontSize: 44, fontWeight: 700, color: "#dc2626", marginBottom: 8 }, "同一篇内容改 5 遍"),
      div({ fontSize: 30, color: "#525252", lineHeight: 1.6 }, "排版 / 配图 / 调格式 / 各平台规则"),
      div({ fontSize: 56, fontWeight: 700, color: "#dc2626", marginTop: 16 }, "≈ 2 小时")
    ),
    // PostOnce
    div(
      {
        display: "flex",
        flexDirection: "column",
        backgroundImage: "linear-gradient(135deg, #6D28D9 0%, #DB2777 100%)",
        borderRadius: 24,
        padding: 48,
      },
      div({ fontSize: 30, color: "rgba(255,255,255,0.95)", marginBottom: 12 }, "√ 用 PostOnce"),
      div({ fontSize: 44, fontWeight: 700, color: "#ffffff", marginBottom: 8 }, "丢进去，五平台草稿全出"),
      div({ fontSize: 30, color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }, "标题 / 正文 / 标签 / 封面，可编辑"),
      div({ fontSize: 56, fontWeight: 700, color: "#ffffff", marginTop: 16 }, "30 秒")
    )
  )
);

/* ---------- 图 3：流程图 ---------- */
await render(
  "图3-工作流程.png",
  div(
    {
      width: W,
      height: H,
      display: "flex",
      flexDirection: "column",
      padding: 72,
      backgroundColor: "#1F2430",
      fontFamily: F,
    },
    div({ fontSize: 34, color: "#F5C518", marginBottom: 16 }, "PostOnce 工作流"),
    div(
      { fontSize: 58, fontWeight: 700, color: "#ffffff", lineHeight: 1.3, marginBottom: 64 },
      "写一次，发全网"
    ),
    ...[
      ["① 输入", "粘贴文本 / 网页链接 / B 站·播客视频"],
      ["② AI 结构化理解", "总结 · 要点 · 读者画像 · 金句，全程可编辑"],
      ["③ 五平台草稿", "小红书 · 公众号 · 知乎 · 微博 · 头条，并行出稿"],
      ["④ 模板封面", "3:4 大字封面，3 套模板秒出 PNG"],
    ].flatMap(([t, d], i, arr) => [
      div(
        {
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: 20,
          padding: "36px 44px",
        },
        div({ fontSize: 38, fontWeight: 700, color: "#F5C518", marginBottom: 8 }, t),
        div({ fontSize: 30, color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }, d)
      ),
      ...(i < arr.length - 1
        ? [div({ fontSize: 36, color: "#F5C518", alignSelf: "center", margin: "14px 0" }, "↓")]
        : []),
    ])
  )
);

/* ---------- 图 4：数据透明 ---------- */
await render(
  "图4-透明账本.png",
  div(
    {
      width: W,
      height: H,
      display: "flex",
      flexDirection: "column",
      padding: 72,
      backgroundColor: "#FAFAF7",
      fontFamily: F,
    },
    div({ fontSize: 34, color: "#9c9c9c", marginBottom: 16 }, "不玩黑盒"),
    div(
      { fontSize: 58, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3, marginBottom: 56 },
      "每一分钱都算给你看"
    ),
    ...[
      ["¥0.002", "单次五平台生成成本（DeepSeek）"],
      ["30 秒", "从粘贴到五平台草稿"],
      ["5 个", "平台原生格式并行出稿"],
      ["100%", "token 用量实时显示"],
    ].flatMap(([num, desc], i) => [
      div(
        {
          display: "flex",
          alignItems: "baseline",
          backgroundColor: "#ffffff",
          border: "2px solid #e5e5e5",
          borderRadius: 20,
          padding: "36px 44px",
          marginBottom: i < 3 ? 24 : 0,
        },
        div({ fontSize: 64, fontWeight: 700, color: "#DB2777", marginRight: 32 }, num),
        div({ fontSize: 30, color: "#525252", lineHeight: 1.5 }, desc)
      ),
    ])
  )
);

/* ---------- 图 5：开源 CTA ---------- */
await render(
  "图5-开源CTA.png",
  div(
    {
      width: W,
      height: H,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 72,
      backgroundImage: "linear-gradient(135deg, #6D28D9 0%, #DB2777 100%)",
      fontFamily: F,
    },
    div(
      { display: "flex", flexDirection: "column" },
      badge("开源 · Apache 2.0", "rgba(255,255,255,0.18)", "#ffffff"),
      div(
        { fontSize: 64, fontWeight: 700, color: "#ffffff", lineHeight: 1.3, marginTop: 48 },
        "写一次，发全网"
      ),
      div(
        { display: "flex", flexDirection: "column", marginTop: 32 },
        ...[
          "GitHub 搜索 PostOnce",
          "克隆 → npm install → 填个 key",
          "三分钟跑起来",
        ].map((line) =>
          div({ fontSize: 34, color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }, line)
        )
      )
    ),
    div(
      { display: "flex", flexDirection: "column" },
      ...[
        "Next.js 16 · Vercel AI SDK · satori · yt-dlp + ASR",
        "GLM / DeepSeek / 通义 / Kimi / OpenAI 可插拔",
      ].map((line) =>
        div({ fontSize: 28, color: "rgba(255,255,255,0.75)", lineHeight: 1.8 }, line)
      ),
      div({ fontSize: 40, fontWeight: 700, color: "#ffffff", marginTop: 32 }, "★ 求 Star，欢迎二开")
    )
  )
);

console.log("done →", OUT);
