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

## 元素与跳转（对齐 Semi）

FloatButton 严格对齐 Semi，是**纯 `div` + `onClick`**（非 `button` / `a`）：

- `href`：有值时点击经 **JS 跳转**——`target="_blank"` 用 `window.open(href, '_blank')`，否则 `window.location.href = href`（不渲染原生 `<a>`）。
- `disabled`：点击直接 `return`，不跳转、不触发 `onClick`。

## 定位

FloatButton 默认 `position: fixed`，右下角（`bottom` / `right` 各 24px，对齐 Semi）。通过 `style` 覆盖定位（如 `style="bottom:24px;right:24px"` 或改用 `left` / `top`）。`FloatButtonGroup` 平铺容器同样 `position: fixed`，经 `style` 覆盖定位。

## 形状 / 尺寸 / colorful

- `shape`：`round`（默认，正圆）/ `square`（方形，8px 圆角）。
- `size`：`small` / `default` / `large` 三档（24 / 32 / 40px）。
- `colorful`：AI 风格多彩渐变外观（白字压 AI 渐变）。
- `badge`：传入 Badge 参数（`dot` / `count` / `overflowCount` / `type` 等）时外层包裹 [Badge](/components/badge)，徽章按 Semi 几何公式贴形状切点定位。

## 无障碍

严格对齐 Semi：FloatButton 与 FloatButtonGroup 均为**纯 `div` + `onClick`**，无内置 ARIA 语义、无键盘可达、无 `focus-visible` 焦点环。`href` 经 JS 跳转而非原生链接。Group 的点击委托直接读 `e.target.dataset.value` 回传（不向上冒泡查找）。如需可访问性（可访问名、键盘操作），由消费方在业务层自行补充。
