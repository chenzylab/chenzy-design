---
title: Card 卡片
name: card
category: show
brief: Card（卡片）是用于聚合一组相关信息与操作的容器型展示组件。
---

## 使用场景

Card（卡片）是用于聚合一组相关信息与操作的容器型展示组件。它把标题、封面图、正文内容、元信息与操作区组织在一个具有边框或阴影的矩形区域内，是列表页、仪表盘、详情页中最基础的内容承载单元。

典型使用场景：内容卡片（封面 + 标题 + 描述 + 底部操作）、信息卡片（标题 + 内容区，承载表单分组或统计指标）、网格卡片（配合 Grid/Space 在列表页批量平铺）、异步卡片（数据加载中展示骨架占位）。

## 何时使用

在需要将一组相关信息与操作归纳到一个具有视觉边界的容器内时使用 Card。Card 本身是纯展示组件，不持有交互状态；若卡片内含交互，请通过内部子组件（Button/Link）实现，避免在已有可交互子元素的情况下再使用 clickable 模式，以防产生嵌套交互的读屏歧义。

## 无障碍

- 存在 `title` 时，根节点设 `role="region"` 并通过 `aria-labelledby` 关联标题 id；无标题时作为普通容器，不设 region 角色，避免产生无名地标。
- `clickable` 模式下根节点为 `role="button"` + `tabindex="0"`，支持 Tab 聚焦，Enter 与 Space 键激活点击；`disabled` 时设 `aria-disabled="true"` 并移出 Tab 序。
- `loading` 态骨架容器加 `aria-busy="true"`，骨架块加 `aria-hidden="true"`，并提供可见隐藏文案供屏幕阅读器播报「加载中」。
- `prefers-reduced-motion` 时禁用悬停位移与阴影过渡动画。
