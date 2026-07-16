---
title: Pagination 分页器
name: pagination
category: navigation
brief: 在数据量较大、无法一次性展示时，将内容切分为多页并提供页间导航。
---

## 使用场景

Pagination（分页器）用于在数据量较大、无法一次性展示时，将内容切分为多页并提供页间导航。它解决三类核心问题：让用户感知数据规模（总条数/总页数）与当前所处位置；提供高效的页间跳转（上一页/下一页/直接点击页码/输入跳页）；控制每页展示密度（每页条数切换 pageSize）。

典型场景：表格底部分页、列表分页、搜索结果分页、卡片流分页。

形态分两类（对齐 Semi）：default（完整模式，页码按钮 + 上/下一页 + 省略号折叠，适合桌面端宽容器）；small（紧凑模式，仅上一页 / 当前页 current/total / 下一页，可 hoverShowPageSelect 悬停弹全部页码切页，适合移动端与窄容器）。

附加能力：跳页输入框（showQuickJumper）、每页条数选择（showSizeChanger）、总数展示（showTotal）。

## 何时使用

数据量较大需要分批展示时使用，Pagination 本身不持有数据，只负责发出页变化意图，数据切片由调用方完成。

不内置数据请求/缓存；不内置无限滚动（属 InfiniteScroll 组件）；超大页数依赖省略号 + 跳页，不渲染全部页码。

## 无障碍

- 根容器 `<nav role="navigation" aria-label>`；页码列表 `<ul>/<li>`；当前页加 `aria-current="page"`。
- "上一页/下一页"为 `<button>`，边界态加 `aria-disabled="true"` + `disabled`；省略号项 `aria-hidden="true"`。
- 键盘：roving tabindex，`←/→` 在页码项间移动焦点，`Home/End` 跳首/末，`Enter/Space` 激活翻页，跳页框内 `Enter` 提交。
- 翻页与 pageSize 变更后通过 `aria-live="polite"` 播报「第 X 页，共 Y 页」等信息。
