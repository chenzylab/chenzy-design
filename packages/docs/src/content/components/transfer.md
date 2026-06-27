---
title: Transfer 穿梭框
name: transfer
category: input
brief: Transfer（穿梭框）用于在两组数据集合之间移动条目，实现"源 → 已选"的双栏选择交互。
---

## 使用场景

Transfer（穿梭框）用于在两组数据集合之间移动条目，实现"源 → 已选"的双栏选择交互。典型场景：权限分配、字段配置、人员/标签批量挑选等需要从大量候选中筛选出一个有序子集的表单输入。

核心能力：
- 双栏布局：左侧为候选源列表（source pool），右侧为已选列表（selected pool）。
- 双栏独立搜索过滤：每栏顶部带搜索框，按 `filter(input, item)` 实时过滤；远程场景支持 `onSearch` 异步拉取。
- 条目移动：勾选条目后点击中间方向按钮在两栏间移动；支持双击单条快速移动。
- 全选/反选：每栏头部 checkbox 控制当前（过滤后）可见项的全选/取消。
- 受控值：`value` 为已选项 key 数组，移动即触发 `on:change`。
- 三种数据规模策略：小数据直渲、大数据虚拟化（`virtualize`）、远程分页。

## 何时使用

- 需要从大量候选条目中选出一组结果，并支持双向移动时使用。
- 权限分配、字段配置、人员挑选等业务场景使用。
- 简单多选场景（无需双栏展示）应使用 Select multiple 或 Checkbox。

## 无障碍

- 每栏列表容器使用 `role="listbox"` 配合 `aria-multiselectable="true"`、`aria-labelledby` 指向栏头标题；条目使用 `role="option"` 配合 `aria-selected`、`aria-disabled`。
- 全选 checkbox 使用原生 `<input type=checkbox>`，`aria-controls` 指向对应 listbox；方向按钮为原生 `<button>` 带 `aria-label`，无勾选项时 `disabled`；搜索框使用 `role="searchbox"`。
- 键盘交互：`Tab` 在左搜索→左列表→操作区→右搜索→右列表之间移动（列表为单一 Tab stop）；列表内 `↑/↓` roving 移动；`Space` 切换勾选；`Shift+↑/↓` 范围多选；`Enter`（列表聚焦时）移动勾选项到对侧。
- 移动条目后焦点保留在源列表；`useLiveAnnouncer` polite 播报「已移动 N 项」。
