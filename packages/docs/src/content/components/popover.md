---
title: Popover 气泡卡片
name: popover
category: show
brief: Popover（气泡卡片）是一个由用户交互触发、相对于触发元素定位的轻量浮层容器。
---

## 使用场景

Popover（气泡卡片）是一个由用户交互触发、相对于触发元素定位的轻量浮层容器，用于承载比 Tooltip 更丰富的内容（标题、描述、操作按钮、自定义内容）。典型使用场景包括操作菜单展示、字段说明详情、富文本提示、用户信息卡片等。

Popover 支持 click/hover/focus 多种触发方式，支持 12 个方位定位（自动翻转防止溢出视口），并可通过 slot 自由组合内容区。

## 何时使用

当 Tooltip 的纯文字提示不足以表达所需信息、需要在浮层中展示更丰富内容（如图片、操作按钮）时使用 Popover。若内容为简单文字描述，优先使用 Tooltip；若需要模态阻断或更大内容区，考虑使用 Modal 或 SideSheet。

## 无障碍

- 含可交互内容且由点击触发时，浮层使用 `role="dialog"` + `aria-modal="false"`；纯信息展示且由悬停触发时使用 `role="tooltip"`。
- 触发元素设 `aria-haspopup`、`aria-expanded` 和 `aria-controls` 关联浮层 id。
- 点击触发的 Popover 提供轻量焦点陷阱（Tab 循环于浮层内）；Esc 键关闭浮层；关闭后焦点归还触发元素（returnFocus）。
- hover 触发的 tooltip 类型遵循 WCAG 1.4.13（内容可悬停、可关闭、不自动消失）。
