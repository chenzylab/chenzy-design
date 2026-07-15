---
title: Layout 布局
name: layout
category: basic
brief: 用于快捷划分页面整体布局。
---

## 使用场景

Layout 是页面级骨架容器，用于快捷划分页面整体布局。它由 5 个协作组件构成：`Layout`（布局容器，其下可嵌套 Header / Sider / Content / Footer 或 Layout 本身）、`Layout.Header`（顶部布局）、`Layout.Sider`（侧边栏）、`Layout.Content`（内容区，自动撑满剩余空间）、`Layout.Footer`（页脚）。

方向自动推断：Layout 默认 column 方向，当直接子节点中存在 Sider 时自动切换为 row，无需手动指定 hasSider（SSR 首屏可显式传 hasSider 避免闪动）。

典型场景：管理后台 Dashboard、文档站、设置页。

## 注意事项

- 布局组件采用 Flex 布局实现，无法在非现代浏览器中工作。
- Layout 组件仅负责布局，**不会附带背景色、文本色、宽高等样式**。请根据实际需求传入 `style` 或给定 `class` 另行编写 CSS。

## 何时使用

适用于需要标准页头/侧边栏/内容/页脚结构的页面骨架搭建，尤其是管理后台类应用。

不负责导航逻辑（交给 Nav）、不负责栅格（交给 Grid/Row/Col）。

## 响应式

Sider 预设六个响应尺寸：`xs`、`sm`、`md`、`lg`、`xl`、`xxl`。通过 `breakpoint` 属性设置断点，命中 / 解除时经 `onBreakpoint(screen, matched)` 回调。

```text
{
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
}
```

## 无障碍

- 默认使用 landmark 语义标签：Header→`<header>`，Content→`<main>`，Footer→`<footer>`，Sider→`<aside>`。
- Sider 可传 `aria-label` 描述该侧栏作用；Header / Content / Footer 可传 `role` / `aria-label` 描述对应区域。
