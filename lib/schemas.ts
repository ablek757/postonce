import { z } from "zod";

/** /api/understand 的结构化输出 schema */
export const understandingSchema = z.object({
  summary: z.string().describe("一段话总结核心内容，100 字以内"),
  keyPoints: z.array(z.string()).min(3).max(7).describe("核心要点清单"),
  audience: z.string().describe("目标读者画像，一句话"),
  tone: z.string().describe("原文的情绪与调性，一句话"),
  goldenQuotes: z.array(z.string()).min(1).max(5).describe("值得直接引用的金句原文"),
});

/** 小红书草稿 schema */
export const xiaohongshuDraftSchema = z.object({
  titles: z
    .array(z.string())
    .min(3).max(8)
    .describe("5 个备选标题，每个不超过 20 字，强情绪/数字/悬念风格"),
  body: z.string().describe("正文，800 字以内，短段落 + emoji 分隔，口语化"),
  tags: z
    .array(z.string())
    .min(5)
    .max(10)
    .describe("5-10 个话题标签，不带 # 号"),
  coverText: z
    .object({
      main: z.string().describe("封面主标题，不超过 12 个字"),
      sub: z.string().describe("封面副标题，一句话补充"),
    })
    .describe("封面文字"),
});

/** 公众号草稿 schema */
export const gongzhonghaoDraftSchema = z.object({
  titles: z
    .array(z.string())
    .min(3).max(8)
    .describe("5 个备选标题，每个不超过 22 字，悬念/观点型"),
  html: z
    .string()
    .describe(
      "排版好的富文本 HTML，所有样式必须内联在 style 属性中，包含小标题、引用块、加粗、分割线，3000 字以内"
    ),
  digest: z.string().describe("文章摘要，120 字以内，用于公众号后台 digest 字段"),
});

/** 知乎草稿 schema */
export const zhihuDraftSchema = z.object({
  titles: z
    .array(z.string())
    .min(3)
    .max(8)
    .describe("3-8 个备选标题，问题式或观点式，每个不超过 30 字"),
  body: z
    .string()
    .describe("Markdown 格式正文，2000 字以内，小标题+列表+加粗，逻辑论证感，回答体"),
});

/** 微博草稿 schema */
export const weiboDraftSchema = z.object({
  text: z
    .string()
    .describe("140 字以内短文案，前 20 字必须有钩子，带 1-2 个 emoji"),
  topics: z
    .array(z.string())
    .min(2)
    .max(8)
    .describe("2-4 个话题词，不带 # 号"),
  longText: z
    .string()
    .optional()
    .describe("可选长微博版本，500 字以内，不需要时输出空字符串"),
});

/** 头条草稿 schema */
export const toutiaoDraftSchema = z.object({
  titles: z
    .array(z.string())
    .min(3)
    .max(8)
    .describe("3-8 个备选标题，信息量型，每个不超过 30 字"),
  body: z
    .string()
    .describe("资讯感正文，1500 字以内，段落清晰，信息密度高"),
});

export const platformDraftSchemas = {
  xiaohongshu: xiaohongshuDraftSchema,
  gongzhonghao: gongzhonghaoDraftSchema,
  zhihu: zhihuDraftSchema,
  weibo: weiboDraftSchema,
  toutiao: toutiaoDraftSchema,
} as const;
