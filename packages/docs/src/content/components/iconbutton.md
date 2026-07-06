---
title: IconButton 图标按钮
name: iconbutton
category: basic
brief: 纯图标动作按钮，等价于 Button 传 icon 且无文字，但强制 ariaLabel 必填以保证可访问名。
---

## 使用场景

IconButton 是纯图标按钮的便捷组件：等价于 `Button` 传 `icon` 且无文字，但在组件层面强制 `ariaLabel` 必填，并默认方形/对称内边距。用于工具栏、卡片操作区、输入框后缀等纯图标动作入口。

它是 Button 的极薄封装：转发全部 Button props（`type` / `theme` / `size` / `disabled` / `loading` / `colorful` / `circle` / `noHorizontalPadding` 等）+ `icon`，内部渲染 `<Button icon ariaLabel {...rest} />` 而不传 children，复用 Button 已实现的 icon-only 语义（无 children + 有 icon → 收成方形、去水平内距）。相较直接用 Button，它的增量价值是：`ariaLabel` 从可选变必填（类型必填 + dev 模式缺失时 `console.warn`）。

## 何时使用

- 只显示一个图标、无文字的动作按钮，且希望组件层面强约束可访问名。
- 有文字（或图标 + 文字）→ 用 [Button](/components/button)（`icon` + children）。

## circle 与 Button 共用

`circle` 为新增能力，圆形按钮（`border-radius: 50%`），配合 icon-only 的方形尺寸得到正圆。该 prop 同样可用于 `Button`，两者共用同一套 `--cd-button-*` token，不引入新 token。

## 无障碍

- **强制可访问名**：`ariaLabel` 必填 → 原生 `<button aria-label>`；dev 模式缺失/空串时 `console.warn`。
- 复用 Button 的 a11y：原生 `<button>`、Enter / Space 触发、`aria-busy`（loading）、原生 `disabled`、内部 spin 图标 `aria-hidden`。
- 命中目标：icon-only 按钮收成方形，small 尺寸下仍满足 WCAG 2.5.8 的命中区要求。
- `@media (prefers-reduced-motion: reduce)` 下 loading 图标停转。
