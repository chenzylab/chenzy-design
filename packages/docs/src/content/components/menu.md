---
title: Menu 导航菜单
name: menu
category: navigation
brief: 导航场景的核心容器组件，用于在应用中组织一组可选的命令或导航目标。
---

## 使用场景

Menu 是导航场景的核心容器组件，用于在应用中组织一组可选的命令或导航目标。支持三种模式（mode）：`horizontal`（顶部水平导航栏）、`vertical`（侧边垂直导航）、`inline`（内嵌折叠式，子菜单在原位展开而非浮层弹出）。支持任意层级的多级嵌套（SubMenu）、分组（ItemGroup）、分隔线（Divider）。

典型用途：后台管理系统侧边栏导航（vertical/inline）；顶部产品导航栏（horizontal，子菜单浮层下拉）；长列表的分组组织（ItemGroup）。

Menu 区分两种语义角色——作为页面导航时使用 `nav` 包裹的链接列表语义，作为应用命令菜单时使用 `menu/menubar` + roving tabindex 语义。两套语义不可混用，由 `purpose` prop 显式声明。

## 何时使用

适用于应用级导航（侧边栏/顶栏）与命令菜单。选中项 selectedKeys 表达持久的「当前所在位置」；SubMenu 的展开用 openKeys 控制。

不在本组件范围：右键上下文菜单（见 Dropdown/ContextMenu）、下拉选择（见 Select）、命令面板（见 Command）。

## 无障碍

- purpose="navigation"：根节点 `<nav aria-label>`，当前项 `aria-current="page"`，SubMenu 用 `<button aria-expanded aria-controls>` + disclosure 模式，遵循自然 Tab 流。
- purpose="commands"：horizontal 根 `role="menubar"`，vertical/inline 根 `role="menu"`；Item `role="menuitem"`；roving tabindex，整组仅当前项 `tabindex=0`。
- 键盘（commands 语义）：`↑/↓` 上下移动，`←/→` 展开/收起子菜单，`Enter`/`Space` 激活，`Esc` 关闭并焦点回触发器，`Home`/`End` 跳首/末，字母键 typeahead。
- disabled 项在 commands 语义下保留焦点可达 + `aria-disabled="true"`（APG 要求）。

## 文案规范

- **菜单项用名词或动名词短语**：简洁、句首式首字母大写，避免句末标点。
- **SubMenu 同层级**：标题与子项保持同一抽象层级，避免标题与子项重名。
- **折叠指示器可读**：统一文案「More」，不用「...」纯符号。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| Dashboard | This is the dashboard. |
| Delete project | Delete |
| More | `...` |

- 破坏性命令（如「Delete account」）标记 `danger` 视觉，用明确动词 + 对象，避免置于 hover 浮层首位，执行须二次确认。
