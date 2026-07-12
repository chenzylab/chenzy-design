---
'@chenzy-design/svelte': minor
---

feat(anchor): 补齐 showTooltip + position（对齐 Semi，完成 Anchor 全量对齐）

Anchor 最后两个对齐 Semi 的 prop，至此 Semi Anchor API 表全部覆盖。

- **showTooltip**: `boolean | { type: 'tooltip' | 'popover'; opts?: object }`，默认 `false`。链接文字被缩略（ellipsis）时 hover 显示完整 title 的浮层；对象形式指定用 Tooltip 还是 Popover 承载并透传 opts。
- **position**: `Placement`（12 方位），浮层弹出位置，仅 showTooltip 开启时生效。
- 缩略检测复用 core `isOverflowing()` 纯函数 + ResizeObserver（rAF 节流），普通对象记录 + 唯一 `truncRevision` $state 反应量，规避自循环。**默认 false 时零开销**（不建 RO、不包浮层）。
- 浏览器实测：缩略链接 hover 弹出 Tooltip 显示完整标题、position=right 生效、无自循环、无控制台报错。

体积预算随 Tooltip/Popover 承载校准到 4.4 KB（`.size-limit.js` + spec §9）。
