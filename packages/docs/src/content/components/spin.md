---
title: Spin 加载指示器
name: spin
category: feedback
brief: Spin（加载指示器）用于在数据请求、异步操作或区块刷新期间向用户传达「系统正在处理」的状态。
---

## 使用场景

Spin（加载指示器）用于在数据请求、异步操作或区块刷新期间向用户传达「系统正在处理」的状态，避免用户在等待时产生卡死错觉或重复操作。它是反馈层最高频的「过程态」组件，与 Skeleton（结构占位）形成互补：Skeleton 用于首屏/结构尚未确定的占位，Spin 用于已有结构之上的短时阻塞或长时进行态。

Spin 支持三种形态：独立态（inline，自由摆放）、包裹态（wrapper，在已有内容上覆盖半透明遮罩 + 居中指示器）、全屏态（fullscreen，固定覆盖整个视口）。支持 delay 延迟显示去抖与 minShowTime 最短显示时长。

## 何时使用

当异步操作耗时较短（< 300ms）时可配合 delay 参数避免闪烁。内容结构已知时优先使用 Skeleton；进度百分比展示使用 Progress；按钮内联 loading 由 Button.loading 自带，不需要 Spin。

## 无障碍

- 指示器根节点使用 `role="status"`（隐式 `aria-live="polite"` + `aria-atomic="true"`），保证状态文本变化被屏幕阅读器播报；无 tip 时以 i18n `Spin.loading` 为 `aria-label`。
- wrapper 模式下被包裹内容在 spinning 时设 `aria-busy="true"` 并通过 `inert`/`pointer-events:none` 阻止键盘进入不可用区域；结束时恢复。
- 纯装饰的旋转 SVG/圆环加 `aria-hidden="true"`，无障碍名仅来自 status 容器文本/label；组件无可聚焦元素，不进入 Tab 序列。
- `prefers-reduced-motion` 时旋转动画改为透明度呼吸（低频 opacity 变化），不旋转，显隐改为瞬时切换。
