# SPEC · SplitTagGroup

> 分类：show · 阶段：M4（增补，深度对标发现——Semi 正式导出的 Tag 子组件）
> 对标 Semi：[SplitTagGroup](https://semi.design/zh-CN/show/tag)（`export { SplitTagGroup }`）
> 连接式标签组：多个 Tag 连成一体（首尾圆角、相邻边合并），视觉上是一个分段控件。

## 1. 概述

SplitTagGroup 把一组 Tag 渲染成**连接的整体**——首个子元素前缘圆角、末个子元素后缘圆角、中间相邻边合并，形成分段式外观。典型场景：分段筛选标签、连续状态标签、分段展示。

## 2. 设计语义

**何时用**：多个 Tag 需要视觉上连成一个分段控件。
**何时不用**：
- 松散标签组（可折叠）→ TagGroup。
- 单标签 → Tag。

**与 TagGroup 的区别**：TagGroup 是松散标签 + 溢出折叠；SplitTagGroup 是连接式一体（不折叠，重点在首尾圆角/合并边框的分段外观）。

## 3. 分层实现

- 纯渲染，无 core。`SplitTagGroup.svelte`（`packages/svelte/src/tag/` 内），`decorateChildren` 逻辑：给首子加前缘圆角、末子加后缘圆角、中间去圆角合并边。

## 4. API

### Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `ariaLabel` | `string` | — | 组的可访问名（`aria-label`）。 |
| `class` / `style` | `string` | — | 根节点。 |
| `children` | `Snippet` | — | 子 Tag（首尾自动加圆角、相邻合并边）。 |

### Slots

default：子 Tag。

## 5. 主题 / Token 表

复用 Tag token；`--cd-splittaggroup-*`（合并边宽/分段圆角）如需。

## 6. 无障碍

- 组容器 `role="group"` + `aria-label`（ariaLabel prop）。
- 子 Tag 保留自身 a11y；连接外观纯视觉不影响语义。

## 7. 国际化

- ariaLabel 由使用方提供。无内置文案。

## 8. 文案

- 无内置。

## 9. 性能

svelte gzip ≤ 1 KB。纯 CSS 装饰（首尾圆角/合并边），无运行时几何。

## 10. AI 元数据

`name: 'SplitTagGroup'`、`relatedTo: 'Tag'`、`semiEquivalent: 'SplitTagGroup'`。examples：分段筛选、连续状态标签。

## 11. 测试

- 组件：children 连接渲染、首尾圆角/中间合并边（class 或样式断言）。
- a11y（`*.a11y.test.ts`）：role=group + ariaLabel。

## 12. 验收标准

- [ ] 复用 Tag · [ ] 类型+JSDoc · [ ] Token（如需） · [ ] a11y · [ ] 测试 · [ ] Perf · [ ] meta · [ ] docs demo
