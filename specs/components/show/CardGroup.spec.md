# SPEC · CardGroup

> 分类：show · 阶段：M4（增补，深度对标发现——Semi 正式导出的 Card 子组件）
> 对标 Semi：[Card.Group / CardGroup](https://semi.design/zh-CN/show/card)（`export { CardGroup }`）
> 卡片组容器：将多个 Card 以网格方式成组排布，统一间距。

## 1. 概述

CardGroup 把多个 Card 网格化排布（`type='grid'`），统一控制卡片间距（`spacing`）。典型场景：卡片列表、仪表盘卡片墙。

## 2. 设计语义

**何时用**：多个 Card 需要网格统一布局与间距。
**何时不用**：单卡片 → Card；任意元素网格 → Grid/Space。CardGroup 是 Card 语义的便捷网格容器。

## 3. 分层实现

- 纯渲染，无 core。`CardGroup.svelte`（`packages/svelte/src/card/` 内），用 CSS grid/flex 排布 children，spacing 控制间距。

## 4. API

### Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `spacing` | `number \| number[]` | — | 卡片间距（number=统一；[x,y]=水平/垂直）。 |
| `type` | `'grid'` | `'grid'` | 排布类型（当前仅 grid）。 |
| `class` / `style` | `string` | — | 根节点。 |
| `children` | `Snippet` | — | 子 Card。 |

### Slots

default：子 Card。

## 5. 主题 / Token 表

`--cd-cardgroup-spacing`（默认间距，可被 spacing prop 覆盖），复用 Card token。

## 6. 无障碍

- 容器 `role="group"`（或 list/listitem，视语义）+ 可选 aria-label。卡片本身 a11y 由 Card 提供。

## 7. 国际化

- 无内置文案。

## 8. 文案

- 无。

## 9. 性能

svelte gzip ≤ 1 KB。纯 CSS 布局，无运行时。size-limit 与 Card 合并度量（dir `card`），预算按实测校准（`{ Card, CardGroup }` ≈ 3.41 KB → 预算 3.7 KB）。

## 10. AI 元数据

`name: 'CardGroup'`、`relatedTo: 'Card'`、`semiEquivalent: 'CardGroup'`。examples：网格卡片墙、自定义 spacing。

## 11. 测试

- 组件：children 网格渲染、spacing（number/数组）。
- a11y（`*.a11y.test.ts`）：role=group。

## 12. 验收标准

- [ ] 复用 Card · [ ] 类型+JSDoc · [ ] Token · [ ] a11y · [ ] 测试 · [ ] Perf · [ ] meta · [ ] docs demo
