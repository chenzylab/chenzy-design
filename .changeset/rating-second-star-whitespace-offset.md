---
'@chenzy-design/svelte': patch
---

fix(rating): 修复窄行高容器内星星图标被裁剪不可见的问题

`RatingItem.svelte` 模板里 `{#if allowHalf && !isEmpty}...{/if}` 与紧邻的 `<div>` 之间的换行/缩进被 Svelte 编译成孤立的空白文本节点。这个空白节点是行内内容，在 `.cd-rating-star-wrapper`（`overflow:hidden`，高度由 `size` prop 决定，如 10px）内部继承了外层容器的 `line-height`（如 JsonViewer 编辑器场景下的 20px）撑出一整行高度，把后面 `display:block` 的星星内容层挤出可视区域、被 `overflow:hidden` 完全裁掉——星星图标在 DOM 里存在、computed style 也显示可见，但实际渲染位置落在裁剪区外，肉眼完全看不到。

复现场景：`JsonViewer` 的 `customRenderRule` demo 里用 `<Rating size={10} disabled />` 渲染 JSON 值，星星在正常页面（行高较大）下正常显示，但嵌入行高仅 20px 的 JSON 编辑器行时完全不可见。

修复：清理模板里 `{#if}`/`{/if}` 与相邻块级元素之间产生孤立空白文本节点的换行，避免行内空白节点在窄行高容器里意外撑出一整行。
