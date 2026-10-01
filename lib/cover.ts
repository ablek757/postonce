import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement as el } from "react";
import satori from "satori";
import type { SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { COVER_HEIGHT, COVER_WIDTH, type CoverTemplateId } from "./types";

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const FONT_FAMILY = "PostOnceCJK";

const REGULAR_CANDIDATES = [
  "NotoSansSC-Regular.ttf",
  "AlibabaPuHuiTi-3-55-Regular.ttf",
  "SourceHanSansSC-Regular.otf",
  "NotoSansSC.ttf",
];
const BOLD_CANDIDATES = [
  "NotoSansSC-Bold.ttf",
  "AlibabaPuHuiTi-3-85-Bold.ttf",
  "SourceHanSansSC-Bold.otf",
];

let fontCache: SatoriOptions["fonts"] | null = null;

function findFontFile(candidates: string[]): string | null {
  for (const name of candidates) {
    const p = path.join(FONT_DIR, name);
    if (existsSync(p)) return p;
  }
  return null;
}

/** 加载 CJK 字体；找不到任何字体时抛错（README 有人工放置说明） */
export function loadFonts(): NonNullable<SatoriOptions["fonts"]> {
  if (fontCache) return fontCache;

  const regularPath = findFontFile(REGULAR_CANDIDATES);
  const boldPath = findFontFile(BOLD_CANDIDATES) ?? regularPath;
  if (!regularPath || !boldPath) {
    throw new Error(
      "未找到中文字体文件：请将 NotoSansSC-Regular.ttf 与 NotoSansSC-Bold.ttf 放入 assets/fonts/ 目录（见 README 字体说明）"
    );
  }

  fontCache = [
    { name: FONT_FAMILY, data: readFileSync(regularPath), weight: 400, style: "normal" },
    { name: FONT_FAMILY, data: readFileSync(boldPath), weight: 700, style: "normal" },
  ];
  return fontCache;
}

function cleanText(input: string, max: number): string {
  return input
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const T = {
  div: "div",
  span: "span",
} as const;

/** 估算文字宽度（CJK≈1em，ASCII≈0.55em），把主标题折成均衡的两行，避免孤字 */
function splitMain(main: string, fontSize: number, maxWidth: number): string[] {
  const chars = Array.from(main);
  const units = chars.map((ch) => (/[^\x00-\xff]/.test(ch) ? 1 : 0.55));
  const total = units.reduce((a, b) => a + b, 0);
  const perLine = maxWidth / fontSize;
  if (total <= perLine * 1.05) return [main];
  let acc = 0;
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 0; i < chars.length - 1; i++) {
    acc += units[i];
    if (acc > perLine) break;
    const d = Math.abs(acc - total / 2);
    if (d < bestDiff) {
      bestDiff = d;
      best = i + 1;
    }
  }
  return [chars.slice(0, best).join(""), chars.slice(best).join("")];
}

/** 主标题按行渲染（自动均衡折行） */
function mainEls(
  main: string,
  fontSize: number,
  maxWidth: number,
  style: Record<string, unknown>
) {
  return splitMain(main, fontSize, maxWidth).map((line, i) =>
    el(T.div, { key: i, style }, line)
  );
}

/* ---------- 模板 1：纯色大字版 ---------- */
function SolidTemplate(main: string, sub: string) {
  const mainStyle = {
    fontSize: 104,
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.25,
    letterSpacing: 2,
    fontFamily: FONT_FAMILY,
  };
  return el(
    T.div,
    {
      style: {
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        backgroundColor: "#FF2442",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 90,
        position: "relative",
      },
    },
    el(T.div, {
      style: {
        position: "absolute",
        top: 36,
        left: 36,
        width: COVER_WIDTH - 72,
        height: COVER_HEIGHT - 72,
        border: "3px solid rgba(255,255,255,0.55)",
      },
    }),
    ...mainEls(main, 104, COVER_WIDTH - 180, mainStyle),
    el(T.div, {
      style: { width: 120, height: 10, backgroundColor: "#ffffff", marginTop: 48 },
    }),
    el(
      T.div,
      {
        style: {
          fontSize: 40,
          fontWeight: 400,
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1.5,
          marginTop: 40,
          fontFamily: FONT_FAMILY,
        },
      },
      sub
    )
  );
}

/* ---------- 模板 2：渐变版 ---------- */
function GradientTemplate(main: string, sub: string) {
  const mainStyle = {
    fontSize: 108,
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.25,
    fontFamily: FONT_FAMILY,
    textShadow: "0 6px 24px rgba(0,0,0,0.25)",
  };
  return el(
    T.div,
    {
      style: {
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        backgroundImage: "linear-gradient(135deg, #6D28D9 0%, #DB2777 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        position: "relative",
      },
    },
    el(
      T.div,
      {
        style: {
          position: "absolute",
          top: 70,
          left: 96,
          fontSize: 28,
          color: "rgba(255,255,255,0.85)",
          border: "2px solid rgba(255,255,255,0.6)",
          borderRadius: 999,
          padding: "10px 28px",
          fontFamily: FONT_FAMILY,
        },
      },
      "精选干货"
    ),
    ...mainEls(main, 108, COVER_WIDTH - 192, mainStyle),
    el(
      T.div,
      {
        style: {
          fontSize: 42,
          fontWeight: 400,
          color: "rgba(255,255,255,0.9)",
          lineHeight: 1.5,
          marginTop: 44,
          fontFamily: FONT_FAMILY,
        },
      },
      sub
    ),
    el(T.div, {
      style: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: COVER_WIDTH,
        height: 14,
        backgroundColor: "rgba(255,255,255,0.85)",
      },
    })
  );
}

/* ---------- 模板 3：左右分栏版 ---------- */
function SplitTemplate(main: string, sub: string) {
  const mainStyle = {
    fontSize: 88,
    fontWeight: 700,
    color: "#1F2430",
    lineHeight: 1.3,
    fontFamily: FONT_FAMILY,
  };
  return el(
    T.div,
    {
      style: {
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        backgroundColor: "#F7F3EE",
        display: "flex",
        flexDirection: "row",
      },
    },
    el(
      T.div,
      {
        style: {
          width: 330,
          height: COVER_HEIGHT,
          backgroundColor: "#1F2430",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
        },
      },
      el(
        T.div,
        {
          style: {
            fontSize: 30,
            color: "#F5C518",
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
          },
        },
        "POSTONCE"
      ),
      el(
        T.div,
        {
          style: {
            fontSize: 34,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.6,
            fontFamily: FONT_FAMILY,
          },
        },
        sub
      )
    ),
    el(
      T.div,
      {
        style: {
          flex: 1,
          height: COVER_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
        },
      },
      el(T.div, {
        style: { width: 90, height: 12, backgroundColor: "#1F2430", marginBottom: 48 },
      }),
      ...mainEls(main, 88, COVER_WIDTH - 330 - 128, mainStyle)
    )
  );
}

const TEMPLATES: Record<CoverTemplateId, (main: string, sub: string) => React.ReactElement> = {
  solid: SolidTemplate,
  gradient: GradientTemplate,
  split: SplitTemplate,
};

export async function renderCoverPng(
  template: CoverTemplateId,
  mainRaw: string,
  subRaw: string
): Promise<Buffer> {
  const main = cleanText(mainRaw, 30) || "封面标题";
  const sub = cleanText(subRaw, 60);

  const svg = await satori(TEMPLATES[template](main, sub), {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    fonts: loadFonts(),
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: COVER_WIDTH },
    background: "rgba(255,255,255,1)",
  });
  return Buffer.from(resvg.render().asPng());
}
