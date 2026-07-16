---
title: TagInput 标签输入框
name: taginput
category: input
brief: TagInput 用于在单个输入框内录入并管理一组离散的字符串标签。
---

## 使用场景

TagInput 用于在单个输入框内录入并管理一组离散的字符串标签。典型场景：邮件收件人、关键词/标签录入、过滤条件集合、Token 化的搜索词。

核心行为：
- 输入态：在末尾输入框中键入文本，按 Enter（或可配置的分隔符）将当前文本提交为一个标签。
- 标签态：已提交的标签以 Tag 形式排列在输入框内，每个标签可点击关闭按钮删除；当输入框为空时按 Backspace 删除最后一个标签。
- 集合态：value 是受控的 `string[]`，对外通过 `on:change` 同步。

与相邻组件的边界：
- 与 Select（multiple）的区别：TagInput 是自由输入（任意字符串），不依赖候选项列表；Select 是从枚举候选中多选。
- 与 Input 的区别：Input 输出单个字符串，TagInput 输出字符串数组并带标签渲染。

## 何时使用

- 需要录入一组自由文本标签时使用（内容固定的多选应使用 Select multiple）。
- 邮件收件人、关键词录入、标签管理等场景使用。
- 富对象标签（带 value/label 映射）应使用 Select multiple。

## 无障碍

- 容器使用 `role="group"` 绑定 `aria-label`；标签复用 Tag 组件渲染，关闭按钮由 Tag 提供（`closable`）。
- 末尾输入框为原生 `<input>`，容器 `aria-invalid` 跟随 `validateStatus==='error'`。
- 键盘交互：`Enter` 提交当前输入（按 `separator` 拆分为多标签）；`Backspace`（输入框为空时）删除最后一个标签。
- `draggable` 拖拽重排仅为鼠标增强（HTML5 DnD），键盘增删标签交互不受影响。
