---
'@chenzy-design/svelte': minor
'@chenzy-design/core': minor
---

feat(svelte,core): 随包发布 AI 可消费的组件文档与源码，支撑 MCP

**svelte**：新增 `build:content` 净化管线（`scripts/build-content.ts`），构建时把文档站的组件 md 蒸馏为自洽纯 markdown 发布到 `dist/content/components/<name>.md`（84 组件全覆盖）：inline 页剥离 `<script>`、把 `<DemoBox>` 内联为 ```svelte 代码块、`<Notice>` 转 blockquote；tabbed 页静态解析 `demos.ts` 的 `entry(...)` 生成「代码演示」章节；12 个无人工文档的组件从 `components.json` 降级生成。产物随包发布，供 `@chenzy-design/mcp` 运行时从 unpkg/npmmirror 拉取。exports 新增 `./content/*`。

**core**：`files` 追加 `src`（排除 `*.test.ts`），随包发布 headless 层 `.ts` 源码，让 MCP / AI 能查框架无关的逻辑实现（对应 Semi 的 semi-foundation 源码查询）；`build` 追加 `clean-dist` 步骤剔除 dist 中的测试产物。
