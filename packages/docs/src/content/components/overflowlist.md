---
title: OverflowList 溢出折叠列表
name: overflowlist
category: show
brief: OverflowList 是一个「溢出折叠列表」容器，在水平（或垂直）一维空间内尽可能多地渲染子项。
---

## 使用场景

OverflowList 是一个「溢出折叠列表」容器：在水平（或垂直）一维空间内尽可能多地渲染子项，超出可用空间的部分折叠为一个 +N 溢出指示器，点击可展开查看全部。典型使用场景包括标签栏溢出折叠、面包屑超长折叠、导航菜单项折叠等。

OverflowList 通过 ResizeObserver 实时监测容器尺寸变化，动态计算可见项数量，无需手动指定折叠阈值，适应各种响应式布局。

## 何时使用

在有限宽度或高度的空间内需要展示数量不固定的子项、且不希望换行或截断时使用 OverflowList。如果子项数量固定且较少，可以直接使用 flex/grid 布局。

## 无障碍

- OverflowList 容器本身透明，不添加额外 role，由调用方根据语义决定（如 `role="list"` 或 `role="navigation"`）。
- 溢出指示器（+N 按钮）渲染为 `<button>`，配置描述性 `aria-label`（如"另有 5 项"），设置 `aria-haspopup` 和 `aria-expanded`。
- 被折叠隐藏的子项从 Tab 顺序中移除，不进入键盘导航；展开后子项恢复可聚焦状态。
- 用于测量的不可见测量层设置 `aria-hidden="true"`，不向辅助技术暴露重复内容。
