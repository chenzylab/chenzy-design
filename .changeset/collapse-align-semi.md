---
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
---

Collapse 全面对齐 Semi Design（DOM / API / tokens / demo 场景全镜像，无向后兼容）。

- **DOM 对齐 Semi**：Header 由原生 `<button>`+`role=heading` 包裹改为 `<div role="button" tabindex=0>`（`aria-expanded`/`aria-disabled`/`aria-owns`）；string header 用 `.cd-collapse-header-right` 承载 extra + icon；content 用 `Collapsible` 原语折叠（`.cd-collapse-content` > `.cd-collapse-content-wrapper`，`aria-hidden` 随展开切换）；`.cd-collapse-item` 用 `border-bottom` 分隔；图标改为 expandIcon(IconChevronDown，收起) / collapseIcon(IconChevronUp，展开) 两图标切换而非旋转。
- **API 纯对齐 Semi**：移除扩展 `panels` 数据驱动 / `size` / `bordered` / `headingLevel` / `onExpand` / `onCollapse` / `onHeaderClick` / roving tabindex 与 ↑↓ 漫游；补齐 `clickHeaderToExpand` / `collapseIcon` / `Panel.reCalcKey` / `Panel.onMotionEnd` / `onChange(activeKey, e)` 带事件；`keepDOM` 默认改为 `false`（对齐 Semi）。
- **Tokens**：移除 Semi 没有的 10 个中间变量 `--cd-collapse-*`，组件直接消费 20 个原始层 `--cd-*-collapse-*`（值 / 名逐条对齐 Semi collapse/variables.scss）。
- 关联组件 `Collapsible` 的 `reCalcKey` / `onMotionEnd` 类型补 `| undefined`（`exactOptionalPropertyTypes`）。
- Demo 补至 8 个（基本 / 手风琴 / 禁用 / 隐藏图标 / 自定义图标 / extra / 箭头位置 / 仅点击箭头展开），覆盖并超出 Semi 官方场景。
