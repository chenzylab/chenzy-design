---
title: Dropdown 下拉菜单
name: dropdown
category: navigation
brief: 通过触发元素唤起一组可操作的命令项的轻量级浮层菜单容器。
---

## 使用场景

Dropdown 是一个轻量级浮层菜单容器，通过触发元素（按钮、文字、图标）唤起一组可操作的命令项。与 `Select` 的本质区别是：`Select` 用于"从选项集合中选值"（受控 `value`），而 `Dropdown` 用于"触发命令/导航动作"，自身不持有选中值，点击项即执行回调。

典型场景：表格行的"更多操作"（编辑/删除/复制）；顶部导航的用户菜单（个人中心/设置/退出登录）；工具栏溢出菜单、批量操作菜单；多级嵌套菜单（子菜单 hover/点击展开）。

核心能力：三种触发方式（hover/click/contextMenu 右键）；12 种弹出位置；任意层级嵌套；菜单项支持图标、快捷键提示、危险态、禁用、分组、分割线、单/多选勾选项；受控/非受控显隐。

## 何时使用

需要触发一组命令动作时使用，区别于 Select（数据选择）、Tooltip（纯展示）。危险操作项（`type="danger"`）应配合 Popconfirm/Modal 实现二次确认，Dropdown 自身不弹确认。

## 无障碍

- 触发元素：`aria-haspopup="menu"`，`aria-expanded={open}`，`aria-controls={menuId}`；浮层容器 `role="menu"`，普通项 `role="menuitem"`。
- 键盘：`ArrowDown`/`ArrowUp` 在同级项间漫游；`ArrowRight` 展开子菜单；`ArrowLeft` 回退父级；`Enter`/`Space` 触发；`Escape` 关闭当前层焦点回退；`Home`/`End` 跳首/末；字母键 typeahead 匹配。
- click/contextMenu 打开后焦点进入菜单（FocusTrap），关闭后归还触发元素；hover 触发不抢焦点。
- `prefers-reduced-motion` 时禁用缩放过渡，仅保留即时显隐。
