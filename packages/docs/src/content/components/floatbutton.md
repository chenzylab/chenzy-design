---
title: FloatButton 悬浮按钮
name: floatbutton
category: basic
brief: 悬浮固定在视口的可操作按钮，承载全局快捷入口（AI 编辑、搜索、帮助、回到顶部等），支持单个与成组。
---

## 使用场景

FloatButton 是**悬浮固定在页面视口上的可操作按钮**，用于承载全局快捷入口（AI 编辑、搜索、帮助、回到顶部等）。`FloatButtonGroup` 将多个悬浮按钮平铺成一组，统一分发点击。

- 需要一个始终可见、脱离文档流、固定在视口某角的快捷操作入口 → 用 FloatButton。
- 常规行内操作 → 用 [Button](/components/button)。
- 仅"回到顶部"单一功能 → 用 [BackTop](/components/backtop)（带滚动监听与平滑回顶）。

## 语义化元素（对标 Semi 的 a11y 增强）

Semi 的 FloatButton 是 `div + onClick`（无键盘、无 ARIA、假链接）。本库升级为语义化元素：

- 无 `href` → 渲染 `<button type="button">`，天然键盘可达（Enter / Space / 点击）、原生焦点。
- 有 `href` → 渲染 `<a href target rel>`，是真实链接；`target="_blank"` 时自动补 `rel="noopener noreferrer"`。

## 定位

FloatButton 默认 `position: fixed`，通过 `style` 用**逻辑属性**定位（推荐 `inset-inline-end` / `inset-block-end`，RTL 友好），不提供独立的 `top` / `right` / `bottom` / `left` prop（对齐 Semi）。`FloatButtonGroup` 平铺容器同样经 `style` 定位，组内子项改为 `position: static` 由容器统一排布。

## 形状 / 尺寸 / colorful

- `shape`：`round`（默认，圆角矩形）/ `square`（方形）。
- `size`：`small` / `default` / `large` 三档。
- `colorful`：AI 风格品牌蓝→紫多彩渐变外观。
- `badge`：传入 Badge 参数（`dot` / `count` / `overflowCount` / `type` 等）时外层包裹 [Badge](/components/badge)。

## 无障碍

- **语义化元素**：`<button>` / `<a>`，键盘可达、原生焦点、`focus-visible` 焦点环。
- **可访问名**：icon-only（无可视文字）必须提供 `ariaLabel`，dev 模式缺失时 `console.warn`；有 `content` / 文字则用文字。
- **Group**：`role="group"` + `aria-label`（缺省取 i18n `FloatButton.groupAriaLabel`：中「悬浮操作组」/ 英「Float actions」）；各子项为独立 button / a，逐个可 Tab。
- **disabled**：`<button>` 用原生 `disabled`；`<a>` 用 `aria-disabled` 并移出 tab 序、移除 `href`。
- **RTL**：定位用逻辑属性 `inset-inline-end`，组排布随 RTL 翻转。
