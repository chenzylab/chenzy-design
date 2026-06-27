---
title: Rating 评分
name: rating
category: input
brief: Rating 是一个用于评分与展示评价等级的输入组件，用户通过点击或键盘选择 1~N 个图标表达评分，也可作为只读模式展示既定分值。
---

## 使用场景

Rating 是一个用于评分与展示评价等级的输入组件。用户通过点击或键盘选择 1~N 个图标（默认星形）表达评分；也可作为只读模式展示既定分值。核心能力：

- **半星（allowHalf）**：单个图标可表达 0.5 粒度，支持点击图标左半 / 右半区域分别设值。
- **自定义字符（character）**：默认星形，可替换为任意图标、文本字符或按 index 返回不同节点的函数。
- **键盘可达**：方向键增减分值、Home/End 跳至边界、数字键直接定位，符合 slider 语义。
- **悬停反馈**：hover 时高亮预览分值并触发 on:hoverChange，移出复位至当前 value。
- **附加能力**：count（图标数量）、size、disabled、status 校验态、tooltips（逐项提示文案）、clearable（再次点击当前值清零）。

典型使用场景：商品评价、满意度调研、内容打分、只读评分展示。

## 何时使用

- 需要用户以图标（星形等）的数量表达评价等级时使用。
- 只读展示已有评分数据时使用（设置 `readonly` 属性）。
- 精确数值输入场景不适合使用 Rating，应使用 InputNumber 或 Slider。

## 无障碍

- 根容器使用 `role="slider"` 并配合 `aria-valuemin`、`aria-valuemax`、`aria-valuenow`、`aria-valuetext`（如「3 颗星，共 5 颗」）；`disabled` 时 `aria-disabled="true"`，`readonly` 时 `aria-readonly="true"`，error 时 `aria-invalid="true"`。
- 整个评分为单一 Tab 停靠点；键盘交互：`→`/`↑` 加步，`←`/`↓` 减步，`Home` 最小值，`End` 最大值（count），`Delete`/`Backspace` 清零，`1~9` 数字键直接定位。
- RTL 下左右方向键语义镜像；值变更经 `useLiveAnnouncer` polite 播报 `aria-valuetext`。
