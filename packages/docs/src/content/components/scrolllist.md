---
title: ScrollList 滚动选择列表
name: scrolllist
category: show
brief: ScrollList 是一个 picker 风格的滚动选择列表组件。
---

## 使用场景

ScrollList 是一个 picker 风格的滚动选择列表组件，用于在圆柱滚动视图中选择数值或选项，常见于移动端风格的时间选择器、日期滚动列、省市区级联选择等场景。它通过惯性滚动将目标项吸附至中心位置完成选择。

ScrollList 可单列或多列联动使用，支持受控与非受控两种模式，适合需要在有限屏幕空间内优雅展示大量离散选项的场景。

## 何时使用

在移动端或移动优先的 Web 应用中，需要用滚轮/触摸选择数值（如时、分、秒、月份）时使用 ScrollList。在桌面端若选项较多，普通下拉选择器可能更合适；若场景为日期/时间选择，可配合 DatePicker 使用其内置的 ScrollList。

## 无障碍

- 列容器使用 `role="listbox"` + `aria-orientation="vertical"`，表明这是一个垂直方向的单列选择控件。
- 每个选项使用 `role="option"` + `aria-selected` 反映当前选中状态。
- 通过 `aria-activedescendant` 管理焦点（焦点保持在列容器上，通过 activedescendant 指向当前高亮项），避免焦点随滚动频繁跳动。
- 键盘交互：ArrowUp/Down 滚动选项，PageUp/PageDown 翻页，Home/End 跳至首尾，Tab 切换到下一列；吸附完成时通过 `useLiveAnnouncer` 播报当前选中项。
