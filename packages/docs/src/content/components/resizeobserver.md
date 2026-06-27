---
title: ResizeObserver 尺寸监听
name: resizeobserver
category: other
brief: 无渲染（renderless）尺寸监听工具组件，封装浏览器原生 ResizeObserver API，监听子元素的盒模型尺寸变化，并以受控、可节流/防抖的方式向外抛出尺寸信息。
---

## 使用场景

`ResizeObserver` 是一个无渲染（renderless）尺寸监听工具组件，封装浏览器原生 `ResizeObserver` API，监听一个或多个子元素的盒模型尺寸变化，并以受控、可节流/防抖的方式向外抛出尺寸信息。它解决三类高频问题：

1. **响应式布局原语**：为 `Table`（列宽自适应）、`Overflow`/`Tag` 折叠、`Tooltip`/`Popover` 浮层重定位、虚拟列表（`List`/`Tree` 行高测量）、`Typography` 文本省略检测等组件提供统一的"元素尺寸"数据源，避免每个组件各自实现一套监听逻辑
2. **性能可控**：原生 `ResizeObserver` 在快速布局变化（拖拽、动画、窗口缩放）时会高频触发回调，本组件内置 `throttle`/`debounce` 策略与单例化的全局 observer 池，降低回调风暴造成的掉帧与 layout thrashing
3. **SSR/降级安全**：在不支持原生 API 的环境（极旧浏览器、SSR）下静默降级（不报错、不监听），并提供基于 `window.resize` 的可选回退

本组件不渲染任何可见 UI、不持有样式、不监听窗口滚动；它只测量并广播尺寸。使用方通过 slot 包裹目标元素，或通过 `bind:this` 引用直接消费 core 实例。

典型用法：包裹单个子元素（默认监听该元素），或开启 `multiple` 监听 slot 内所有直接子元素，回调返回结构化尺寸数据。

## 何时使用

- 需要在元素尺寸变化时触发布局重算，如自适应列宽、动态省略文本
- 响应容器宽度变化而非视口宽度（替代 CSS media query 的组件级响应式）
- 虚拟列表需要测量行高时
- 浮层（Tooltip/Popover）定位参考目标元素尺寸需要实时更新时
- 在拖拽 resize 场景下需要节流控制回调频率（推荐 throttle: 16）

同时导出 **Svelte action** `resize` 供更轻量用法：`<div use:resize={{ throttle: 16 }} on:resize={...}>`。

## 无障碍

- 本组件无可聚焦元素、无 role、无 aria 语义，不进入无障碍树
- 包裹元素（若渲染）默认 role 透明，不添加任何 aria 属性，避免污染语义树
- 监听尺寸变化不得移动焦点、不得触发 scrollIntoView
- 尺寸变化驱动的内容更新不应造成意外的视口跳动/回流（WCAG 2.1 §1.4.10 Reflow、§2.3.3 Animation from Interactions）；节流即为防止"连续重排导致辅助技术读屏抖动"的关键缓解措施
- 本组件不自动播报尺寸变化（避免噪音），如需播报由消费方使用 useLiveAnnouncer
