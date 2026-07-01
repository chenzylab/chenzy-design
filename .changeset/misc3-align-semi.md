---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

逐组件样式对齐 Semi（导航/工具）：

- **Tabs**：线条式页签默认文字 text-1→text-2、选中文字 primary→text-0（深字，标示线保持 primary），对齐 Semi 线条式配色。
- **Highlight**：镜像 Semi highlight/highlight-bg——背景 warning(橙)→黄底（亮 yellow-4/暗 yellow-2）、文字 text-0→黑(亮)/白(暗)、字重 token 化(bold)；alias 补 color-highlight/color-highlight-bg。顺带修旧 token 名 --cd-radius-small → --cd-border-radius-small。
- **Backtop**：无样式 variables，无需改。

均按 Semi 源码逐条对齐值。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过。
