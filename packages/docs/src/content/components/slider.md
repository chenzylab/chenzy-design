---
title: Slider 滑动输入条
name: slider
category: input
brief: Slider 是用于在连续或离散区间内选择数值的输入控件，用户通过拖拽滑块手柄、点击轨道或键盘操作来选择一个值或一段范围。
---

## 使用场景

Slider 是用于在连续或离散区间内选择数值的输入控件。用户通过拖拽滑块手柄、点击轨道或键盘操作来选择一个值（单滑块）或一段范围（双滑块）。典型场景包括音量/亮度调节、价格区间筛选、图片裁剪比例、表单中的数值范围输入等。

核心能力：
- **单/双滑块**：`range=false` 返回单值 `number`；`range=true` 返回 `[number, number]` 区间，两个手柄可交叉时自动钳制顺序。
- **离散与连续**：`step` 控制步长；`step=null` 配合 `marks` 实现仅能停靠在刻度点上的非等距离散模式。
- **刻度与标记**：`marks` 渲染刻度点与文案标签；`dots` 在每个 step 处渲染圆点。
- **方向**：水平（默认）与垂直 `vertical`，垂直时高度由 `height` 控制。
- **数值提示**：拖拽/聚焦时通过 Tooltip 显示当前值，支持 `tipFormatter` 自定义、`alwaysShowTip` 常驻。

它与 InputNumber 互补：Slider 适合粗调与可视化区间，常与 InputNumber 联动做精确输入。

## 何时使用

- 用于数值范围较大、需要直观拖拽调整时使用（精确数值调整配合 InputNumber）。
- 需要展示可视化区间（如价格区间、音量）时使用。
- 精确的单数值输入应使用 InputNumber 而非 Slider。

## 无障碍

- 每个手柄使用 `role="slider"` 并配合 `aria-valuemin`、`aria-valuemax`、`aria-valuenow`、`aria-valuetext`（如「¥1,200」）；根容器使用 `role="group"` 关联外部 label。
- 双滑块时两个手柄的 `aria-valuemin/max` 动态钳制为对方当前值（防交叉的可达性表达）。
- 键盘交互：`←/↓` 减一步，`→/↑` 加一步（垂直/RTL 方向语义对应翻转）；`PageUp/PageDown` 大步进；`Home/End` 跳 min/max；双滑块 Tab 在两手柄间移动。
- 拖拽过程通过 `useLiveAnnouncer`（polite，rAF 节流）播报当前值。
