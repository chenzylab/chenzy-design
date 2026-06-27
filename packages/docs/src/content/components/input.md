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

## 文案规范

- **placeholder 是提示不是 label**：用于提示输入内容，不替代 label，不可作为唯一说明。
- **提示简洁**：示意期望输入的内容或格式，避免冗长指令。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 搜索项目名称 | 请在此处输入（无 label 时） |
| 例：name@example.com | 请输入您的电子邮件地址进行登录验证 |
