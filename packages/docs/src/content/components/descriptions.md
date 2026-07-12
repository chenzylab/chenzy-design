---
title: Descriptions 描述列表
name: descriptions
category: show
brief: Descriptions（描述列表）用于键值对的成组呈现。
---

## 使用场景

Descriptions（描述列表）用于成组地展示只读的「字段—值」键值对，常见于详情页的基本信息面板、订单信息展示、用户档案等场景。它以规整的键—值布局呈现一组结构化数据，强调信息的可读性与对齐感。

可以通过 `data` 以键值对数组方式传入数据，也可以用 `<Descriptions.Item>` 声明式写法。key、value 均支持字符串或富内容（Snippet），你可以自由定制渲染效果。

## 何时使用

在需要以结构化方式展示一组只读键值信息时使用 Descriptions。不适合用于可编辑表单（请使用 Form 组件），也不适合用于需要对数据进行操作的场景。

## 对齐与布局

- `align` 控制对齐方式，支持 `center`（默认）、`justify`、`left`、`plain`；当 `row` 为 `true` 时该配置失效。
- `layout` 控制布局模式，支持 `vertical`（默认）与 `horizontal`；横向布局下可配合 `column` 指定每行最大列数。
- `row` 开启双行显示，支持 `small`、`medium`（默认）、`large` 三种大小。
- `keyStyle` 可自定义 key 的样式（如固定宽度实现对齐）。

## 无障碍

- 使用 `<table>` 语义结构承载键值对，key 渲染为 `<th>`、value 渲染为 `<td>`（`plain`/横向布局下 key 与 value 同排为单个 `<td>`）。
- `plain` 及横向布局下 key 后附内联冒号，屏幕阅读器可自然感知字段与值的对应关系。
- `hidden` 为 `true` 的数据项不渲染，不进入无障碍树。
- Descriptions 为纯展示组件，无键盘交互需求，不设置 `tabindex`，不进入 Tab 序列。
