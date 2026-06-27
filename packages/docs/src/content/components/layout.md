---
title: Layout 布局
name: layout
category: basic
brief: 页面级骨架容器，用于快速搭建「页头 / 侧边栏 / 主体 / 页脚」的标准后台布局。
---

## 使用场景

Layout 是页面级骨架容器，用于快速搭建「页头 / 侧边栏 / 主体 / 页脚」的标准后台布局。它由 5 个协作组件构成：`Layout`（根容器，承载整体方向与背景）、`Layout.Header`（页头，通常固定高度，可吸顶 sticky）、`Layout.Sider`（侧边栏，可折叠 collapsible，支持响应式断点自动收起）、`Layout.Content`（主体内容区，自动撑满剩余空间）、`Layout.Footer`（页脚）。

核心解决两个排版问题：方向自动推断（Layout 默认 column 方向，当直接子节点中存在 Sider 时自动切换为 row，无需手动指定 hasSider）；侧边栏折叠（Sider 提供受控/非受控折叠、宽度过渡动画、断点响应、自定义触发器）。

典型场景：管理后台 Dashboard、文档站、设置页。

## 何时使用

适用于需要标准页头/侧边栏/内容/页脚结构的页面骨架搭建，尤其是管理后台类应用。

不负责导航逻辑（交给 Nav/Menu）、不负责栅格（交给 Grid/Row/Col）、不负责响应式断点之外的复杂自适应。

## 无障碍

- 默认使用 landmark 标签：Header→`<header>`，Content→`<main>`，Footer→`<footer>`，Sider→`<aside>`（role complementary）。
- Sider 折叠触发器为 `<button>`，`aria-expanded={!collapsed}`，`aria-controls={siderId}`，`aria-label` 取 i18n；键盘 Enter/Space 触发 toggle。
- `collapsedWidth=0` 时被隐藏内容使用 `display:none`/`visibility:hidden` + `inert`，避免焦点落入不可见区域。
- `prefers-reduced-motion` 下宽度过渡时长设为 0ms；折叠态变化通过 live region 朗读结果。
