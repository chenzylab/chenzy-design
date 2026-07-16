---
title: InputNumber 数字输入框
name: inputnumber
category: input
brief: InputNumber 是受约束的数值输入控件，在原生输入框之上增加步进按钮、键盘步进、精度控制、范围约束、格式化与解析等能力。
---

## 使用场景

InputNumber 是受约束的数值输入控件，在原生 `<input>` 之上增加：步进按钮（+/−）、键盘步进（↑/↓、PageUp/PageDown）、精度控制（小数位 round）、范围约束（min/max 自动钳制）、千分位/货币/科学计数法等格式化与解析。它解决纯文本输入无法保证「输出始终是合法数值」的问题：组件内部维护「显示字符串」与「数值」两套状态，在 `blur`/`Enter`/step 时归一化（parse → clamp → round → format），输入过程中保持宽松（允许中间态如 `-`、`1.`、`1e`）。

适用场景：表单数量、价格、百分比、坐标、配额设置等。与 Slider 常配合使用（数值精调 + 拖拽粗调）。

边界与非目标：
- 仅处理有限实数。
- 不内置单位换算/表达式求值；货币展示走内置 `currency` 或 `formatter` + `Intl.NumberFormat`。

## 何时使用

- 需要输入数值，且需要步进、范围限制、精度控制或格式化时使用。
- 配合 Slider 使用，提供数值精确调整能力。
- 纯文本录入不需要数值约束时应使用 Input。

## 无障碍

- 遵循 WAI-ARIA APG「Spinbutton」模式，使用 `role="spinbutton"` 配合 `aria-valuenow`、`aria-valuemin`、`aria-valuemax`、`aria-valuetext`。
- 步进按钮 `tabindex="-1"` 不入 tab 序，键盘步进通过输入框承载（`↑/↓` = ±step，`Shift+↑/↓` 与 `PageUp/PageDown` = ±shiftStep，`Enter` 提交并归一化）。
- 点击步进按钮通过 `mousedown.preventDefault` 不夺取输入框焦点，步进后输入框保持聚焦。
- 越界触达时通过 `useLiveAnnouncer`（`aria-live="polite"`）播报「已达最大值」等（可关闭）。
