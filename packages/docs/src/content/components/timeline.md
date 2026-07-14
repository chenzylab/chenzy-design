---
title: Timeline 时间轴
name: timeline
category: show
brief: Timeline（时间轴）是用于对一系列信息进行时间排序时，垂直展示的组件。
---

## 使用场景

Timeline（时间轴）用于按时间顺序、流程顺序或步骤顺序垂直展示一组有序信息，以纵向线段连接各事件节点，强调顺序性与过程感。典型使用场景：物流跟踪、操作历史记录、项目里程碑、审批流程步骤展示。

通过 `mode` 可改变时间轴与内容的相对位置（left / right / center / alternate）；可通过 `dot`、`color`、`type` 自定义节点样式，`time`、`extra` 补充时间与辅助信息。两种用法择一：在 children 内写 `<Timeline.Item>`，或传 `dataSource` 数据驱动。

## 何时使用

在需要以时间或流程为轴垂直展示一系列有序事件时使用 Timeline。如果需要强调步骤的完成状态与进度，也可考虑使用 Steps 组件。不适合用于无序的内容列表。

## 无障碍

- 组件为 `ul` / `li` 列表结构，屏幕阅读器可感知条目总数与顺序。
- 时间点的连线以及时间点本身被设置了 `aria-hidden`，不会响应 Accessibility API。
- 可通过传入 `aria-label` 设置 Timeline 组件的标签。
- 节点状态（成功 / 进行中 / 警告 / 错误）不仅以颜色区分，需同时通过文案或图标提供冗余信号。
