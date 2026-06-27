---
title: Collapse 折叠面板
name: collapse
category: show
brief: Collapse（折叠面板）用于把一组内容区域分组收纳。
---

## 使用场景

Collapse（折叠面板）用于把一组内容区域分组收纳，通过点击标题在「展开/收起」之间切换，节省垂直空间并组织信息层级。适用于设置页分组、FAQ 列表、详情折叠、表单分段等场景。

Collapse 支持多面板独立展开（默认）与手风琴模式（accordion，同一时刻至多一个面板展开）。支持受控/非受控两种用法，标题区域支持自定义额外内容、自定义展开图标、左/右图标位置。

## 何时使用

当需要将多条同级内容归纳为可折叠分组、让用户按需展开时使用 Collapse。不适合用于嵌套树形展开（用 Tree）、单条表格行展开（用 Table 展开行）或浮层展示（用 Popover/Dropdown）。

## 无障碍

- Header 触发器渲染为 `<button>`，外层包裹元素带 `role="heading"` + `aria-level`；按钮设 `aria-expanded` 和 `aria-controls` 关联内容区。
- 内容容器设 `role="region"` + `aria-labelledby` 关联 Header id；收起时使用 `hidden` 属性（keepDOM 时）而非仅视觉隐藏。
- 键盘交互遵循 WAI-ARIA APG Accordion 模式：Enter/Space 切换展开态，↑/↓ 在 Header 间移动焦点，Home/End 跳到首尾 Header。
- roving tabindex 管理焦点，仅当前活动 Header 的 `tabindex=0`；`prefers-reduced-motion` 时禁用高度过渡与箭头旋转动画。
