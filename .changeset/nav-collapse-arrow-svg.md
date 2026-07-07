---
"@chenzy-design/svelte": patch
---

修复 Nav 折叠按钮（`footer={{ collapseButton: true }}`）的箭头在折叠态下几乎不可见的问题。

原箭头用浅灰细单线文本字符 `‹/›`（非 SVG），在被撑满的按钮里居中时极易被看成空白按钮。改为 SVG chevron（`stroke-width:2.5`、`currentColor`），折叠态用 `rotate(180deg)` 翻转指向展开方向，带过渡 + `prefers-reduced-motion` 降级，保证清晰可见。
