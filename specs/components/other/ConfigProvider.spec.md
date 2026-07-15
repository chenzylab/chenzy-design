# SPEC · ConfigProvider
> 分类：other · 阶段：M6
> 对标 Semi：ConfigProvider（严格对齐 packages/semi-ui/configProvider）

## 1. 概述

`ConfigProvider` 是 chenzy-design 的**全局配置总入口**，借助 Svelte Context 向其子树注入跨组件共享的配置：多语言（`locale`）、书写方向（`direction`）、时区（`timeZone`）、全局浮层默认容器（`getPopupContainer`），并提供响应式断点订阅能力（`responsiveObserve` / `responsiveMap` / `onBreakpoint` / `screens`）。它不渲染任何业务 UI（`direction !== 'rtl'` 时 renderless），是纯逻辑组件，**无独立 token / 样式**（对齐 Semi）。

覆盖配置分两种场景：

- 需要覆盖多个组件公有 Props 配置（例如 `timeZone`、`direction`）：使用 `ConfigProvider`。
- 仅需单组件一次性覆盖：直接用组件自身 props 即可，无需 Provider。

支持**嵌套**：内层 `ConfigProvider` 与外层做浅合并（只覆盖显式传入的字段，`undefined` 继承父级），实现局部区域换语言 / 换方向。

## 2. 设计语义

- **零视觉表现**：ConfigProvider 本身不绘制边框 / 背景 / 间距，无独立 token / scss。
- **DOM 结构**（严格对齐 Semi renderChildren）：
  - `direction !== 'rtl'`：renderless，不产生任何额外 DOM，直接渲染子内容；
  - `direction === 'rtl'`：渲染一个 `<div class="cd-rtl">` 包裹层承载方向作用域（对齐 Semi `.semi-rtl`），内部组件随之镜像布局。
- **方向语义**：`direction` 参与嵌套合并；rtl 时经 `cd-rtl` 包裹层建立方向作用域。所有组件样式使用 CSS 逻辑属性。
- **时区语义**：`timeZone` 经 locale context 下发给时间类组件（DatePicker / TimePicker 等）；组件自身 `timeZone` prop 优先，未传时回退此值。
- **合并语义**：嵌套时按字段浅合并；未传字段沿用父级；`undefined` 表示继承。

## 3. 分层实现

配置型组件，逻辑下沉到 core，渲染极薄。

- **@chenzy-design/core · `config-provider.ts`**（headless，纯函数 / 纯类型）：
  - `mergeConfig(parent, child)` 浅合并纯函数（`direction` / `timeZone`）；
  - `DEFAULT_CONFIG`（`direction: 'ltr'`）、`ConfigInput` / `ResolvedConfig` 类型；
  - `defaultResponsiveMap` 默认断点常量、`ResponsiveMap` / `BreakpointScreens` 类型（`Breakpoint` 复用 `breakpoints.ts`，与 Semi 六档一致）；
  - `registerMediaQuery(media, { match, unmatch, callInInit })`：逐字对齐 Semi `_utils` 的 matchMedia 注册工具（SSR 安全、addEventListener 回退 addListener）。
- **@chenzy-design/svelte · `ConfigProvider.svelte`**（渲染）：
  - 接收 6 props，合并父级 config，`setContext(CONFIG_CONTEXT_KEY, …)` 下发（`current` / `getPopupContainer` / `responsiveMap` / `screens` / `onBreakpoint`）；
  - `locale` 提供时复用 `createLocale` + `LOCALE_CONTEXT_KEY` 注入（timeZone 透传）；
  - 响应式断点懒注册（首次订阅时）、`responsiveObserve=false` 默认不注册且订阅时 dev 告警、`responsiveMap` 引用变化重注册、组件卸载注销全部监听；
  - 下游用 `getConfigContext()` 读合并后配置、`getGlobalPopupContainer()` 读浮层容器、`getConfigResponsive()`（等价 Semi ConfigConsumer）读断点能力。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| locale | `Locale \| undefined` | `undefined`（沿用上层 / 内置） | 语言包对象，驱动 i18n 与 Intl 区域；提供则注入 locale context。对齐 Semi `locale` |
| direction | `'ltr' \| 'rtl' \| undefined` | `undefined`（继承，根级默认 `ltr`） | 书写方向；`rtl` 时渲染 `<div class="cd-rtl">` 包裹层。对齐 Semi `direction` |
| timeZone | `string \| number \| undefined` | `undefined`（继承） | 默认时区标识（数字为距 UTC 偏移小时，字符串为 GMT± 或 IANA），注入时间类组件。对齐 Semi `timeZone` |
| getPopupContainer | `() => HTMLElement \| null \| undefined` | `() => document.body` | 全局浮层默认挂载点；浮层组件自身 prop 优先，未传时回退此值。对齐 Semi `getPopupContainer` |
| responsiveObserve | `boolean` | `false` | 是否开启响应式断点监听；默认关闭以避免全局注册 matchMedia，开启后首次订阅时懒注册、无订阅时自动注销。对齐 Semi `responsiveObserve` |
| responsiveMap | `ResponsiveMap` | `defaultResponsiveMap` | 自定义断点配置（xs/sm/md/lg/xl/xxl → media query）；引用比较，inline 新对象触发重注册。对齐 Semi `responsiveMap` |

> `getPopupContainer`、`responsiveMap` 参与就近合并 / 引用比较，其余纯配置字段（`direction` / `timeZone`）经 `mergeConfig` 浅合并。

### Context 扩展（非 props，经 `getConfigResponsive()` 读取，对齐 Semi ConfigConsumer）

| 名称 | 类型 | 说明 |
|---|---|---|
| screens | `BreakpointScreens` | 各断点当前命中情况（read-only 快照） |
| onBreakpoint | `(cb) => () => void` / `(breakpoints, cb) => () => void` | 订阅断点变化，两种签名，订阅时立即回调一次 |
| responsiveMap | `ResponsiveMap` | 当前生效的断点配置 |

### 静态 / 导出

- `defaultResponsiveMap`：默认断点（对齐 Semi `ConfigProvider.defaultResponsiveMap`）。
- `getConfigContext()` / `getGlobalPopupContainer()` / `getConfigResponsive()`：context 读取 helper。

### Events

无。ConfigProvider 为配置注入组件，不派发事件（对齐 Semi）。

### Slots

| 名称 | 说明 |
|---|---|
| children | 被配置覆盖的子树内容（唯一插槽） |

## 5. 主题 / Token

ConfigProvider **无独立 token / scss**（对齐 Semi —— ConfigProvider 在 semi-foundation / semi-theme 无对应样式文件）。`direction === 'rtl'` 时的 `cd-rtl` 包裹层仅承载方向作用域，各组件的 RTL 样式由各自的 rtl 样式提供。ConfigProvider 禁止写死任何颜色 / 尺寸值。

## 6. 无障碍

- 自身不设 `role`；`direction !== 'rtl'` 时 renderless，不打断辅助技术可访问性树。
- `direction === 'rtl'` 时 `cd-rtl` 包裹层承载方向作用域，辅助技术与浏览器据此正确处理双向文本与焦点顺序。
- 建议应用在 `<html lang>` / `<html dir>` 上同步 locale 与 direction。

不依赖 WAI-ARIA APG 的复合控件模式（非交互组件）。

## 7. 国际化

ConfigProvider 是 i18n 的**分发中心**，自身用户可见文案为零。

- `locale` 提供时复用 LocaleProvider 的 `createLocale` 机制注入 locale context，下游经 `useLocale()` 消费。
- `timeZone` 经 locale context 的 `formatDate` 下发；时间类组件在自身 `timeZone` prop 未传时回退 `loc().timeZone`。
- 日期 / 数字：下游统一用 `Intl` + locale，禁止手写格式化。

## 8. 文案

ConfigProvider 无终端用户可见文案。

- **开发期提示**（仅 `import.meta.env.DEV`）：`responsiveObserve=false` 时发生订阅，输出 `console.warn` 提示需开启 `responsiveObserve`（对齐 Semi 的 warning）。

## 9. 性能

| 指标 | 预算 / 目标 | 说明 |
|---|---|---|
| gzip 体积（svelte 渲染层） | ≤ 1.7 KB | props 绑定 + setContext + 断点订阅 |
| gzip 体积（core headless） | ≤ 1.2 KB | merge/纯类型 + registerMediaQuery |
| 首次挂载运行时 | < 0.3 ms | renderless（非 rtl）或单 div |
| matchMedia 订阅 | 默认 0（`responsiveObserve=false`）；开启后按断点数注册，无订阅时注销 | 懒注册，无轮询 |

性能策略：

- **懒注册**：`responsiveObserve=false`（默认）不注册任何 matchMedia；开启后仅在首次订阅时注册，无订阅自动注销（对齐 Semi）。
- **引用比较**：`responsiveMap` 按引用比较，稳定引用避免无谓重注册。
- **SSR**：服务端零 `window` 访问，`registerMediaQuery` 无 window 时返回 noop。
- **嵌套合并**：`mergeConfig` 浅合并纯函数，O(字段数)。

## 10. AI 元数据

见 `packages/svelte/src/config-provider/meta.ts`（`ConfigProvider.meta`），字段与本 SPEC §4 一致：`props: [locale, direction, timeZone, getPopupContainer, responsiveObserve, responsiveMap]`、`events: []`、`renderless: true`、`tokens: []`、`responsive: true`。

## 11. 测试

- **单元（core）**：`mergeConfig` 嵌套浅合并 / `undefined` 继承；`defaultResponsiveMap` 镜像 Semi；`registerMediaQuery` 的 callInInit、change 事件、注销、SSR noop。
- **组件（svelte）**：`direction !== 'rtl'` 无额外 DOM、`rtl` 渲染 `cd-rtl`；context 下发 `getConfigContext` 读到正确 direction/timeZone；无 Provider 时返回 `DEFAULT_CONFIG`；`getGlobalPopupContainer` 回退；响应式订阅立即回调一次、断点变化更新 screens、`responsiveObserve=false` 不注册。
- **集成**：嵌套两层 Provider，内层仅覆盖 `direction`，外层 `timeZone` 仍继承。
- **真机**：direction 切换镜像、responsive 订阅、timeZone 驱动 DatePicker/TimePicker、getPopupContainer 浮层容器。

## 12. 验收标准 Checklist

- [ ] props 严格为 6 个（locale / direction / timeZone / getPopupContainer / responsiveObserve / responsiveMap），无自造 prop。
- [ ] `direction !== 'rtl'` 不向 DOM 注入额外节点；`direction === 'rtl'` 渲染单一 `<div class="cd-rtl">`。
- [ ] 嵌套 Provider 按字段浅合并，`undefined` 继承父级。
- [ ] `timeZone` 经 locale context 下发，DatePicker/TimePicker 自身 prop 未传时回退生效。
- [ ] `getPopupContainer` 经 context 暴露，浮层组件自身 prop 优先、未传回退。
- [ ] `responsiveObserve=false` 默认不注册 matchMedia；开启后懒注册、无订阅注销；`onBreakpoint` 两签名 + 订阅即回调一次；`screens` 正确。
- [ ] `defaultResponsiveMap` 镜像 Semi 断点。
- [ ] 无独立 token / scss（对齐 Semi）；不写死颜色 / 尺寸。
- [ ] `meta.ts` 字段与 §4 一致；`registerMediaQuery` SSR 安全。
- [ ] core 单测全绿；根级递归 typecheck 通过；demo 数量不少于 Semi（5 个）。
