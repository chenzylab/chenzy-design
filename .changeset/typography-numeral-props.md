---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
"@chenzy-design/tokens": minor
---

Typography 全面对齐 Semi：补 Numeral 子组件 + Text/Paragraph/Link 缺的 prop，demo 从 3 补到 11 全场景。

- **Numeral 子组件**（对齐 Semi，此前完全缺失）：`Typography.Numeral` 遍历 children 文本节点，按 `rule`（text/numbers/bytes-decimal/bytes-binary/percentages/exponential）+ `precision` + `truncate`（ceil/floor/round）+ 自定义 `parser` 格式化其中的数字。格式化引擎 `formatNumeral` 沉淀在 `@chenzy-design/core`（框架无关，13 项单元测试全过）。
- **补缺的 prop**：Text/Paragraph/Link 加 `italic`（斜体）；Text/Link 加 `icon`（前置图标 Snippet，链接下无下划线）；Paragraph 加 `spacing`（`'normal'`/`'extended'` 行距）。新增 `--cd-typography-spacing-extended` token。
- **demo 全场景**（3 → 11）：新增链接、文本大小、斜体与图标、可复制、省略（单行/多行/tooltip/后缀）、展开收起、可编辑、数值格式化，覆盖 Semi 全部场景 + 本库已有的 copyable/ellipsis/editable 强能力。meta 同步新增子组件与 props。
