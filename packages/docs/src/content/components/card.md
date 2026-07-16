---
title: Card 卡片
name: card
category: show
brief: Card（卡片）是用于聚合一组相关信息与操作的容器型展示组件。
---

## 使用场景

Card（卡片）是用于聚合一组相关信息与操作的容器型展示组件。它把标题、封面图、正文内容、元信息与操作区组织在一个具有边框或阴影的矩形区域内，是列表页、仪表盘、详情页中最基础的内容承载单元。

典型使用场景：内容卡片（封面 + 标题 + 描述 + 底部操作）、信息卡片（标题 + 内容区，承载表单分组或统计指标）、卡片组（配合 CardGroup 在列表页批量平铺或网格拼接）、异步卡片（数据加载中展示 Skeleton 骨架占位）。

## 何时使用

在需要将一组相关信息与操作归纳到一个具有视觉边界的容器内时使用 Card。Card 本身是纯展示容器，不持有交互状态；若卡片内含交互，请通过内部子组件（Button/Link/Rating 等）实现。

结构上，Card 的渲染顺序为 header → cover → body → footer：

- **header**：`header` 插槽优先，否则由 `headerExtraContent`（右侧额外内容）与 `title`（标题）组成；`title` 为字符串时以 `Typography.Title heading=6` 渲染并带单行省略。
- **cover**：出血封面，铺满卡片顶部。
- **body**：`children` 正文，`loading` 为 true 时以 Skeleton（Title + Paragraph）占位；`actions` 数组化操作区以 12px 水平间距（Space）排布于正文底部。
- **footer**：自定义页脚，`footerLine` 控制其与正文的上分隔线（默认 false）。

`Card.Meta` 用于承载结构化元信息（avatar + title + description）；`Card.Group` 将多个 Card 成组排布，`type='grid'` 时以边框拼接为网格。

## 无障碍

- 存在 `title` 时，根节点设 `role="region"`；`title` 为字符串时通过 `aria-labelledby` 关联标题 id（未显式传 `ariaLabel` 时）。无标题时作为普通容器，不设 region 角色，避免产生无名地标。
- 可通过 `ariaLabel` 显式表述该 Card 的作用。
- `loading` 态根节点设 `aria-busy="true"`；Skeleton 占位容器自带 `role="status"` / `aria-busy` / `aria-live="polite"`，骨架块 `aria-hidden`。
- `CardGroup` 对齐 Semi，是纯 Space 包裹，根节点不加 `role`/`aria-label`（若需组语义，由业务在外层包裹表述）。
- `prefers-reduced-motion` 时依赖各子组件（Skeleton 动画等）自身的减弱动画降级。
