---
title: Input 输入框
name: input
category: input
brief: 单行文本输入框，表单最基础录入控件。
---

## 使用场景

单行文本输入框，表单最基础录入控件。用于采集用户输入的短文本内容，支持前后缀、字数统计、密码显隐切换等扩展能力。

## 何时使用

- 用于短文本录入时使用。
- 多行文本用 Textarea，数值用 InputNumber，选项用 Select。

## 无障碍

- 渲染原生 `<input>`，由 Form 关联 `<label>`（`for`/`aria-labelledby`）。
- 校验态 error 时 `aria-invalid="true"` 并通过 `aria-describedby` 关联错误文案。
- 清除按钮是 `<button>` 带 `aria-label`（走 i18n 文案），可键盘聚焦。
- password 显隐切换按钮有 `aria-label` 与 `aria-pressed`；正确处理 IME composition，组合期间不触发 change。
