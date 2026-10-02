# 贡献指南

欢迎一切形式的贡献：Issue 报 bug、提需求、PR 改代码、分享你的平台适配 prompt 调优心得。

## 开发环境

```bash
npm install
cp .env.example .env.local   # 填一个模型 key（GLM-Flash 免费）
npm run dev
```

提交前请确认 `npm run build` 通过（含 TypeScript 检查）。

## 代码约定

- 业务逻辑在 `lib/`（纯函数优先，不依赖 UI）；API 路由只做参数校验、限流与编排
- 新平台适配 = 加一份 zod schema（`lib/schemas.ts`）+ 一段平台调性 prompt（`lib/prompts.ts`）+ 前端面板
  - **注意**：prompt 必须显式列出输出 JSON 的字段结构（部分 OpenAI 兼容厂商不下发 schema，模型只会照 prompt 里的字段名输出）
  - zod 约束只做安全网（宽），字数/条数等规格由 prompt 承担（严）
- 所有用户可见文案用中文；错误提示必须给出可操作的解决指引

## PR 流程

1. Fork 后从 `main` 切功能分支
2. commit message 一句话说清「改了什么 + 为什么」
3. PR 描述里附：变更摘要、验证方式（最好带截图/调用样例）

## Good first issue 方向

- 新的封面模板（`lib/cover.ts`，satori 声明式布局）
- 新平台适配（参考上述约定）
- 提示词调优（让某个平台的输出更「原生」）
