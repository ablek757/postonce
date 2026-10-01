import type { ContentAnalysis, PlatformId } from "./types";

export const UNDERSTAND_SYSTEM = `你是一名资深中文内容编辑，擅长把各类内容拆解为可供二次创作的结构化理解结果。你的输出必须忠实于原文，不要编造原文没有的信息。`;

export function buildUnderstandPrompt(title: string, content: string): string {
  return `请理解下面这篇内容，严格以 json 格式输出结构化结果。

标题：${title || "（无标题）"}

正文：
${content}

要求：
- summary：一段话讲清核心内容，100 字以内；
- keyPoints：3-7 条核心要点，每条一句话，保留关键数据与结论；
- audience：目标读者画像，一句话；
- tone：原文的情绪与调性（如：理性干货 / 温情叙事 / 犀利观点），一句话；
- goldenQuotes：1-5 条值得直接引用的原文金句，必须是原文里真实存在的句子。`;
}

const XIAOHONGSHU_SPEC = `【小红书平台规格】
- 标题：不超过 20 字，强情绪/数字/悬念风格，口语化，可适度使用 emoji；
- 正文：800 字以内，短段落（每段 1-3 行），用 emoji 做视觉分隔和段落标记，语气像朋友聊天（可用"宝子""姐妹""家人们"等称呼，视内容调性而定），突出干货感和情绪共鸣，结尾引导互动（提问/求收藏）；
- tags：5-10 个话题标签，不带 # 号，混合大词（如 职场干货）和精准词；
- coverText.main：封面主标题，不超过 12 个字，大字冲击力优先；
- coverText.sub：封面副标题，一句话补充钩子，20 字以内。

【输出格式】必须输出一个 json object，严格使用以下字段名，不得自造字段：
{
  "titles": ["标题1", "标题2", "标题3", "标题4", "标题5"],
  "body": "正文纯文本（emoji 分段；末尾不要带 # 话题标签，标签只放 tags 字段）",
  "tags": ["标签1", "标签2"],
  "coverText": { "main": "封面主标题", "sub": "封面副标题" }
}`;

const GONGZHONGHAO_SPEC = `【公众号平台规格】
- 标题：不超过 22 字，悬念型或观点型；
- html：排版完整的富文本，要求：
  1) 所有 CSS 样式必须内联在元素的 style 属性里，不引入外部资源；
  2) 正文整体字号 16px、行高 1.8、颜色 #3f3f3f、两端对齐；
  3) 结构包含：开篇引言（可引用原文金句，用引用块呈现）→ 2-4 个小标题分段（h2 或加粗段落）→ 要点可用无序列表 → 关键句加粗 → 文尾用 hr 分割线 + 一段互动引导（点赞/在看/转发）；
  4) section 容器内边距 20px，正文 3000 字以内；
- digest：120 字以内摘要，概括文章价值，用于公众号后台。

【输出格式】必须输出一个 json object，严格使用以下字段名，不得自造字段：
{
  "titles": ["标题1", "标题2", "标题3", "标题4", "标题5"],
  "html": "完整富文本 HTML 字符串（JSON 字符串内正确转义）",
  "digest": "摘要"
}`;

const ZHIHU_SPEC = `【知乎平台规格】
- titles：3-8 个备选标题，问题式（如"为什么……？"）或观点式（如"……才是正解"），每个不超过 30 字，专业克制，不标题党；
- body：Markdown 格式正文（用 ## 小标题、- 无序列表、**加粗** 组织），2000 字以内；
- 写法按"回答体"组织：开头直接亮明核心结论或立场 → 分点展开论证（论点+论据+例子）→ 结尾一句总结升华；
- 整体逻辑性强、信息密度高、有专业感，避免营销腔和 emoji 堆砌，可适度引用原文金句并加粗。

【输出格式】必须输出一个 json object，严格使用以下字段名，不得自造字段：
{
  "titles": ["标题1", "标题2", "标题3"],
  "body": "Markdown 正文（## 小标题分段，- 列表，**加粗** 关键句）"
}`;

const WEIBO_SPEC = `【微博平台规格】
- text：140 字以内短文案，前 20 字必须抛出钩子（结论/冲突/数字），带 1-2 个 emoji 点缀，口语化、有情绪，像真人发博；
- topics：2-4 个话题词，不带 # 号，选与内容强相关、有流量的词；
- longText：可选长微博版本，500 字以内，把核心内容讲完整（适合头条文章机制）；如内容确实不需要长文，输出空字符串 ""。

【输出格式】必须输出一个 json object，严格使用以下字段名，不得自造字段：
{
  "text": "140 字内短文案（1-2 个 emoji，不带话题词）",
  "topics": ["话题1", "话题2"],
  "longText": "可选长微博版本，不需要时为空字符串"
}`;

const TOUTIAO_SPEC = `【头条平台规格】
- titles：3-8 个备选标题，信息量型，突出关键事实/数字/利益点，每个不超过 30 字，平实有力不夸张；
- body：资讯感正文，1500 字以内，段落清晰（每段 2-4 行），导语一段概括核心信息，随后分层展开事实与观点，可小标题分段，结尾一句总结或互动引导；语言客观稳健、信息密度高，避免小红书式 emoji 和网络腔。

【输出格式】必须输出一个 json object，严格使用以下字段名，不得自造字段：
{
  "titles": ["标题1", "标题2", "标题3"],
  "body": "资讯感正文（段落清晰，导语+分层展开）"
}`;

const PLATFORM_SPECS: Record<PlatformId, string> = {
  xiaohongshu: XIAOHONGSHU_SPEC,
  gongzhonghao: GONGZHONGHAO_SPEC,
  zhihu: ZHIHU_SPEC,
  weibo: WEIBO_SPEC,
  toutiao: TOUTIAO_SPEC,
};

const PLATFORM_NAMES: Record<PlatformId, string> = {
  xiaohongshu: "小红书",
  gongzhonghao: "公众号",
  zhihu: "知乎",
  weibo: "微博",
  toutiao: "头条",
};

export function buildAdaptPrompt(
  platform: PlatformId,
  title: string,
  content: string,
  analysis: ContentAnalysis
): string {
  const spec = PLATFORM_SPECS[platform];
  const platformName = PLATFORM_NAMES[platform];

  return `你是一名顶级${platformName}内容创作者。请基于原始内容与内容理解结果，产出一篇严格符合平台调性的发布级草稿。

原始标题：${title || "（无标题）"}

原始正文：
${content}

内容理解结果（可作依据，不要照抄）：
- 核心总结：${analysis.summary}
- 要点：${analysis.keyPoints.map((p) => `  · ${p}`).join("\n")}
- 目标读者：${analysis.audience}
- 调性：${analysis.tone}
- 金句：${analysis.goldenQuotes.map((q) => `  · ${q}`).join("\n")}

${spec}

注意：
- 保留原文核心信息与关键数据，不得编造；
- 输出要像平台原生内容，不要出现"本文将介绍"这类公文腔；
- 不要输出任何与 JSON 结构无关的解释文字。`;
}
