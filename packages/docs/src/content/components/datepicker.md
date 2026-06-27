---
title: DatePicker 日期选择器
name: datepicker
category: input
brief: DatePicker 是一个日期/时间选择组件，通过输入框触发浮层日历面板，支持键盘输入与面板交互双通道选择。
---

## 使用场景

DatePicker 是一个日期/时间选择组件，通过输入框触发浮层日历面板，支持键盘输入与面板交互双通道选择。它是 chenzy-design 中 i18n 负担最重的组件之一：面板的周首日、月份/星期名、日期/时间格式、时区均依赖 locale。

核心能力：
- `type` 多形态：`date` | `dateTime` | `dateRange` | `dateTimeRange` | `month` | `year` | `monthRange`。
- 范围选择（双面板 + hover 预览区间高亮）。
- 时间选择联动（内嵌 TimePicker，含 12/24 小时制）。
- 受控/非受控值，支持快捷选项（presets，如「今天」「最近 7 天」）。
- 禁用日期 `disabledDate`、禁用时间 `disabledTime`、最大可选范围 `maxRange`。
- 输入框可直接键入，按 format 解析校验，解析失败回退或显示 `error` 态。
- 周首日由 locale 决定（中文周一起，部分英语区周日起），可被 `weekStartsOn` 覆盖。

典型使用：表单日期字段、范围筛选器、预约/排期时间点选择。

## 何时使用

- 表单中需要用户选择日期或日期范围时使用。
- 需要支持多种日期形态（单日、日期时间、月、年、范围）时使用。
- 不适用：仅需选择时间点（不含日期）时应使用 TimePicker。

## 无障碍

- 触发器使用 `<input role="combobox" aria-haspopup="dialog" aria-expanded aria-controls>`，`status=error` 时 `aria-invalid="true"`。
- 浮层使用 `role="dialog"`，日历网格使用 `role="grid"`，每行 `role="row"`，日期格使用 `role="gridcell"` + `<button>`。
- 键盘交互（网格内 roving tabindex）：方向键移动一天/一周；`Home`/`End` 跳本周首/末；`PageUp`/`PageDown` 上/下月；`Shift+PageUp/Down` 上/下年；`Enter`/`Space` 选中；`Esc` 关闭面板焦点回触发器；`Tab` 在面板内循环。
- 打开面板焦点移至今天或已选日期格，关闭后焦点回触发器；朗读经 `useLiveAnnouncer` 播报完整日期。
