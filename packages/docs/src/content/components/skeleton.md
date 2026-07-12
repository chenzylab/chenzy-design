---
title: Skeleton 骨架屏
name: skeleton
category: feedback
brief: Skeleton（骨架屏）是在内容加载完成前，以占位灰块预渲染页面结构的反馈组件。
---

## 使用场景

Skeleton（骨架屏）是在内容加载完成前，以占位灰块预渲染页面结构的反馈组件。它通过预留与真实内容布局一致的几何形状，降低用户在等待数据返回时的感知延迟与布局抖动（CLS），避免空白屏或纯 Spinner 带来的焦虑感。

适用于首屏/卡片/列表/详情页数据加载占位，以及内容结构已知且加载耗时较长（> 300ms）的场景。提供 Skeleton.Title、Skeleton.Paragraph、Skeleton.Avatar、Skeleton.Image、Skeleton.Button 五种原子占位形状，可自由组合成任意占位模板。

## 何时使用

当内容结构已知、加载时间较长时使用 Skeleton 代替空白或纯 Spinner，以减少布局抖动和用户等待焦虑。加载时间极短（＜300ms）时无需 Skeleton；错误态使用 Empty；连续进度指示使用 Spin/Progress。

## 无障碍

Skeleton 镜像 Semi 结构：占位根节点为纯 `<div class="cd-skeleton">`，骨架块为纯装饰 `<div>`，本身不携带语义。设计取向是让骨架屏对辅助技术「透明」——不制造无意义的几何形状播报。

- 占位块均为非交互的装饰性 `<div>`，无可聚焦元素，不进入 Tab 序列；加载完成后焦点不主动移动，避免打断用户。
- 若需向屏幕阅读器播报加载态，由使用方在业务容器上按需补充 `aria-busy` / `aria-live`（组件不强加），以贴合具体页面语境。
- RTL 下容器 `direction: rtl`，shimmer 扫过方向随之镜像。
