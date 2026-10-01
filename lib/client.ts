// 客户端工具：API 调用（含 BYOK 头）、localStorage 历史、剪贴板、HTML→Markdown
"use client";

import type {
  ContentAnalysis,
  GongzhonghaoDraft,
  PlatformId,
  PlatformResult,
  SourceDocument,
  TokenUsage,
  XiaohongshuDraft,
} from "./types";

const BYOK_KEY = "postonce-byok";
const HISTORY_KEY = "postonce-history";
const HISTORY_LIMIT = 20;

export interface ByokConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

export function loadByok(): ByokConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BYOK_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as Partial<ByokConfig>;
    if (obj.baseURL && obj.apiKey && obj.model) {
      return { baseURL: obj.baseURL, apiKey: obj.apiKey, model: obj.model };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveByok(config: ByokConfig | null): void {
  if (typeof window === "undefined") return;
  if (config) window.localStorage.setItem(BYOK_KEY, JSON.stringify(config));
  else window.localStorage.removeItem(BYOK_KEY);
}

function byokHeaders(): Record<string, string> {
  const byok = loadByok();
  if (!byok) return {};
  return {
    "x-postonce-base-url": byok.baseURL,
    "x-postonce-api-key": byok.apiKey,
    "x-postonce-model": byok.model,
  };
}

/** POST JSON，统一抛中文错误 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json", ...byokHeaders() },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("网络请求失败，请检查网络连接");
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    if (!res.ok) throw new Error(`请求失败（HTTP ${res.status}）`);
    return (await res.blob()) as unknown as T;
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `请求失败（HTTP ${res.status}）`);
  }
  return data as T;
}

/* ---------- 历史记录（localStorage） ---------- */

export interface HistoryRun {
  id: string;
  time: number;
  title: string;
  sourceUrl?: string;
  doc: SourceDocument;
  analysis: ContentAnalysis;
  results: PlatformResult[];
}

export function loadHistory(): HistoryRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as HistoryRun[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveHistoryRun(run: HistoryRun): void {
  if (typeof window === "undefined") return;
  const list = loadHistory().filter((r) => r.id !== run.id);
  list.unshift(run);
  window.localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(list.slice(0, HISTORY_LIMIT))
  );
}

export function deleteHistoryRun(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(loadHistory().filter((r) => r.id !== id))
  );
}

/* ---------- 剪贴板 ---------- */

export async function copyPlainText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    fallbackCopy(text);
  }
}

export async function copyRichText(html: string, text: string): Promise<void> {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
  } catch {
    // 某些浏览器（如 Firefox）不支持 write()，退回纯文本
    fallbackCopy(text);
  }
}

function fallbackCopy(text: string): void {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

/* ---------- HTML → Markdown（覆盖 LLM 输出的常用标签子集） ---------- */

export function htmlToMarkdown(html: string): string {
  if (typeof DOMParser === "undefined") return html.replace(/<[^>]+>/g, "");
  const doc = new DOMParser().parseFromString(html, "text/html");

  function walk(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const inner = () =>
      Array.from(el.childNodes)
        .map(walk)
        .join("");

    switch (tag) {
      case "h1":
        return `# ${inner().trim()}\n\n`;
      case "h2":
        return `## ${inner().trim()}\n\n`;
      case "h3":
      case "h4":
        return `### ${inner().trim()}\n\n`;
      case "strong":
      case "b":
        return `**${inner().trim()}**`;
      case "em":
      case "i":
        return `*${inner().trim()}*`;
      case "blockquote":
        return (
          inner()
            .trim()
            .split("\n")
            .map((l) => `> ${l}`)
            .join("\n") + "\n\n"
        );
      case "hr":
        return "\n---\n\n";
      case "br":
        return "\n";
      case "li": {
        const parent = el.parentElement?.tagName.toLowerCase();
        const marker = parent === "ol" ? "1." : "-";
        return `${marker} ${inner().trim()}\n`;
      }
      case "ul":
      case "ol":
        return inner().trimEnd() + "\n\n";
      case "p":
      case "section":
      case "div":
      case "article":
        return inner().trim() + "\n\n";
      case "img":
        return `![${el.getAttribute("alt") || "图片"}](${el.getAttribute("src") || ""})\n\n`;
      case "a":
        return `[${inner().trim()}](${el.getAttribute("href") || ""})`;
      default:
        return inner();
    }
  }

  return Array.from(doc.body.childNodes)
    .map(walk)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ---------- API 返回类型 ---------- */

export interface IngestResponse extends SourceDocument {}

export interface TranscribeResponse extends SourceDocument {
  duration: number;
}

export type UnderstandResponse = ContentAnalysis & { usage: TokenUsage };

export interface AdaptResponse {
  results: PlatformResult[];
  usage: TokenUsage;
}

export function isXhs(d: unknown): d is XiaohongshuDraft {
  return typeof d === "object" && d !== null && "coverText" in d;
}

export function isGzh(d: unknown): d is GongzhonghaoDraft {
  return typeof d === "object" && d !== null && "html" in d && "digest" in d;
}

export type { PlatformId };
