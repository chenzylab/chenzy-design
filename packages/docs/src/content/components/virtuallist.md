---
title: VirtualList 虚拟列表
name: virtuallist
category: show
brief: VirtualList 是一个虚拟滚动列表底座（headless 优先）。
---

## 使用场景

VirtualList 是一个虚拟滚动列表底座（headless 优先），用于在渲染大量列表数据时只渲染视口内的可见行，从而将 DOM 节点数量保持在常数级别，实现万级数据下流畅的 60fps 滚动体验。它是 Table、List、ScrollList 等组件虚拟化能力的底层引擎。

VirtualList 支持固定行高与动态行高两种模式，提供 overscan 预渲染、滚动到指定行、监听滚动位置等能力，适合接入任意需要大数据量展示的场景。

## 何时使用

当列表数据量超过约 200 条，页面出现明显渲染卡顿时，考虑使用 VirtualList 作为底层引擎。如果数据量在可接受范围内，普通列表的实现更简单且 a11y 更完善。VirtualList 以 headless 为主，通常不直接使用，而是通过 List、Table 等高层组件的虚拟化配置启用。

## 无障碍

- VirtualList 本身是透明容器，不添加额外 role；具体 role（`list`/`grid`/`listbox` 等）由上层调用方传入，确保语义由业务层决定。
- 每行渲染时注入 `aria-setsize`（数据总量）和 `aria-posinset`（当前行在全列表中的位置），使屏幕阅读器可感知"第 N 条，共 M 条"。
- 当前聚焦的行不会被虚拟回收，确保键盘导航时焦点不丢失；视口范围变化时通过外部 live region 播报当前展示范围。
- 滚动时不触发频繁的 ARIA 属性更新，以 rAF 节流控制更新频率，避免辅助技术被洪水般的属性变更淹没。
