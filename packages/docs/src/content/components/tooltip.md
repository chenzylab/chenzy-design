---
title: Tooltip 文字提示
name: tooltip
category: show
brief: Tooltip 是轻量级文字提示组件。
---

## 使用场景

Tooltip 是轻量级文字提示组件，用于在用户悬停、聚焦或触碰触发元素时，展示简短的补充说明文字。典型使用场景：图标按钮的说明（无文字标签时）、表单字段的辅助说明、长文本的简短摘要提示。

Tooltip 内容应简短（通常不超过一行），不包含可交互元素。如需在浮层中放置图片、操作按钮等复杂内容，请使用 Popover。

## 何时使用

当 UI 元素（尤其是纯图标按钮）需要简短文字说明时使用 Tooltip。不适合承载关键信息（用户可能无法悬停查看），不适合放置需要点击操作的内容（应使用 Popover 或 Dropdown）。Tooltip 的内容必须是非关键的补充信息。

## 无障碍

- 浮层使用 `role="tooltip"` + `id`，触发元素通过 `aria-describedby` 关联该 id，使屏幕阅读器可在聚焦时读取提示内容。
- 不创建焦点陷阱，Tooltip 为纯信息展示；Tab 键聚焦触发元素时显示 Tooltip，失去焦点时隐藏。
- Esc 键关闭 Tooltip 且不向上冒泡，符合 WCAG 1.4.13 的「可关闭」要求；鼠标悬停至 Tooltip 内容区仍保持显示（满足「可悬停」要求）。
- 遵循 WCAG 1.4.13：Tooltip 内容须满足「可关闭（Dismissible）、可悬停（Hoverable）、持久（Persistent）」三项要求。
