---
title: TimePicker 时间选择器
name: timepicker
category: input
brief: TimePicker 是时间选择控件，用于在表单中精确选取时、分、秒（可选毫秒），触发器为只读文本输入框，点击后弹出浮层呈现可滚动的时/分/秒列。
---

## 使用场景

TimePicker 是时间选择控件，用于在表单中精确选取时、分、秒（可选毫秒）。触发器为只读文本输入框，点击后弹出浮层，浮层内呈现可滚动的「时 / 分 / 秒 / 上下午」列。

核心能力：
- 12 小时制（`use12Hours`，附带 AM/PM 列）与 24 小时制切换。
- 步进控制：`hourStep`/`minuteStep`/`secondStep`，过滤不可选项。
- 精度控制：通过 `format`（如 `HH:mm`、`HH:mm:ss`、`hh:mm a`）决定显示哪些列。
- 受控/非受控值，`disabledHours`/`disabledMinutes`/`disabledSeconds` 禁用项。
- 「此刻」快捷按钮、清除按钮、范围选择（`type="timeRange"`）。

不在范围内：日期选择（由 DatePicker 负责）、倒计时/计时（由 Statistic.Timer 负责）。

## 何时使用

- 表单中需要用户精确选取时间（时分秒）时使用。
- 需要 12/24 小时制切换、步进控制或禁用时间段时使用。
- 仅需选择日期时应使用 DatePicker；日期时间组合选择使用 DatePicker 的 `dateTime` 类型。

## 无障碍

- 触发器使用 `role="combobox"`，配合 `aria-haspopup="listbox"`、`aria-expanded`、`aria-controls`；`status=error` 时 `aria-invalid="true"`。
- 浮层使用 `role="dialog"` 包裹，每列使用 `role="listbox"` 带 `aria-label`（如「小时」「分钟」），列项使用 `role="option"` 配合 `aria-selected`、`aria-disabled`。
- 键盘交互：`Enter`/`Space`/`ArrowDown` 打开浮层并聚焦当前小时列；列内 `↑/↓` 上下移动选项（循环）；`Home/End` 跳首尾；`Tab`/`Shift+Tab` 在列间移动；最后一列 Tab 移至底部操作按钮；`Esc` 关闭浮层焦点回触发器。
- `useLiveAnnouncer` 在列选中时 polite 播报已格式化的完整时间。
