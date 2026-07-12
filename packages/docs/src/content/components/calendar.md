---
title: Calendar 日历
name: calendar
category: show
brief: Calendar 是一个面向「事件展示与排程」场景的日历组件。
---

## 使用场景

Calendar 是一个面向「事件展示与排程」场景的日历组件，以日 / 周 / 月 / 多日四种视图呈现时间格与其上挂载的事件数据。它不内建事件的 CRUD，而是作为纯展示与导航载体，由调用方通过 `events` 注入事件数据、`displayValue` 指定展示锚点，并响应用户对时间格的点击意图（`onClick`）。

典型使用场景包括日程管理面板、预约排期系统、节假日与事件可视化、会议室占用展示。

## 何时使用

在需要以时间为轴展示事件、安排日程的场景中使用 Calendar。如果只需要选择单一日期，请使用 DatePicker 组件。Calendar 适合事件密集、需要跨日 / 跨周可视化的场景。

## 无障碍

- 日历容器使用 `role="grid"`，星期 / 日期表头使用 `role="columnheader"`，日期格子（日 / 周 / 多日视图的列、月视图的日格）使用 `role="gridcell"`。
- 日 / 周 / 多日视图的半小时时间格为可点击按钮并带日期时间 `aria-label`；月视图 today 格设 `aria-current="date"`。
- 事件标记不以颜色为唯一区分，需同时配合文案或图标传达语义。
