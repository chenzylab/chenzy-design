---
title: TreeSelect 树形选择器
name: treeselect
category: input
brief: TreeSelect 是「树形数据 + 下拉选择」的复合输入控件，把 Tree 的层级结构折叠进一个 Select 触发器中，用于在具有父子层级关系的数据里做单选或多选。
---

## 使用场景

TreeSelect 是「树形数据 + 下拉选择」的复合输入控件：把 Tree 的层级结构折叠进一个 Select 触发器中，用于在具有父子层级关系的数据（组织架构、地区级联、分类目录、权限节点）里做单选或多选。它的核心定位是替代「层级很深、用 Cascader 又非严格逐级、用普通 Select 又丢失层级语义」的场景。

与库内相邻组件的边界：
- 对比 Select：TreeSelect 的选项是树而非扁平列表，新增展开/收起、父子联动选择、leafOnly 等概念。
- 对比 Cascader：Cascader 强调「逐级路径选择」（必须一级一级走），TreeSelect 允许直接勾选任意节点、支持父子级联与跨层级多选。
- 对比 Tree：Tree 是常驻面板的纯结构控件，TreeSelect 把它包进浮层并提供回填到触发器的语义。

关键能力：单选/多选、父子级联勾选（checked/halfChecked）、leafOnly、搜索过滤（远程/本地）、虚拟化长列表、异步加载子节点（loadData）、自定义回填渲染、校验态、尺寸。

## 何时使用

- 数据具有树形层级结构，需要折叠展示并支持选择时使用。
- 允许直接选择任意节点（非严格逐级路径）时使用（严格逐级选择应使用 Cascader）。
- 扁平列表数据应使用 Select；常驻展示树形结构应使用 Tree。

## 无障碍

- 触发器使用 `role="combobox"`，配合 `aria-haspopup="tree"`、`aria-expanded`、`aria-controls`、`aria-activedescendant`；`status=error` 时 `aria-invalid="true"`。
- 浮层列表使用 `role="tree"`，多选时 `aria-multiselectable`；节点使用 `role="treeitem"` 配合 `aria-level`、`aria-setsize`、`aria-posinset`、`aria-expanded`、`aria-selected`（单选）/`aria-checked`（多选，支持 `mixed` 表示半选）、`aria-disabled`。
- 键盘交互：触发器 `Enter`/`Space`/`Down` 打开浮层并聚焦首个/已选节点；列表内 `Up/Down` 移动高亮（roving，跨展开节点连续）；`Left` 收起或跳父节点，`Right` 展开或进入首子节点；`Home/End` 首/末；`Enter`/`Space` 选中；`Esc` 关闭浮层焦点回触发器；`Tab` 离开关闭。
