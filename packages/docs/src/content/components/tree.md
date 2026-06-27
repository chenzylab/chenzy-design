---
title: Tree 树形控件
name: tree
category: show
brief: Tree（树形控件）以层级缩进的方式展示具有父子关系的结构化数据。
---

## 使用场景

Tree（树形控件）以层级缩进的方式展示具有父子关系的结构化数据，支持展开/收起节点、单选/多选、勾选（带半选/全选级联）、搜索过滤、拖拽排序等能力。典型使用场景：文件目录树、组织架构、权限菜单配置、分类导航。

Tree 支持受控与非受控两种模式，checkedKeys/expandedKeys/selectedKeys 均可外部托管。搜索过滤时可高亮匹配节点并自动展开匹配路径。

## 何时使用

在需要展示具有层级关系的树状数据时使用 Tree。如果层级不超过两级且需要全部展示，也可考虑使用嵌套 List 或 Collapse。数量极大的树形数据建议配合虚拟滚动以保证性能。

## 无障碍

- 根容器使用 `role="tree"`，子树使用 `role="group"`，每个节点使用 `role="treeitem"`；设置 `aria-expanded`（可展开节点）、`aria-selected`（选中）、`aria-checked`（勾选，半选时为 `"mixed"`）、`aria-level`/`aria-setsize`/`aria-posinset`。
- 整棵树只有一个 Tab 入口，内部通过 `aria-activedescendant` 标记当前焦点节点，避免大量 tabindex 污染 Tab 序列。
- 键盘交互遵循 WAI-ARIA Tree View Pattern：↑/↓ 上下移动，← 收起/回父级，→ 展开/进子级，Home/End 跳至首末节点，Enter/Space 选中或勾选，* 展开同级所有节点，输入字符触发 typeahead 跳转。
- `prefers-reduced-motion` 时禁用节点展开/收起动画；RTL 下 ←/→ 方向键语义镜像。
