---
title: Table 表格
name: table
category: show
brief: Table 是结构化二维数据的核心展示与操作组件。
---

## 使用场景

Table 是结构化二维数据的核心展示与操作组件，是整个组件库中复杂度与性能要求最高的组件之一。它聚合了列定义驱动渲染、排序、筛选、分页、行选择（多选/单选）、行展开/树形数据、固定列/固定表头、合并单元格、自定义渲染、虚拟化滚动等能力。

典型场景：管理后台数据列表、可排序筛选报表、可选择批量操作的资源列表、树形结构（部门/菜单）展示。支持受控/非受控双轨，排序、筛选、分页、选择、展开均可与服务端数据联动。

## 何时使用

在需要以表格形式展示和操作结构化二维数据时使用 Table。若数据结构简单、无需排序筛选，也可考虑使用 List。不内置编辑单元格的完整表单引擎，可编辑表格需通过 `render` + 受控数据自行实现。

## 无障碍

- 交互型表格使用 `role="grid"`（含 `aria-rowcount`/`aria-colcount`），纯展示型使用 `role="table"`；列头使用 `role="columnheader"` + `aria-sort`，数据格使用 `role="gridcell"`。
- 键盘遵循 WAI-ARIA Grid Pattern：方向键在单元格间漫游（roving tabindex），Home/End 行首尾，Ctrl+Home/End 表首尾，PageUp/PageDown 翻视口，Space 切换行选择，Enter 触发行内主操作，F2 进入单元格编辑。
- 排序、筛选、分页、选择操作结果通过 `useLiveAnnouncer` 向屏幕阅读器播报；行复选框使用原生 `<input type="checkbox">` 并提供 `aria-label`，全选框半选态设 `aria-checked="mixed"`。
- 虚拟化场景中被回收的聚焦行，焦点回退到最近可视行并播报；`prefers-reduced-motion` 时取消展开动画。

## 文案规范

- **标签简洁无尾标点**：按钮/标签句首大写、不带尾标点；提示句可完整带句号。
- **排序筛选用"动作 + 对象"**：如 `Sort by Name`，避免歧义术语。
- **空态中性**：用中性陈述而非否定情绪文案，可替换为带引导操作的自定义 Empty。
- **计数用 ICU 复数**：避免 `1 items`。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| Sort by Name | 名字 |
| No data | 什么都没有！ |
| Delete 3 items | Delete |
| 1 item / 3 items | 1 items |

- 批量删除走 Popconfirm/Modal 二次确认，确认按钮 `danger` 态，文案明确"This will permanently delete {count} items. This cannot be undone."。
