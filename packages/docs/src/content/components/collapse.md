---
title: Collapse 折叠面板
name: collapse
category: show
brief: Collapse（折叠面板）用于把一组内容区域分组收纳。
---

## 使用场景

Collapse（折叠面板）用于把一组内容区域分组收纳，通过点击标题在「展开/收起」之间切换，节省垂直空间并组织信息层级。适用于设置页分组、FAQ 列表、详情折叠、表单分段等场景。

Collapse 支持多面板独立展开（默认）与手风琴模式（accordion，同一时刻至多一个面板展开）。支持受控/非受控两种用法，标题区域支持自定义右上角辅助内容（extra）、自定义展开/折叠图标（expandIcon / collapseIcon）、左/右图标位置，可通过 clickHeaderToExpand 控制热区、keepDOM / lazyRender 控制收起面板的 DOM 挂载。

## 何时使用

当需要将多条同级内容归纳为可折叠分组、让用户按需展开时使用 Collapse。不适合用于嵌套树形展开（用 Tree）、单条表格行展开（用 Table 展开行）或浮层展示（用 Popover/Dropdown）。

## 无障碍

- Header 触发器为 `role="button"` + `tabindex=0`（对齐 Semi），设 `aria-expanded` 标记展开态、`aria-owns` 关联内容区 id。
- 内容容器 `aria-hidden` 随展开态在 `true`/`false` 间切换；`disabled` 面板 `aria-disabled=true`。
- 键盘交互：Tab 依序聚焦各 Header，Enter/Space 切换当前 Header 的展开态。
- `prefers-reduced-motion` 时由 Collapsible 原语禁用高度过渡动画。
