---
title: Checkbox 多选框
name: checkbox
category: input
brief: Checkbox 是用于在一组选项中进行多选，或对单一选项进行开/关二元切换的输入控件。
---

## 使用场景

Checkbox 是用于在一组选项中进行多选，或对单一选项进行开/关二元切换的输入控件。与 Radio 的互斥单选不同，Checkbox 的每一项相互独立。本组件提供三种使用形态：

- **单个 Checkbox**：独立的勾选项，受控值为 `checked: boolean`。常用于"同意协议""记住我"等单一开关。
- **CheckboxGroup**：一组 Checkbox 的容器，统一管理选中集合，受控值为 `value: (string|number)[]`，子项通过 Context 注入，自动处理 name、disabled 透传与选中态联动。
- **半选态（indeterminate）**：第三视觉状态，表达"部分子项选中"。常用于树形/分组的全选控制头。indeterminate 是纯视觉态，不影响 `checked` 的真值，由使用方根据子项状态计算并设置。

能力范围：支持禁用、卡片型（card/pureCard）展示、扩展点击热区（extra/附加描述）、受控与非受控、Group 的横纵排布。

## 何时使用

- 需要在一组选项中多选时使用 Checkbox（互斥单选用 Radio，单一即时开关用 Switch）。
- 需要表达"全选/部分选中"的控制头时，使用 indeterminate 半选态。
- 超过 5 项且需要搜索时，建议改用 Select multiple。
- 协议勾选、"记住我"等单一布尔确认场景使用单个 Checkbox。

## 无障碍

- 单项使用原生 `<input type="checkbox">`，半选态通过 `el.indeterminate = true` 设置，辅助技术自动播报 `aria-checked="mixed"`。
- CheckboxGroup 容器使用 `role="group"` 配合 `aria-labelledby` 或 `aria-label`。
- `extra` 描述文案与错误文案通过 `aria-describedby` 关联到 input；error 状态时加 `aria-invalid="true"`。
- 键盘交互：`Tab` 聚焦到 checkbox；`Space` 切换选中态；焦点使用 `:focus-visible` 显示 focus ring，鼠标点击不显示。
