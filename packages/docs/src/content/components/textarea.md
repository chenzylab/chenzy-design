---
title: Textarea 多行输入框
name: textarea
category: input
brief: Textarea 是多行文本输入控件，用于采集较长的、可换行的用户输入，支持自适应高度与字符计数。
---

## 使用场景

Textarea 是多行文本输入控件，用于采集较长的、可换行的用户输入（评论、备注、描述、富文本草稿源等）。相对单行 Input，它的核心增量能力是：

- **自适应高度（autosize）**：内容增减时高度自动伸缩，可约束最小/最大行数（`minRows`/`maxRows`），超过 `maxRows` 后内部滚动。
- **字符计数（counter）**：可显示 `已输入/上限` 的计数，配合 `maxCount` 在接近/超限时给出视觉反馈与无障碍提示。
- **校验态**：`validateStatus` 支持 default/warning/error/success，与计数超限态联动。

它是一个受控/非受控均支持的表单控件，遵循库统一的 `value + on:change` 约定，可被 Form/FormField 包裹，参与统一的标签、校验与错误展示。

适用：内容长度不定、需要换行；不适用：单行短文本（用 Input）、富文本（用未来的 RichTextEditor）、代码编辑（用 CodeEditor）。

## 何时使用

- 需要录入多行文本、内容较长时使用（单行短文本用 Input）。
- 需要字符计数限制或自适应高度时使用。
- 富文本编辑不适合使用 Textarea，应使用专用的富文本编辑器。

## 无障碍

- 使用原生 `<textarea>`，天然具备 `role=textbox` 与 `aria-multiline=true`，无需重写 role。
- `validateStatus=error` 时 textarea 加 `aria-invalid=true`；`disabled` 用原生 `disabled`；`readonly` 用原生 `readonly`（保留可聚焦与朗读）。
- 计数器通过 `useLiveAnnouncer`（polite，去抖）播报超限/接近上限，计数器本身不抢焦点。
- 清除按钮可 Tab 到达并 Enter/Space 触发，`aria-label` 来自 i18n；`aria-describedby` 关联计数器与错误文案。
