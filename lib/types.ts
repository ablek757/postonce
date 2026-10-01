// 前后端共享的类型定义

export type PlatformId =
  | "xiaohongshu"
  | "gongzhonghao"
  | "zhihu"
  | "weibo"
  | "toutiao";

export const PLATFORM_IDS: PlatformId[] = [
  "xiaohongshu",
  "gongzhonghao",
  "zhihu",
  "weibo",
  "toutiao",
];

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  xiaohongshu: "小红书",
  gongzhonghao: "公众号",
  zhihu: "知乎",
  weibo: "微博",
  toutiao: "头条",
};

/** 内容理解结果（/api/understand 输出，前端可编辑） */
export interface ContentAnalysis {
  summary: string;
  keyPoints: string[];
  audience: string;
  tone: string;
  goldenQuotes: string[];
}

export interface CoverText {
  main: string;
  sub: string;
}

/** 小红书平台草稿 */
export interface XiaohongshuDraft {
  titles: string[];
  body: string;
  tags: string[];
  coverText: CoverText;
}

/** 公众号平台草稿 */
export interface GongzhonghaoDraft {
  titles: string[];
  html: string;
  digest: string;
}

/** 知乎草稿（Markdown 正文，回答体） */
export interface ZhihuDraft {
  titles: string[];
  body: string;
}

/** 微博草稿（短文案 + 话题 + 可选长文） */
export interface WeiboDraft {
  text: string;
  topics: string[];
  longText?: string;
}

/** 头条草稿（资讯感正文） */
export interface ToutiaoDraft {
  titles: string[];
  body: string;
}

export type PlatformDraft =
  | XiaohongshuDraft
  | GongzhonghaoDraft
  | ZhihuDraft
  | WeiboDraft
  | ToutiaoDraft;

export interface PlatformResult<T = PlatformDraft> {
  platform: PlatformId;
  ok: boolean;
  data?: T;
  error?: string;
  usage?: TokenUsage;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface SourceDocument {
  title: string;
  content: string;
  excerpt: string;
  sourceUrl?: string;
}

export type CoverTemplateId = "solid" | "gradient" | "split";

export const COVER_TEMPLATES: { id: CoverTemplateId; label: string }[] = [
  { id: "solid", label: "纯色大字" },
  { id: "gradient", label: "渐变吸睛" },
  { id: "split", label: "左右分栏" },
];

export const COVER_WIDTH = 900;
export const COVER_HEIGHT = 1200;
