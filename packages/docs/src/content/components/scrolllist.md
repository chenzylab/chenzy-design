---
title: ScrollList 滚动列表
name: scrolllist
category: show
brief: 滚动列表，类似 iOS 的滚动选择模式。
---

## 使用场景

ScrollList 提供了一个类似 iOS 操作系统的滚动选择模式，同时支持滚动至指定窗口位置选择与点击选择。它由容器 `ScrollList`（负责 header / footer / body 布局）与若干列 `ScrollItem` 组合而成，常见于移动端风格的时间选择器、日期滚动列等场景。

`ScrollItem` 有两种模式：`wheel`（滚轮，滚动/点击将候选项吸附到中央选区居中，可 `cycled` 无限循环）与 `normal`（普通列表，点击项即选中并高亮）。多列并排时由使用方手动放置多个 `ScrollItem` 并各自受控。

## 何时使用

在移动端或移动优先的 Web 应用中，需要用滚轮/触摸选择离散数值（如时、分、秒、月份）时使用 ScrollList。桌面端若选项较多，普通下拉选择器可能更合适；日期/时间选择可直接使用 DatePicker / TimePicker（其内部已复用 ScrollList）。

## 如何引入

```svelte
import { ScrollList, ScrollItem } from '@chenzy-design/svelte';
```

选择通过 `selectedIndex` 受控 + `onSelect(data)` 回调驱动，`data` 含 `value` / `index` / `type`（`type` 由 `ScrollItem` 传入，用于外层区分是哪一列）。

## 无障碍

- 每列的 `ul` 使用 `role="listbox"` + `aria-multiselectable="false"`，并通过 `aria-label`（来自 `ariaLabel`）提供可访问名称。
- 每个选项使用 `role="option"` + `aria-selected` 反映当前选中状态；禁用项标记 `aria-disabled`。
- 支持滚动吸附与点击选择两种交互；`prefers-reduced-motion` 下禁用缓动动画，直接定位到目标项。
