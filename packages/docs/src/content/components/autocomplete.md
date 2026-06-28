---
title: AutoComplete 输入联想补全
name: autocomplete
category: input
brief: AutoComplete（输入联想补全）是一个文本输入框，用户键入时实时弹出候选列表，可用键盘或鼠标从候选中选择并回填到输入框。
---

## 使用场景

AutoComplete（输入联想补全）是一个文本输入框，用户键入时实时弹出候选列表，可用键盘或鼠标从候选中选择并回填到输入框。它介于 `Input` 与 `Select` 之间：值始终是自由文本（不强制从选项中选），选项只作为输入建议。

典型场景：
- 搜索框历史/热词联想（远程异步补全）。
- 邮箱后缀补全（输入 `tom` → `tom@gmail.com / tom@qq.com`）。
- 表单字段的本地建议（地址、标签、命令）。

与相邻组件的边界：
- 与 `Select`：Select 的值必须来自选项集合，AutoComplete 的值是任意字符串，选项仅为建议；AutoComplete 不渲染「未匹配/空」时的强制校验。
- 与 `Cascader/TreeSelect`：AutoComplete 候选为扁平一维列表，无层级。
- 与 `Mentions`：Mentions 在文本中部触发，AutoComplete 针对整个输入值。

核心能力：本地/远程数据源、自定义过滤、防抖、受控/非受控、虚拟化长列表、选项分组与自定义渲染、loading/empty 态、键盘全交互、尺寸与校验态。

## 何时使用

- 用于搜索框历史/热词联想、邮箱后缀补全等场景，值为任意字符串，选项仅为建议时使用。
- 候选项为扁平一维列表，无层级关系时使用（有层级用 Cascader/TreeSelect）。
- 需要区分「自由输入」与「采纳建议」两种输入语义时使用。
- 不适用：值必须来自选项集合时应使用 Select；需要在文本中部触发时应使用 Mentions。

## 无障碍

- 遵循 WAI-ARIA APG「Combobox with list autocomplete」模式（`aria-activedescendant` 变体，焦点不离开输入框）。
- 输入框使用 `role="combobox"`，配合 `aria-expanded`、`aria-controls`、`aria-autocomplete="list"`、`aria-haspopup="listbox"`、`aria-activedescendant`。
- 候选面板使用 `role="listbox"`，每项使用 `role="option"` 并配合 `aria-selected`、`aria-disabled`。
- 键盘交互：`↓/↑` 移动高亮项（焦点常驻输入框）；`Enter` 选中当前高亮项；`Esc` 关闭面板保留文本；`Home/End` 跳首/末项；`Tab` 关闭面板并移出焦点。
