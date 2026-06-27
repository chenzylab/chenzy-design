---
title: Skeleton 骨架屏
name: skeleton
category: feedback
brief: Skeleton（骨架屏）是在内容加载完成前，以占位灰块预渲染页面结构的反馈组件。
---

## 使用场景

骨架屏（Skeleton）是在内容加载完成前，以占位灰块预渲染页面结构的反馈组件。它通过预留与真实内容布局一致的几何形状，降低用户在等待数据返回时的感知延迟与布局抖动（CLS），避免空白屏或纯 Spinner 带来的焦虑感。

适用于首屏/卡片/列表/详情页数据加载占位，以及内容结构已知且加载耗时较长（`> 300ms`）的场景。提供 `Skeleton.Title`、`Skeleton.Paragraph`、`Skeleton.Avatar`、`Skeleton.Image`、`Skeleton.Button` 五种原子占位形状，可自由组合成任意占位模板。

## 何时使用

当内容结构已知、加载时间较长时使用 Skeleton 代替空白或纯 Spinner，以减少布局抖动和用户等待焦虑。加载时间极短（`< 300ms`）时无需 Skeleton；错误态使用 Empty；连续进度指示使用 Spin/Progress。

## 无障碍

- 占位根节点设 `aria-busy="true"` 和 `aria-label`（i18n `Skeleton.loading`，如"内容加载中"），供屏幕阅读器播报当前为加载态。
- 占位形状块设 `aria-hidden="true"`，不向辅助技术暴露无意义的几何形状；加载完成后移除 `aria-busy`，若 `announce=true` 则通过 live region 播报「内容已加载」。
- 占位无可聚焦元素，不进入 Tab 序列；加载完成后焦点不主动移动，避免打断用户。
- `prefers-reduced-motion` 时关闭 shimmer 动画（`animation: none`），保留静态灰块；RTL 下 shimmer 扫过方向镜像。
