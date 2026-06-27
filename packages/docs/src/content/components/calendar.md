---
title: Calendar 日历
name: calendar
category: show
brief: Calendar 是一个面向「事件展示与排程」场景的日历组件。
---

## 使用场景

Calendar 是一个面向「事件展示与排程」场景的日历组件，以月/周/日三种视图呈现时间格与其上挂载的事件数据。它不内建事件的 CRUD，而是作为纯展示与导航载体，由调用方注入事件数据并响应用户点击/拖拽意图。

典型使用场景包括日程管理面板、预约排期系统、节假日与事件可视化、会议室占用展示。Calendar 支持受控 value（当前选中/聚焦日期）与 visibleRange（视口范围），可与外部数据源保持同步。

## 何时使用

在需要以时间为轴展示事件、安排日程、选择日期范围的场景中使用 Calendar。如果只需要选择单一日期，请使用 DatePicker 组件。Calendar 适合事件密集、需要跨日/跨周可视化的场景。

## 无障碍

- 日历容器使用 `role="grid"`，列表头使用 `role="columnheader"` 并配置 `aria-sort`，日期格子使用 `role="gridcell"`。
- 通过 roving tabindex 实现日期格的键盘导航：方向键移动焦点，Home/End 跳至行首行尾，PageUp/PageDown 切换月份，Esc 关闭展开面板。
- 视图切换与日期选择变化通过 `useLiveAnnouncer` 向屏幕阅读器播报当前聚焦日期信息。
- 事件标记不以颜色为唯一区分，需同时配合文案或图标传达语义。
