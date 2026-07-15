---
title: ConfigProvider 全局配置
name: configprovider
category: other
brief: 为组件提供统一的全局化配置：多语言、书写方向、时区、全局浮层容器与响应式断点监听。
---

## 使用场景

`ConfigProvider` 是 chenzy-design 的全局配置总入口，借助 Svelte Context 向其子树注入跨组件共享的配置。它不渲染任何业务 UI，仅通过 Context 下发，使下游组件无需逐个透传 props 即可获得一致行为。

覆盖配置分为两种场景：

- 需要覆盖多个组件公有 Props 配置（例如 `timeZone`、`direction`），使用 `ConfigProvider`。
- 单组件一次性覆盖：直接用组件自身 props 即可，无需 Provider。

典型职责：

- 统一 `locale`（驱动所有组件的 i18n key 解析与 Intl 区域）
- 统一 `direction`（`ltr | rtl`），驱动逻辑属性与组件镜像
- 统一 `timeZone`，为时间类组件（DatePicker / TimePicker 等）配置默认时区
- 统一全局浮层默认容器 `getPopupContainer`
- 通过 `responsiveObserve` / `responsiveMap` 提供响应式断点订阅能力

支持**嵌套**：内层 `ConfigProvider` 与外层做浅合并（只覆盖显式传入的字段），实现局部区域换语言 / 换方向。

## 何时使用

- 应用的最外层，统一设置全局语言、书写方向、时区与浮层行为
- 需要局部覆盖配置时，如某区块强制 RTL 方向
- 需要订阅视口断点变化时，开启 `responsiveObserve`

不适用：单组件一次性覆盖（直接用组件自身 props 即可，无需 Provider）。

## DOM 与视觉

零视觉表现：ConfigProvider 本身不绘制边框 / 背景 / 间距，是纯逻辑容器，无独立 token / 样式。

- `direction !== 'rtl'`：renderless，不渲染任何 DOM，直接渲染子内容
- `direction === 'rtl'`：渲染一个 `<div class="cd-rtl">` 包裹层承载方向作用域，内部组件随之镜像布局

## 响应式断点

`ConfigProvider` 支持配置响应式断点，并在断点变化时进行订阅回调：

- 出于性能考虑，`responsiveObserve` 默认 `false`，不开启时不会注册任何 `matchMedia` 监听。
- `onBreakpoint` / `screens` 不属于 ConfigProvider 的 props，需要通过 `getConfigContext` 体系的 `getConfigResponsive()`（等价 Semi 的 `ConfigConsumer`）获取。
- 订阅时回调会**立即执行一次**，传入当前各断点的命中情况。
- `responsiveMap` 是引用比较：若直接 inline 写对象（每次渲染引用都不同），会被识别为发生变化并重新注册全部监听。建议把它定义在组件外。

`onBreakpoint` 支持两种签名，均返回取消订阅函数：

- `onBreakpoint((screens) => void)`：回调拿到完整的 screens 映射
- `onBreakpoint(['md', 'lg'], (screen, match) => void)`：只监听指定断点，回调拿到单个断点变化

## 无障碍

- 自身不设 role；`direction !== 'rtl'` 时 renderless，不打断辅助技术的可访问性树
- `direction === 'rtl'` 时 `cd-rtl` 包裹层承载方向作用域，辅助技术与浏览器据此正确处理双向文本与焦点顺序
- 建议应用在 `<html lang>` / `<html dir>` 上同步 locale 与 direction，屏幕阅读器据此选择发音与阅读方向
