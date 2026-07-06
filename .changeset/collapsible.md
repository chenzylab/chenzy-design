---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
"@chenzy-design/tokens": minor
---

新增 Collapsible 折叠容器原语（对标 Semi 2.101.0，全量核实时补齐的漏判组件）。对任意 children 做高度折叠/展开过渡，无触发器 UI（aria-expanded 由使用方提供），是 Collapse 手风琴的底层能力，作为独立原语暴露以支持 keepDOM / lazyRender / collapseHeight 等精细控制。

- 默认（collapseHeight=0）用 CSS grid `0fr↔1fr` 自适应折叠——无 JS 测量、无布局抖动（复用 Collapse 方案）；collapseHeight>0（「展开更多」部分折叠）时改用显式高度过渡 + rAF 去抖的 JS 测高（reCalcKey / ResizeObserver 触发重测，写读分离规避 effect 循环）。
- props：isOpen / duration / motion / keepDOM / lazyRender / collapseHeight / collapseHeightAdaptive / fade / reCalcKey / id / onMotionEnd / class / style / children。
- core headless：`collapsibleShouldRender`（keepDOM × lazyRender × isOpen × collapseHeight 组合派生）+ `collapsibleCollapsedHeight`（自适应折叠高度）。
- a11y：完全折叠且不可见时内容 `aria-hidden`；prefers-reduced-motion 移除过渡。
- tokens：`--cd-collapsible-motion-duration` / `--cd-collapsible-motion-ease`。
