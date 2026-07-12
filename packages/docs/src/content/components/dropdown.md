---
title: Dropdown 下拉菜单
name: dropdown
category: navigation
brief: 通过触发元素唤起一组可操作的命令项的轻量级浮层菜单容器。
---

## 使用场景

Dropdown 是一个轻量级浮层菜单容器，通过触发元素（按钮、文字、图标）唤起一组可操作的命令项。与 `Select` 的本质区别是：`Select` 用于"从选项集合中选值"（受控 `value`），而 `Dropdown` 用于"触发命令/导航动作"，自身不持有选中值，点击项即执行回调。

典型场景：表格行的"更多操作"（编辑/删除/复制）；顶部导航的用户菜单（个人中心/设置/退出登录）；工具栏溢出菜单、批量操作菜单；多级嵌套菜单（子菜单 hover/点击展开）。

核心能力：四种触发方式（hover 悬浮 / focus 聚焦 / click 点击 / custom 受控 / contextMenu 右键）；12 种弹出位置；任意层级嵌套（在 `render` 内手动嵌套 `Dropdown`，其 `children` 为 `Dropdown.Item` 作子菜单触发器，对齐 Semi）；菜单项支持图标（`icon`）、type 语义色（primary/secondary/tertiary/warning/danger）、危险态、禁用、分组（`Dropdown.Title`）、分割线（`Dropdown.Divider`）、`showTick` 勾选（`active` 项左侧对勾）；受控（`visible`）/非受控（`defaultVisible`）显隐；`menu` prop 支持 JSON Array 快速配置。

## 何时使用

需要触发一组命令动作时使用，区别于 Select（数据选择）、Tooltip（纯展示）。危险操作项（`type="danger"`）应配合 Popconfirm/Modal 实现二次确认，Dropdown 自身不弹确认。

## 无障碍

- 触发元素：`aria-haspopup="menu"`、`aria-expanded`、`aria-controls` 写在**真实触发器元素本身**（对齐 Semi cloneElement 语义，非包裹层），避免受限 aria / 嵌套交互控件；浮层菜单 `role="menu"` + `aria-orientation="vertical"`，项 `role="menuitem"`，分隔线 `role="separator"`。
- 键盘：触发器上 `Enter`/`Space` 打开、`ArrowDown` 打开并聚焦首项、`ArrowUp` 打开并聚焦末项、`Escape` 关闭；浮层内 `ArrowDown`/`ArrowUp` 在同级项间漫游（roving tabindex）、`Enter`/`Space` 激活聚焦项、`Escape` 关闭并归还触发器焦点。嵌套子菜单为独立 `Dropdown`，其触发器（`Dropdown.Item`）以自身键盘/hover 展开。
- click 触发打开后焦点自动落首个非禁用项（对齐 Semi）；hover 触发不抢焦点。
- 浮层进场为 `opacity` 淡入；`prefers-reduced-motion` 时禁用动画，仅即时显隐。
