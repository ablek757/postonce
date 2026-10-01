# 供给侧调研报告：GitHub AI Agent / 自动化开源项目生态（2024-2025）

> 调研日期：2026-10-01 · 方法：WebSearch + FetchURL，中英文来源
>
> 说明：GitHub API 在采集时触发速率限制，星数主要来自 github.hot、gitstarclub、OSSInsight、官方博客及公开榜单的最近可得数据（多为 2025 年末至 2026 年初），均为近似值，用于判断量级和趋势。

## 1. 头部项目盘点（按类别）

### 1.1 通用 Agent / 多智能体框架

| 项目 | 星数 | 定位 | GitHub |
|---|---|---|---|
| AutoGPT | ~187.6k | 自主 Agent 构建与运行平台 | [Significant-Gravitas/AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) |
| MetaGPT | ~70.6k | "软件公司模拟"多 Agent 协作框架 | [FoundationAgents/MetaGPT](https://github.com/FoundationAgents/MetaGPT) |
| AutoGen | ~61.2k | 微软多 Agent 对话/事件驱动框架 | [microsoft/autogen](https://github.com/microsoft/autogen) |
| CrewAI | ~55k | 角色扮演式多 Agent 团队编排 | [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) |
| LangChain | ~147.1k | LLM 应用工程化基础框架 | [langchain-ai/langchain](https://github.com/langchain-ai/langchain) |
| LangGraph | ~42.3k | 有状态图结构 Agent 编排 | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) |
| LlamaIndex | ~52.3k | RAG / 文档 Agent 数据框架 | [run-llama/llama_index](https://github.com/run-llama/llama_index) |
| Agno（原 Phidata） | ~42.4k | 多模态 Agent 平台/运行时 | [agno-agi/agno](https://github.com/agno-agi/agno) |
| Smolagents | ~29.5k | Hugging Face 极简代码优先 Agent 库 | [huggingface/smolagents](https://github.com/huggingface/smolagents) |
| Mastra | ~28.4k | TypeScript AI 应用/Agent 框架 | [mastra-ai/mastra](https://github.com/mastra-ai/mastra) |
| SuperAGI | ~17.7k | 自主 AI Agent 框架 | [TransformerOptimus/SuperAGI](https://github.com/TransformerOptimus/SuperAGI) |

### 1.2 工作流 / 应用平台 / RAG

| 项目 | 星数 | 定位 | GitHub |
|---|---|---|---|
| n8n | ~206.1k | 公平代码工作流自动化 + AI 节点 | [n8n-io/n8n](https://github.com/n8n-io/n8n) |
| Dify | ~157.3k | LLM 应用/Agent 工作流低代码平台 | [langgenius/dify](https://github.com/langgenius/dify) |
| Open WebUI | ~153.3k | 自托管 AI 对话界面 | [open-webui/open-webui](https://github.com/open-webui/open-webui) |
| RAGFlow | ~88.4k | 深度文档理解 RAG 引擎 | [infiniflow/ragflow](https://github.com/infiniflow/ragflow) |
| Flowise | ~55.5k | 可视化 LLM/Agent 工作流 | [FlowiseAI/Flowise](https://github.com/FlowiseAI/Flowise) |
| Lobe Chat | ~64k | 多模型聊天/插件/Agent 市场 | [lobehub/lobe-chat](https://github.com/lobehub/lobe-chat) |
| Cherry Studio | ~52.2k | AI 生产力客户端 | [CherryHQ/cherry-studio](https://github.com/CherryHQ/cherry-studio) |
| AgentGPT | ~36.3k | 浏览器内配置/部署自主 Agent | [reworkd/AgentGPT](https://github.com/reworkd/AgentGPT) |
| FastGPT | ~29.7k | 知识库问答 + 可视化工作流 | [labring/FastGPT](https://github.com/labring/FastGPT) |

### 1.3 编码 / 终端 Agent

| 项目 | 星数 | 定位 | GitHub |
|---|---|---|---|
| OpenCode | ~210.3k | 终端 AI 编码代理 | [anomalyco/opencode](https://github.com/anomalyco/opencode) |
| OpenHands | ~85k | 云端 AI 软件开发平台 | [All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands) |
| Cline | ~69.4k | VS Code 自主编码 Agent | [cline/cline](https://github.com/cline/cline) |
| Open Interpreter | ~66k | 本地代码/Shell 执行 Agent | [OpenInterpreter/open-interpreter](https://github.com/OpenInterpreter/open-interpreter) |
| Mem0 | ~66k | Agent 长期记忆基础设施 | [mem0ai/mem0](https://github.com/mem0ai/mem0) |
| Aider | ~49.2k | 终端结对编程助手 | [Aider-AI/aider](https://github.com/Aider-AI/aider) |
| Goose | ~55k | 通用 AI Agent（Block → Linux 基金会） | [block/goose](https://github.com/block/goose) |
| Continue | ~36.0k | 开源 AI 编程 IDE 扩展 | [continuedev/continue](https://github.com/continuedev/continue) |
| Kilo Code | ~27.4k | VS Code/JetBrains/CLI 编码 Agent | [Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode) |
| Roo Code | ~24k | Cline 分支 | [RooVetGit/Roo-Code](https://github.com/RooVetGit/Roo-Code) |
| Devika | ~19.6k | Devin 的开源替代 | [stitionai/devika](https://github.com/stitionai/devika) |

### 1.4 浏览器 / 计算机使用 Agent

| 项目 | 星数 | 定位 | GitHub |
|---|---|---|---|
| Browser-use | ~116.4k | 让 AI 操作浏览器的自动化框架 | [browser-use/browser-use](https://github.com/browser-use/browser-use) |

### 1.5 垂直 / 工具型 Agent

| 项目 | 星数 | 定位 | GitHub |
|---|---|---|---|
| Khoj | ~37.5k | 可自托管的个人 AI 第二大脑 | [khoj-ai/khoj](https://github.com/khoj-ai/khoj) |
| CopilotKit | ~37.6k | 前端 AI Copilot / 生成式 UI 套件 | [CopilotKit/CopilotKit](https://github.com/CopilotKit/CopilotKit) |
| AIHawk | ~30.3k | 自动求职申请 Agent | [feder-cr/Jobs_Applier_AI_Agent_AIHawk](https://github.com/feder-cr/Jobs_Applier_AI_Agent_AIHawk) |
| GPT Researcher | ~29k | 自主深度研究 Agent | [assafelovic/gpt-researcher](https://github.com/assafelovic/gpt-researcher) |
| ChatTTS | ~39.9k | 对话式 TTS 模型 | [2noise/ChatTTS](https://github.com/2noise/ChatTTS) |
| Huginn | ~50.0k | 自托管"为你监控并行动"的自动化 Agent | [huginn/huginn](https://github.com/huginn/huginn) |
| DB-GPT | ~20.1k | 数据库 AI Agent | [eosphoros-ai/DB-GPT](https://github.com/eosphoros-ai/DB-GPT) |
| Dia | ~19.4k | 多说话人对话 TTS | [nari-labs/dia](https://github.com/nari-labs/dia) |
| code2prompt | ~7.6k | 代码库 → LLM 提示词工具 | [mufeedvh/code2prompt](https://github.com/mufeedvh/code2prompt) |

## 2. 红海 / 同质化严重方向（不要再做）

1. **通用多 Agent 编排框架**：AutoGPT、CrewAI、AutoGen、MetaGPT、LangGraph、Agno、Smolagents、Mastra 已覆盖全象限。
2. **ChatGPT / LLM 聊天 UI 套壳**：Open WebUI、Lobe Chat、Cherry Studio、AgentGPT、各类 Next.js 模板已过剩。
3. **基础 RAG / 知识库低代码平台**：Dify、RAGFlow、FastGPT、Flowise 已是标配。
4. **简单 VS Code AI 编码扩展**：Cline、Continue、Roo Code、Kilo Code、Cursor 生态非常拥挤。
5. **浏览器自动化 wrapper**：Browser-use、Stagehand、Skyvern 已主导；新入场者只能切极细场景。
6. **纯 MCP Server 聚合目录**：壁垒低。

## 3. 空白 / 正在崛起的机会方向

### 3.1 垂直行业 Agent（最推荐个人开发者）
- 法律、医疗/临床、金融、学术/科研、建筑/房地产/保险：数字化程度低、端到端工作流有真实空间。
- 参考：垂直 AI 2025 年市场规模约 35 亿美元；Harvey 一年估值冲到 80 亿美元。[Vertical AI Revolution](https://enricopiovano.com/blog/ai-applications-industry-verticals)

### 3.2 Agent 基础设施组件
- 长期记忆与个性化（Mem0 已验证需求）、评估/可观测性/成本追踪、安全沙箱与权限、模型路由与网关、高质量 MCP 工具。

### 3.3 本地 / 隐私优先 Agent
- 本地小模型 + 个人知识库 + 个人自动化（Khoj、Huginn 的现代版）、本地 coding agent、本地语音 Agent。

### 3.4 语音 / 多模态 Agent
- 实时语音客服/电话 Agent、播客/有声书生成、视频理解 Agent；Dia、ChatTTS 的火爆说明"自然语音"仍是高关注赛道。

### 3.5 开发者小工具（Context Engineering）
- 代码库上下文压缩、提示词模板、项目级规则文件、代码审查 Agent；code2prompt 精准解决小而痛的点。

## 4. 什么样的 Agent 项目容易获得 Star

1. **解决一个具体、可验证的真实痛点**（Browser-use、Cline、Dia、code2prompt）；"又一个通用框架"讲不清差异化。
2. **README 顶部放 10-20 秒演示 GIF/视频**——最高杠杆的改动。[Glideo 指南](https://glideo.app/blog/github-readme-demo-video)
3. **踩准热点/新模型/新协议**：Cline 在 Claude 3.5 Sonnet 发布 10 天后启动，Octoverse 2025 贡献者增长 4704%；Dia 借 NotebookLM 热度 48 小时 7800+ star；MCP 集成。[Cline 博客](https://cline.bot/blog/cline-the-fastest-growing-ai-open-source-project-on-github-in-2025-thanks-to-you) [VentureBeat](https://venturebeat.com/ai/a-new-open-source-text-to-speech-model-called-dia-has-arrived-to-challenge-elevenlabs-openai-and-more)
4. **模型无关 / BYOK**：降低信任门槛和试用成本。
5. **一键部署 + 在线 Demo**：Docker Compose / npx / 托管版。[Dify 10 万 star 复盘](https://dify.ai/blog/100k-stars-on-github-thank-you-to-our-amazing-open-source-community)
6. **社区与内容营销**：HN/Reddit/X/V2EX/知乎/掘金教程 + awesome 列表 + Product Hunt。

## 5. 近 6 个月快速增长案例（月增千星级别）

| 项目 | 增速信号 | 做对了什么 |
|---|---|---|
| **OpenCode** | 21 天 +30.5k，日均 +1.5k | 终端原生、模型无关、主打"逃离厂商锁定" |
| **Browser-use** | 10 天 +9.2k，日均 +1.0k | 精准定位"AI 操作浏览器"，WebVoyager 成功率 89.1% |
| **n8n** | 12 天 +9.8k，日均 +891 | 工作流自动化 + 原生 AI 节点 + 400+ 集成 |
| **Cline** | 13 天 +4.9k，日均 +408 | 卡位 Claude 3.5 agentic coding、VS Code 原生、BYOK |
| **CopilotKit** | 13 天 +5.2k，日均 +432 | 前端嵌入 AI Copilot / 生成式 UI |
| **Dify** | 4 天 +4.8k，日均 ~1.2k | LLM 应用平台 + RAG + Agent 编排 + 可视化 |
| **Continue** | 4 天 +1.4k，日均 +470 | 开源 IDE 扩展 + MCP 支持，模型无关 |
| **Kilo Code** | 4 天 +1.6k，日均 +541 | 多平台 + 模型切换 + Agentic Engineering 定位 |

## 6. 个人开发者主导的成功案例

1. **Cline — Saoud Rizwan**：hackathon 项目起步，"透明、BYOK、VS Code 原生自主编码 Agent"快速起量，后融资 3200 万美元，安装量超 380 万。[融资新闻](https://finance.yahoo.com/news/cline-raises-32m-seed-series-170000715.html) [创始人故事](https://yespress.io/saoud-rizwan)
2. **GPT Researcher — Assaf Elovic**：首个开源 deep research agent，~29k star，后创立 Tavily 被收购。
3. **AIHawk — feder-cr**：自动求职申请 Agent，~30.3k star，从个人需求出发，后演变为 laboro.co。
4. **code2prompt / Devika — Mufeed VH**：小而痛的点 + 系列化。
5. **Dia — Nari Labs（1.5 人团队）**：无资金、非 AI 专家，热点切入 + 可立即体验的 demo + 明显超越竞品的自然度，48 小时 7800+ star。[iThome](https://www.ithome.com.tw/news/168583)
6. **Khoj**：个人 passion project → YC，~37.5k star。[10k star 复盘](https://blog.khoj.dev/posts/10k-stars-in/)

## 7. 对个人开发者的启示

### 不要做
- ❌ 又一个通用 Agent 框架 ❌ 又一个 ChatGPT 套壳 ❌ 又一个基础 RAG 平台 ❌ 无差异化的 VS Code 编码扩展

### 最值得做
- ✅ 垂直行业 Agent（选熟悉或有数据来源的行业，做端到端工作流）
- ✅ 开发者小工具（上下文工程、评测、成本监控、MCP 调试）
- ✅ 本地/隐私优先工具
- ✅ 多模态/语音 Agent
- ✅ Agent 基础设施（记忆、权限、沙箱、路由、可观测性）

### 可执行的 Launch 清单
1. 定义一个 10 秒能说清的痛点
2. README 顶部演示 GIF + 一句话价值主张
3. 一键体验（Docker/pip/npx + 在线 demo + BYOK）
4. 蹭热点但解决真问题（MCP、新模型、Ollama）
5. 内容营销比代码更重要（3-5 篇"我用 XX 做了 XX"教程）
6. 核心开源 + 托管/增值的留后路（即使目标非商业化，也增加项目可信度）

## 8. 结论

2024-2025 年 GitHub 上 AI Agent 的基础设施和通用框架已红海化。个人开发者最高 ROI 的切入点是**垂直场景 Agent**和**小而痛的工具**：精准痛点 + 可验证 demo + 社区传播。Cline、Dia、GPT Researcher、AIHawk、code2prompt 都遵循同一公式。
