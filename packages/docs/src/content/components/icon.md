---
title: Icon 图标
name: icon
category: basic
brief: 组件库最底层的视觉原语，负责以统一的尺寸、颜色、对齐方式渲染矢量图标。
---

## 使用场景

Icon 是组件库最底层的视觉原语，负责以统一的尺寸、颜色、对齐方式渲染矢量图标。它有两个使用层级：内置图标（配合 `@chenzy-design/icons` 包导出的具名图标组件，按需引入、tree-shaking 友好）；自定义图标（通过 `<Icon>` 容器 + slot 或 `svg`/`component` prop，把外部图标纳入统一的尺寸/颜色/旋转/状态体系）。

它解决三个一致性问题：尺寸统一（通过 `size` 枚举映射到 token，保证与同行 Button/Input 文本基线对齐）；颜色继承（默认 `fill: currentColor`，跟随父级文本色）；a11y 默认正确（装饰性图标默认对屏幕阅读器隐藏，语义图标强制要求 `label`）。

## 何时使用

在需要矢量图标的任意场景使用。被点击的场景应由外层 Button/可聚焦容器承载，Icon 不自带点击语义角色，避免给非交互元素绑定 `on:click`。

## 无障碍

- 装饰性图标（无 `label`/无 `title` slot）：根元素 `aria-hidden="true"`，内部 `<svg>` 设 `focusable="false"`，对辅助技术完全透明。
- 语义图标（有 `label` 或 `title` slot）：根元素 `role="img"`；`label` → `aria-label`；`title` slot → 生成 `<title>` 并 `aria-labelledby` 指向它。
- `@media (prefers-reduced-motion: reduce)` 下禁用 `spin` 动画，保持静态。
- Icon 本身不可聚焦，不进入 tab 序列。
