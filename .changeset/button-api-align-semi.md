---
"@chenzy-design/svelte": minor
---

Button / ButtonGroup / SplitButtonGroup API 对齐 Semi：

新增（透传能力）：

- Button：`class`、`style`、`contentClassName`、`noHorizontalPadding`（`boolean|'left'|'right'|('left'|'right')[]`，仅 icon 时去单/双侧水平内距），以及 `onmousedown`/`onmouseenter`/`onmouseleave` 事件。
- ButtonGroup：`colorful`（经 context 透传给组内 Button）、`class`、`style`。
- SplitButtonGroup：`class`、`style`、`ariaLabel`。

破坏性变更：

- **移除 Button 的 `href`**。链接式跳转统一改用 `Typography.Link`（对齐 Semi，Semi Button 亦无 href）。原 `<Button href>` 渲染的 `<a role=button>` 分支一并移除。迁移：`<Button href="...">x</Button>` → `<Typography.Link href="...">x</Typography.Link>`。
