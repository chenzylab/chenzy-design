# SPEC · Collapsible

> 分类：show · 阶段：M4（增补，对标 Semi 后补齐——全量核实时发现漏判，实为 Semi 正式导出组件）
> 对标 Semi：[Collapsible](https://semi.design/zh-CN/show/collapsible)（`export { Collapsible }`）
> 折叠容器**原语**：对任意内容做高度折叠/展开过渡。是 Collapse（手风琴）的底层能力，但作为独立原语暴露，供精细控制（keepDOM / lazyRender / collapseHeight）。

## 1. 概述

Collapsible 包裹任意内容，通过 `isOpen` 控制展开/折叠，带高度过渡动画。与 `Collapse`（多面板手风琴 UI）的区别：Collapsible 是**无 UI 的折叠原语**（只管高度动画 + DOM 保留策略），适合自定义折叠交互、FAQ、展开更多、嵌套折叠等。

## 2. 设计语义

**何时用**：需要给一段内容加折叠动画，但不需要 Collapse 的手风琴头部/分组 UI；或需要 keepDOM/lazyRender 等精细控制。
**何时不用**：
- 标准手风琴分组 → 用 `Collapse`。
- 简单显隐无动画 → `{#if}`。

**与本库 Collapse 的关系**：Collapse 内部用 CSS grid `0fr↔1fr` 做折叠动画（自适应高度、无 JS 测量）。Collapsible 作为**独立原语**对齐 Semi API（isOpen/duration/keepDOM/lazyRender/collapseHeight），底层可复用同一 CSS grid 方案或 JS 测高，视 collapseHeight（部分折叠）需求决定。

## 3. 分层实现

- **headless（core/）**：折叠状态/过渡态可放 `packages/core/src/collapsible.ts`（visible/isTransitioning/shouldRender 派生 + keepDOM/lazyRender 逻辑），或内联 svelte。core 禁 any。
- **渲染（svelte/）**：`Collapsible.svelte` 包裹 children，isOpen 驱动高度过渡。优先 CSS grid `0fr↔1fr`（自适应，复用 Collapse 方案）；collapseHeight>0（折叠时保留部分高度）时需 JS 测高的混合方案。

## 4. API

### Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | `false` | 是否展开。 |
| `duration` | `number` | `250` | 过渡时长（ms）。 |
| `motion` | `boolean` | `true` | 是否启用过渡动画（false 即时显隐）。 |
| `keepDOM` | `boolean` | `false` | 折叠时是否保留 DOM（false 则折叠后移除内容 DOM）。 |
| `lazyRender` | `boolean` | `false` | 首次展开前不渲染内容（配合 keepDOM，首帧惰性）。 |
| `collapseHeight` | `number` | `0` | 折叠时保留的高度（px，0=完全折叠；>0=保留部分作「展开更多」）。 |
| `collapseHeightAdaptive` | `boolean` | `false` | 折叠高度是否自适应。 |
| `fade` | `boolean` | `false` | 折叠时是否叠加透明度渐变。 |
| `reCalcKey` | `number \| string` | — | 变更时强制重算高度（内容动态变化后触发重测）。 |
| `id` | `string` | — | 内容容器 id。 |
| `onMotionEnd` | `() => void` | — | 过渡结束回调。 |
| `class` / `style` | `string` | — | 根节点。 |
| `children` | `Snippet` | — | 折叠内容。 |

### Events

| 名称 | 载荷 | 说明 |
| --- | --- | --- |
| `onMotionEnd` | — | 展开/折叠过渡动画结束。 |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 被折叠的内容 |

## 5. 主题 / Token 表

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-collapsible-motion-duration` | 默认过渡时长 | `--cd-motion-duration-mid`（可被 duration prop 覆盖） |
| `--cd-collapsible-motion-ease` | 过渡曲线 | `--cd-motion-ease-standard` |

（多数视觉由内容决定，Collapsible 只管高度过渡。）

## 6. 无障碍

- 折叠区 `aria-hidden`（完全折叠且不 keepDOM 时）/ 内容对读屏的可见性随折叠态。
- 若作为可交互折叠（配合外部触发器），触发器应 `aria-expanded` + `aria-controls` 指向内容 id（由使用方或 Collapse 提供；Collapsible 本身是原语，不含触发器）。
- reduced-motion：`motion=true` 但用户 prefers-reduced-motion 时移除过渡（即时）。
- collapseHeight>0 的「展开更多」需保证折叠态内容不被读屏当作完整内容（截断需可感知）。

## 7. 国际化

- 无内置文案（原语，纯行为）。

## 8. 文案

- 无。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte gzip | ≤ 2 KB | 默认 CSS grid 折叠；含 collapseHeight>0 的显式高度过渡 + JS 测高混合方案、fade/adaptive/reCalcKey（实测 1.77KB，预算按实测 +~15% 校准） |
| core（如建） gzip | ≤ 0.8 KB | keepDOM/lazyRender/shouldRender 派生 |

- 优先 CSS grid `0fr↔1fr`（无 JS 测高，无布局抖动）；仅 collapseHeight>0 时需 JS 测高（reCalcKey 触发，rAF 去抖）。
- lazyRender：首次展开前不渲染，省首屏成本。

## 10. AI 元数据

`component.meta.ts`：
- `name: 'Collapsible'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Collapsible'`、`relatedTo: 'Collapse'`。
- props schema；`examples`：基础折叠、keepDOM 保留 DOM、lazyRender 惰性、collapseHeight 展开更多、fade 渐变、reCalcKey 动态内容重算。
- `doNot`：需要手风琴 UI 用 Collapse；不要在 reduced-motion 保留过渡。

## 11. 测试

- **单元（core，如建）**：shouldRender 逻辑（keepDOM × lazyRender × isOpen 组合）、visible/isTransitioning 派生。
- **组件**：isOpen 展开/折叠、duration/motion、keepDOM（折叠后 DOM 存留）、lazyRender（首展前不渲染）、collapseHeight 部分折叠、onMotionEnd 触发、reCalcKey 重算。
- **a11y**：axe 无违规；折叠态 aria-hidden；reduced-motion 无过渡。
- **视觉回归**：展开/折叠态 × collapseHeight × fade × 暗色。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码（原语无文案） · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
