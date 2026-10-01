# 竞品侧调研报告：国内外 AI Agent / 自动化产品格局

> 调研日期：2026-10-01 · 资料来源：各产品官网/文档、第三方评测、Reddit/知乎社区讨论，以 2025–2026 年公开信息为主

## 1. 核心结论

1. **"通用型 Agent 平台"已是红海**：扣子、Dify、n8n、Zapier 把门槛做到极低，个人开发者无法在通用能力上突围。
2. **大厂产品共同软肋是"不透明 + 生态锁定"**：模型受限、计费规则常变、黑盒插件、数据必须上云。
3. **国际产品对中国用户不友好**：不接国产模型、不支持微信/小红书/公众号渠道、按 task/credit 计费账单不可预测。
4. **垂直场景 + "模型可插拔 + 开源透明 + 在线 Demo"仍有切口**。
5. **关键成功因素**：不是功能最多，而是"1 分钟能跑通、账单看得懂、模型换得了、渠道接得上"。

## 2. 竞品矩阵

### 2.1 国内智能体平台

| 产品 | 定位 | 目标用户 | 定价 / 免费额度 | 开源 | 官网 |
|---|---|---|---|---|---|
| **扣子 Coze** | 字节零代码 AI Bot/Agent 平台，插件生态、多渠道发布 | 个人开发者、自媒体、运营小团队 | 免费版约 100 万 token/月 + 5 个 Bot；专业版按资源点（约 0.002 元/次，日送 500 点） | 2025-07 Coze Studio 核心引擎开源（Apache 2.0） | [coze.cn](https://www.coze.cn/) |
| **腾讯元器** | 混元大模型一站式智能体创作分发，打通微信/企微/公众号/视频号 | 个人开发者、自媒体、中小企业私域 | 每月 100 万 token API 额度；微信渠道不限 token | 否 | [yuanqi.tencent.com](https://yuanqi.tencent.com/) |
| **Dify** | 开源 LLM 应用平台，生产级 Agentic 工作流 | 技术团队、中大型企业、私有化部署 | 社区版免费；云端 Sandbox 免费（200 消息/天）；Pro $59/月；Team $159/月 | **是**，GitHub 50k+ Stars | [dify.ai](https://dify.ai/) |
| **文心智能体平台** | 百度文心大模型零/低代码平台，依托搜索分发 | 开发者、企业、创作者 | 基础免费；高级模型按 token 计费 | 否 | [agents.baidu.com](https://agents.baidu.com/) |
| **智谱 / 清言 / Z.ai** | GLM 模型家族 + 开放平台 + AutoGLM 沉思 | 开发者、研究人员、企业 | 基础免费；新用户送大额体验 token；GLM-Flash 免费；Coding Plan $10–18/月起 | 部分模型权重开源，平台不开源 | [chatglm.cn](https://chatglm.cn/) |
| **Kimi+** | 月之暗面 Kimi 应用内智能体中心，长文本+联网 | 知识工作者、学生 | 基础免费（高峰限流）；会员 ¥49–699/月；API 送 15 元代金券 | 否 | [kimi.com](https://www.kimi.com/) |

### 2.2 国际自动化 / Agent 产品

| 产品 | 定位 | 定价 / 免费额度 | 开源 | 官网 |
|---|---|---|---|---|
| **Zapier** | 最大 no-code 自动化平台，8000+ 集成，AI Actions | 免费 100 tasks/月；Pro $29.99/月起；按 task 计费 | 否 | [zapier.com](https://zapier.com/) |
| **n8n** | 开源工作流自动化，AI Agent 节点 | 自托管免费；云 Starter $28/月起；按 execution 计费 | fair-code | [n8n.io](https://n8n.io/) |
| **Make** | 可视化场景编排，性价比高于 Zapier | 免费 1000 operations/月；Core $10.59/月起 | 否 | [make.com](https://www.make.com/) |
| **Lindy** | 自然语言描述目标的 AI Agent 平台 | 免费 400 credits/月（约 40 任务）；Pro $49.99/月起 | 否 | [lindy.ai](https://www.lindy.ai/) |
| **Gumloop** | 可视化画布 no-code AI Agent | 免费有限 credits；Pro $37/月 | 否 | [gumloop.com](https://www.gumloop.com/) |
| **Relevance AI** | 低代码 AI Workforce 构建器 | 免费版已关闭；Pro $29/月起 | 否 | [relevanceai.com](https://relevanceai.com/) |
| **AgentGPT** | 浏览器内自主 Agent | 付费约 $40/月；可自托管 | 核心开源 | [agentgpt.reworkd.ai](https://agentgpt.reworkd.ai/) |

## 3. 垂直 AI 工具获客案例

### 国内
| 产品 | 场景 | 获客方式 | 结果 |
|---|---|---|---|
| 即梦 AI（字节） | AI 图/视频 | 抖音/小红书 KOL 教程 + 模板 + 免费额度 | "国内普通用户最友好的 AI 绘图工具" |
| 可灵 AI（快手） | AI 视频 | 快手生态 + 免费体验 + 创作者激励 | 累计生成超 2 亿视频，2 万+ 企业客户 |
| 妙鸭相机 | AI 写真 | 9.9 元低价 + 社交裂变 | 上线一月登顶 iOS 榜，后因隐私争议昙花一现 |
| 剪映/CapCut | 视频剪辑+AI | 抖音生态预装 + 模板社区 | 创作者标配 |

共性：**平台生态红利、模板/教程驱动、低价免费体验、生成结果自带传播属性**。

### 国际
| 产品 | 场景 | 获客方式 | 结果 |
|---|---|---|---|
| Gamma | AI PPT | 产品即内容：输入一句话生成完整 deck，PLG + 口碑 | 9 个月 1000 万用户，现 3000 万 |
| Notion AI | 文档 AI | 亿级用户池叠加 AI；waitlist 5 周破 100 万 | 定价改固定月费降低探索成本 |
| Canva Magic Studio | AI 设计 | 1 亿+用户 + 模板市场渐进叠加 AI | 先设计工具后 AI 增强 |
| Otter.ai / Descript | 转录/音视频 | 内容营销 + 社区模板 + 创作者社群 | 垂直创作者口碑 |

共性：**产品即增长（PLG）、现有用户池转化、模板/用例库、定价简单透明**。

## 4. 用户差评里的机会

### 4.1 国内平台
| 抱怨 | 代表产品 | 机会 |
|---|---|---|
| 生态锁定，迁移成本高 | 百炼、千帆、元器 | "不绑定任何云"的开放平台 |
| 模型选择受限（扣子绑豆包、元器绑混元） | 扣子、元器 | 多模型可插拔是强卖点 |
| 计费/额度不透明、规则常变 | 扣子、文心、Kimi | 透明可预测的计费稀缺 |
| 黑盒插件不可改 | 扣子 | 开源可二开的组件 |
| 数据不能出门 | 扣子、百炼 | 私有化能力（Dify 壁垒但运维重） |
| 多 Agent 协作弱 | 扣子、元器 | 真正的编排是技术切口 |

### 4.2 国际三巨头
| 抱怨 | 机会 |
|---|---|
| Zapier 规模化太贵（按 task 计费） | 更便宜的替代 |
| n8n 学习曲线陡 + 自托管运维重 | "比 n8n 简单、比 Zapier 便宜"的中间方案 |
| Make 复杂逻辑上手慢 | 自然语言生成工作流 |
| 不支持微信/小红书/钉钉/飞书 | **中国渠道原生集成是差异化** |

### 4.3 AI-native 产品
| 抱怨 | 机会 |
|---|---|
| Credit/Action 消耗不可预测、账单爆炸 | 成本可见、可设硬上限 |
| 免费额度极小（Lindy 仅 40 任务/月） | 慷慨免费层 + 国产免费模型 |
| Agent 不可靠/幻觉 | 人机协作、审批节点、可回滚 |
| 通用 builder 需自己 plumbing | 垂直场景"开箱即用"模板 |

### 4.4 六个产品机会点
1. "要国产模型但不想被平台绑定" → 多模型可插拔 + 默认国产免费 + BYO Key
2. "账单看不懂" → 运行前预估 token/费用 + 硬上限
3. "免费额度太抠" → 国产免费模型 + 自托管，demo 成本压到极低
4. "微信/小红书/公众号接不上" → 优先中国创作者渠道
5. "Dify 太重、Coze 不自由" → 中间态：比 Coze 开放、比 Dify 轻量
6. "不知道 Agent 能干嘛" → 内容营销展示真实场景

## 5. 差异化定位分析（结合本项目定位）

**定位**：开源 + 免费在线 Demo + 多模型可插拔 + 默认国产免费额度 + BYOK + 小红书/公众号个人账号推广 + 非商业化。

**一句话**：面向中国普通用户/小团队的开源 Agent 工作台，默认接国产免费模型，账单透明，本土渠道优先，代码完全开源。

| 差异点 | 大厂现状 | 本项目机会 |
|---|---|---|
| 模型自由 | 各绑自家模型 | DeepSeek/通义/GLM/Kimi/OpenAI 一键切换 + 成本路由 |
| 账单透明 | 资源点/credit 复杂 | 运行前预估 + 硬上限 |
| 渠道本土 | 国际产品不支持 | 小红书/公众号/知乎/微博/头条适配 |
| 开源+轻量 | Dify 重、Coze 闭源 | 在线 Demo + Apache 2.0 |
| 场景垂直 | 大而全 | 跨平台内容二创做透 |

**海滩头场景选择**：方案 A「小红书/公众号 AI 内容运营助手」优于 B「本地知识库」和 C「微信客服中间件」——它与"小红书/公众号个人账号推广"的获客方式天然一致，形成"用产品生产内容、用内容获客、用反馈迭代"的闭环。（✅ 已采纳为最终选题方向）

## 6. 推广路径建议

1. **Build in Public**：公开 Roadmap、每周更新日志、真实使用截图/视频
2. **内容矩阵**：小红书短教程（30 秒出爆款标题）+ 公众号深度复盘（设计思路、模型对比、成本优化）+ B 站实操视频
3. **模板驱动**：每个场景"一键复制模板"，改几个参数就能跑通
4. **社群沉淀**：交流群人肉收集痛点、功能投票
5. **开源社区运营**：README、贡献指南、good-first-issue

## 7. 对选题的启示

1. 做"窄"：不与 Coze/Dify/n8n 正面竞争，做"有明确场景、有开源信任、有本土渠道、有透明计费"的垂直 Agent
2. "开源 + 在线 Demo"是最佳信任杠杆
3. 多模型可插拔是真实需求不是噱头
4. 内容获客要早于产品完善：先用惊艳 Demo 涨粉，再用反馈定义产品
5. 非商业化目标反而是优势：更大胆地免费、开源、拒绝 vendor lock-in，建立"用户利益代言人"品牌

## 8. 参考来源

- 国内平台横评：[腾讯云 6 大平台横评](https://cloud.tencent.com/developer/article/2674338)、[火山引擎横评](https://developer.volcengine.com/articles/7523624399816261641)
- 扣子：[免费额度解析](https://ainavhub.cc/article/coze-free)、[专业版计费](https://docs.coze.cn/guides_billing_rules_adjustment)、[Coze Studio 开源](https://github.com/coze-studio/coze-studio-Plus)
- 腾讯元器：[API 额度说明](https://yuanqi.tencent.com/guide/publish-agent-api-token-explanation)
- Dify：[Cloud Pricing](https://dify.ai/pricing/dify-cloud)
- 智谱：[GLM 定价](https://avenchat.com/zh/blog/glm-5.2-pricing)
- Kimi：[API 免费权益](https://www.kimi.com/help/kimi-api/api-free-trial)
- 国际：[Intuz n8n/Make/Zapier 横评](https://www.intuz.com/blog/make-vs-n8n-vs-zapier-detailed-comparison/)、[n8n Reddit 评价](https://ciela.ai/blogs/n8n-reddit-review-for-automation-agencies)、[Zapier 定价变化](https://automationatlas.io/answers/zapier-pricing-changes-2025-2026/)
- Lindy：[First AI Movers 指南](https://www.firstaimovers.com/p/lindy-ai-agents-automation-guide-2026)
- Relevance AI：[定价解析](https://www.getmacha.com/blog/relevance-ai-pricing-explained)
- 垂直工具：[Gamma 增长故事](https://www.jpmorgan.com/insights/technology/artificial-intelligence/gammas-startup-journey-the-future-of-presentations-with-ai)、[Notion AI 复盘](https://www.notion.com/blog/lessons-we-learned-from-launching-notion-ai)、[妙鸭相机复盘](https://zhuanlan.zhihu.com/p/2055375671455642283)
