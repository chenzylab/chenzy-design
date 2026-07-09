---
title: Nav 导航
name: nav
category: navigation
brief: 为页面和功能提供导航的菜单列表，支持垂直/水平布局、子导航、Logo 头部与折叠收起。
---

## 使用场景

Nav（导航）为页面和功能提供入口菜单，是站点级的主导航控件。典型场景是后台系统的侧边栏（`mode="vertical"`）与顶部栏（`mode="horizontal"`），通常与 Layout 配合：`<Layout.Sider><Nav mode="vertical"/></Layout.Sider>` 或 `<Layout.Header><Nav mode="horizontal"/></Layout.Header>`。

核心能力：垂直/水平双布局；数据驱动（`items`，字段对齐 Semi 的 `itemKey`/`text`/`icon`/`items`）与声明式（`<Nav.Item>`/`<Nav.Sub>`）双写法；子导航展开（垂直内联展开、水平/折叠态浮层弹出）；Logo 头部（`header`）与底部收起按钮（`footer.collapseButton`，仅垂直）；单选/多选（`multiple` + `onDeselect`）；受控与非受控（`selectedKeys`/`openKeys`/`isCollapsed`）；缩进控制（`limitIndent`、`toggleIconPosition`）。

## 何时使用

适用于需要在页面/功能之间切换的站点级导航。强调"当前位置"（选中项 `aria-current="page"`），侧边导航可折叠为图标轨以节省空间。

Nav 不负责路由跳转本身：叶子项通过 `link` 产出原生 `<a href>` 或经回调交由宿主路由消费；也可用 `renderWrapper` 将每项包裹进路由库的 Link 组件。

## 与 Semi 的对齐

内部委托本库 Menu（`purpose="navigation"`）渲染导航体，复用其选中/展开/折叠/键盘/无障碍逻辑；对外字段与回调对齐 Semi Navigation。回调采用富载荷：`onSelect({itemKey,selectedKeys,selectedItems,domEvent,isOpen})`、`onClick({itemKey,domEvent,isOpen})`、`onOpenChange({itemKey,openKeys,domEvent,isOpen})`。

## 无障碍

- 容器渲染 `<nav>` landmark；含 `link` 的叶子渲染为原生 `<a href>`，沿用浏览器链接与 `Tab` 键序。
- 选中项 `aria-current="page"`；多选项使用 `aria-checked`。
- 折叠按钮：原生 `<button>` + `aria-expanded` + `aria-label`（文案来自 i18n `Sider.expand`/`Sider.collapse`）。
- 键盘：`Tab`/`Shift+Tab` 在可聚焦项间移动，`Enter` 激活；子导航触发器 `Enter`/`Space`/`→` 展开、`←` 收起。
