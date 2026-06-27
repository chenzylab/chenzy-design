---
title: ConfigProvider 全局配置
name: configprovider
category: other
brief: 全局配置总入口，以"无 DOM 包裹层"的方式向子树注入跨组件共享的配置：语言、主题、书写方向、默认尺寸以及全局运行时策略。
---

## 使用场景

`ConfigProvider` 是 chenzy-design 的全局配置总入口，以"无 DOM 包裹层"的方式向其子树注入跨组件共享的配置：语言（locale）、主题（theme / 暗色模式）、书写方向（dir：ltr/rtl）、默认尺寸（size）、以及一组运行时全局策略（浮层挂载点 getPopupContainer、过渡是否禁用、滚动锁定策略等）。它不渲染任何业务 UI，仅通过 Svelte Context + 一个轻量配置 store 下发，使下游组件无需逐个透传 props 即可获得一致行为。

典型职责：
- 作为应用根，统一设置 `locale`（驱动所有组件的 i18n key 解析与 Intl 区域）
- 统一 `theme`（`light | dark | auto`）并在挂载节点写入 `data-cd-theme` 与 token 变量作用域
- 统一 `dir`（`ltr | rtl`），驱动逻辑属性与组件镜像
- 统一默认 `size`（`small | default | large`），被未显式指定 size 的组件继承
- 统一浮层行为（`getPopupContainer`、`zIndexBase`）、动画策略（`transition` / 跟随系统 reduced-motion）

支持**嵌套**：内层 `ConfigProvider` 与外层做浅合并（只覆盖显式传入的字段），实现局部区域换肤/换语言/换方向。

## 何时使用

- 应用的最外层，统一设置全局语言、主题与组件默认行为
- 需要局部覆盖配置时，如某弹窗内强制暗色、某区块强制 RTL 方向
- 多租户/多品牌场景，不同子树需要不同主题

不适用：单组件一次性覆盖（直接用组件自身 props 即可，无需 Provider）。

零视觉表现：ConfigProvider 本身不绘制边框/背景/间距，是纯逻辑容器。当需要为子树建立独立的主题/方向作用域时，可设 `wrap=true` 渲染一个包裹 `div` 承载 `data-cd-theme` / `dir` 属性，使 token 作用域生效。

## 无障碍

- 自身不设 role；`wrap=true` 的 div 为透明容器（`display: contents`），不打断辅助技术的可访问性树
- 将 `locale.lang` 暴露给下游，建议应用在 `<html lang>` 上同步（提供 `on:localeChange` 供应用同步），屏幕阅读器据此选择发音规则
- `dir` 写入作用域根，辅助技术与浏览器据此正确处理双向文本与焦点顺序
- 订阅 `prefers-reduced-motion`，派生 `motionEnabled` 下发，下游组件据此禁用过渡，满足 WCAG 2.3.3
- 通过 core `useLiveAnnouncer` 在根挂载单一 `aria-live` 区域，供全局 toast/通知复用，避免重复 live region
- 暗色主题 token 须保证文本/背景对比度 ≥ 4.5:1（正文）/ 3:1（大字与图形界面）
