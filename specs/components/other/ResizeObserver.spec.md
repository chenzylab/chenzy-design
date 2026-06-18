# SPEC · ResizeObserver
> 分类：other · 阶段：M6
> 对标 Semi：ResizeObserver

## 1. 概述

`ResizeObserver` 是一个**无渲染（renderless）尺寸监听工具组件**，封装浏览器原生 `ResizeObserver` API，监听一个或多个子元素的盒模型尺寸变化，并以受控、可节流/防抖的方式向外抛出尺寸信息。它解决三类高频问题：

1. **响应式布局原语**：为 `Table`（列宽自适应）、`Overflow`/`Tag` 折叠、`Tooltip`/`Popover` 浮层重定位、虚拟列表（`List`/`Tree` 行高测量）、`Typography` 文本省略检测等组件提供统一的"元素尺寸"数据源，避免每个组件各自实现一套监听逻辑。
2. **性能可控**：原生 `ResizeObserver` 在快速布局变化（拖拽、动画、窗口缩放）时会高频触发回调，本组件内置 `throttle`/`debounce` 策略与单例化的全局 observer 池，降低回调风暴造成的掉帧与 layout thrashing。
3. **SSR/降级安全**：在不支持原生 API 的环境（极旧浏览器、SSR）下静默降级（不报错、不监听），并提供基于 `window.resize` 的可选回退。

**非目标**：本组件不渲染任何可见 UI、不持有样式、不监听窗口滚动；它只测量并广播尺寸。它是工具/原语层组件，使用方通过 slot 包裹目标元素，或通过 `bind:this` 引用直接消费 core 实例。

**典型用法**：包裹单个子元素（默认监听该元素），或开启 `multiple` 监听 slot 内所有直接子元素，回调返回 `ResizeObserverEntry`-like 的结构化数据。

## 2. 设计语义

ResizeObserver 没有视觉表现，其"设计语义"体现在**数据契约与行为契约**上：

- **观测目标语义**：默认观测组件包裹的单一容器元素；当无包裹元素（仅作为逻辑容器）时，观测其唯一子节点。`box` 决定观测哪一种盒：`content-box`（默认，内容区）/`border-box`（含 padding+border）/`device-pixel-content-box`（设备物理像素，用于 Canvas 高 DPI 绘制）。
- **尺寸数据语义**：对外输出归一化结构 `{ width, height, top, left, right, bottom, x, y }`（基于 `contentRect`/`borderBoxSize`），始终为**整数无关的浮点 CSS 像素**，使用方无需自行读取 `getBoundingClientRect`，避免强制同步布局。
- **触发节流语义**：`throttle`（leading+trailing，默认 `0`=不节流，原生即时）与 `debounce`（trailing-only）互斥；用于在动画/拖拽期间平衡实时性与开销。`16`（约 1 帧）为推荐拖拽场景值。
- **状态层**：无 `status` 校验态（非输入组件）。无 `size` 视觉尺寸（不渲染）。这两个全局约定对本组件**不适用**，本 SPEC 在 API 表中显式标注为"N/A · 工具组件不渲染"。
- **reduced-motion**：组件不产生动画，但消费方常据其尺寸驱动动画；本组件保持纯数据，不感知 motion 偏好。
- **RTL**：尺寸 `width/height` 与方向无关；`left/right` 字段在 RTL 下仍按物理坐标输出（与 DOM `getBoundingClientRect` 一致），由消费方按需做逻辑方向映射。
- **Design Token**：本组件**不消费任何 CSS Token**（无渲染、无样式），是组件库中极少数零 Token 组件之一，见第 5 节。

## 3. 分层实现

本组件**有交互无关、但有副作用与生命周期管理的核心逻辑**（observer 创建/销毁、节流、降级、单例池），因此采用 core + svelte 分层。

**@chenzy-design/core · `createResizeObserver`**
- 职责：管理原生 `ResizeObserver` 生命周期、节流/防抖调度、盒模型选择、SSR/降级判定、归一化输出。
- 复用 core 原语：
  - `useId`：为每个观测目标生成稳定 id，便于多目标场景下回调区分（`entry.id`）。
  - 不需要 `useFocusTrap`/`useRovingTabindex`/`useDismiss`/`useScrollLock`/`useLiveAnnouncer`（无焦点、无浮层、无 a11y 播报）。
- 新增内部原语（随本组件落地，供 Table/Overflow 复用）：
  - `getGlobalResizeObserver()`：进程内**单例 observer 池**，所有实例共享一个原生 `ResizeObserver`，按 `target → callback` 路由分发，避免 N 个组件创建 N 个 observer（Chrome 下大量 observer 有可测开销）。
  - `scheduleRO(strategy, wait)`：基于 `rAF`/`setTimeout` 的 leading/trailing 调度器，实现 `throttle`/`debounce`。
- 关键 API（headless 实例）：
  ```ts
  createResizeObserver(options): {
    observe(el: Element, opts?): void
    unobserve(el: Element): void
    disconnect(): void
    readonly supported: boolean   // 原生是否可用
    subscribe(cb: (entry: CDResizeEntry) => void): () => void
  }
  ```
- 输出类型：`CDResizeEntry = { id; target; width; height; box; contentRect; borderBoxSize?; devicePixelContentBoxSize? }`。

**@chenzy-design/svelte · `<ResizeObserver>`**
- 职责：通过 `bind:this` 获取 slot 容器/子元素，`onMount` 调用 `createResizeObserver().observe()`，`onDestroy` 调 `disconnect()`；将 core 回调转为 Svelte 事件 `on:resize`。
- 不引入额外 DOM；若 `tag` 为空且 `multiple=false`，使用 Svelte action 模式（`use:resize`）直接附着到使用方元素，零额外节点。
- 同时导出 **Svelte action** `resize` 供更轻量用法：`<div use:resize={{ throttle: 16 }} on:resize={...}>`。
- SSR：core `supported=false` 时组件渲染 slot 但不监听，不抛错。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `box` | `'content-box' \| 'border-box' \| 'device-pixel-content-box'` | `'content-box'` | 观测的盒模型。高 DPI Canvas 用 `device-pixel-content-box`。 |
| `throttle` | `number` | `0` | 节流间隔(ms)，`0` 即原生即时回调。leading+trailing。与 `debounce` 互斥。 |
| `debounce` | `number` | `0` | 防抖等待(ms)，trailing-only。`0` 关闭。与 `throttle` 互斥（同时 >0 时 `debounce` 优先并 dev 告警）。 |
| `multiple` | `boolean` | `false` | `true` 时监听 slot 内所有直接子元素，回调逐个抛出，可用 `entry.id`/`entry.target` 区分。 |
| `disabled` | `boolean` | `false` | 暂停监听（保留已注册目标，仅不分发回调）。从 `true→false` 立即补发一次当前尺寸。 |
| `observeOnMount` | `boolean` | `true` | 挂载后是否立即测量并触发一次首帧回调（用于初始化布局）。 |
| `tag` | `string \| null` | `null` | 包裹元素标签名；`null` 表示不渲染包裹节点（action 模式，监听唯一子元素）。 |
| `fallbackToWindow` | `boolean` | `false` | 原生不支持时是否退化为监听 `window.resize` 重新测量（精度较低）。 |
| `size` | — | — | **N/A · 工具组件不渲染，无视觉尺寸。** |
| `status` | — | — | **N/A · 非输入组件，无校验态。** |

### Events

| 事件 | payload 类型 | 触发时机 | 说明 |
|---|---|---|---|
| `on:resize` | `CDResizeEntry` | 目标尺寸变化（经节流/防抖后） | 主事件。归一化尺寸数据。 |
| `on:resizeStart` | `{ target }` | 一段连续变化的首帧（节流/防抖窗口开始） | 用于"调整中"态（如显示尺寸 badge）。 |
| `on:resizeEnd` | `CDResizeEntry` | 连续变化结束后（debounce trailing / throttle 静默 `wait` 后） | 用于"调整完成"提交。 |
| `on:firstMeasure` | `CDResizeEntry` | `observeOnMount` 首次测量 | 区分初始尺寸与后续变化。 |

> 遵循一致性约定：尺寸为只读数据流，**不使用 `value`+`on:change`**（无可写受控值）；`disabled` 为命令式开关，不走 `open`+`openChange`（无浮层）。此处偏离全局 input/overlay 约定是合理的，因为本组件既非输入也非浮层。

### Slots

| Slot | slot props | 说明 |
|---|---|---|
| `default` | `{ width, height, entry }` | 被观测内容。slot props 暴露最新尺寸，支持 render-prop 式响应式布局（`let:width`）。 |

## 5. 主题 / Token

本组件**零样式、零 Token**。它不渲染任何可见节点（或仅渲染一个无样式的透明包裹元素），故不消费 Global/Alias/Component 任何层级的 `--cd-*` 变量。

| 层级 | 使用情况 |
|---|---|
| Global | 无 |
| Alias（`--cd-color-*` 等） | 无 |
| Component（`--cd-resizeobserver-*`） | 无（不提供组件级 Token） |

> 设计决策：若使用方需要将组件作为可见容器（`tag` 非 null），包裹元素默认 `display: contents`（或 `block` 且无内外边距、无背景），不引入任何视觉影响；如需样式由使用方通过 `class`/`style` 透传，本组件不预设。

## 6. 无障碍（a11y）

本组件**无可聚焦元素、无 role、无 aria 语义**——它是数据工具，不进入无障碍树。

- **role/aria-***：包裹元素（若渲染）默认 `role` 透明（不设置），不添加任何 `aria-*`，避免污染语义树；若使用方包裹元素本身有语义（如 `<table>`），由使用方负责。
- **键盘交互**：无（不可聚焦、不接受输入）。
- **焦点管理**：无；监听尺寸变化**不得**移动焦点、不得触发 `scrollIntoView`。
- **对比度**：N/A（无视觉）。
- **reduced-motion**：组件自身不产生动画。但若消费方据尺寸触发动画，APG 建议消费方尊重 `prefers-reduced-motion`；本 SPEC 仅提示，不强制本组件处理。
- **RTL**：见第 2 节，尺寸字段方向无关，`left/right` 为物理坐标。
- **AA 关注点**：确保尺寸变化驱动的内容更新**不造成意外的视口跳动/回流**（WCAG 2.1 §1.4.10 Reflow、§2.3.3 Animation from Interactions）。节流即时为防止"连续重排导致辅助技术读屏抖动"的关键缓解。
- **live region**：本组件**不**自动播报尺寸变化（避免噪音）；如需播报由消费方使用 `useLiveAnnouncer`。

## 7. 国际化（i18n）

本组件**无用户可见文案**（无渲染 UI），运行时 i18n key 为空集。

| 场景 | key | 说明 |
|---|---|---|
| 运行时可见文案 | （无） | 组件不渲染文字。 |
| 开发期告警 | `ResizeObserver.devWarn.boxUnsupported` | 仅 dev 控制台：`device-pixel-content-box` 在当前浏览器不受支持，已回退 `content-box`。 |
| 开发期告警 | `ResizeObserver.devWarn.throttleDebounceConflict` | 仅 dev：同时设置 `throttle` 与 `debounce`，已采用 `debounce`。 |
| 开发期告警 | `ResizeObserver.devWarn.unsupported` | 仅 dev：环境不支持 ResizeObserver，监听已禁用（或回退 window.resize）。 |

> 开发期告警走独立 dev-only i18n 命名空间，生产构建中 tree-shake 移除，不计入运行时文案。尺寸数值若需在消费方展示，应由消费方用 `Intl.NumberFormat` 格式化，本组件只输出原始 number。

## 8. 文案

本组件无产品文案。仅有的字符串为 dev 告警（见第 7 节），遵循 content-guidelines：

- 语气：简洁、可操作、指明后果与回退行为。
- 示例（中文）：`[ResizeObserver] device-pixel-content-box 在当前环境不受支持，已回退到 content-box。`
- **危险操作文案**：本组件**不涉及任何危险/破坏性操作**（无删除、无提交、无不可逆行为），故无危险操作文案。`disconnect()` 为幂等内部清理，非用户危险操作。

## 9. 性能（Perf Budget）

性能是本组件的**核心价值**。

| 指标 | 预算 | 说明 |
|---|---|---|
| gzip 体积（core `createResizeObserver`） | ≤ 1.2 KB | 含单例池 + 节流调度。 |
| gzip 体积（svelte 封装 + action） | ≤ 0.8 KB | 不含 core。 |
| gzip 体积（合计） | ≤ 2.0 KB | 工具组件，体积敏感。 |
| 首帧测量（observeOnMount） | < 1 帧（rAF 内完成） | 不触发额外强制同步布局（不调 `getBoundingClientRect`，仅用 entry 数据）。 |
| 回调分发开销（单目标） | < 0.05 ms/次 | 归一化为对象浅拷贝。 |
| 高频拖拽（throttle=16） | 稳定 ≤ 60 次/s | leading+trailing，丢弃中间帧。 |
| 100 个并发观测目标 | 单例池下仅 1 个原生 observer | 内存与回调路由 O(n)，无 n 个 observer 开销。 |

性能策略：
- **单例 observer 池**：默认所有实例共享一个原生 `ResizeObserver`，显著降低大列表/表格场景开销。
- **节流/防抖**：`throttle`/`debounce` 防止回调风暴；调度基于 `requestAnimationFrame`，与浏览器渲染节奏对齐。
- **惰性**：`disabled=true` 时不分发，不创建调度计时器。
- **无虚拟化需求**：组件不渲染列表，N/A；但它是**虚拟化组件的尺寸数据源**。
- **destroyOnClose**：N/A（无浮层）；`onDestroy` 严格 `unobserve` 防止内存泄漏（弱引用路由表，target 移除即回收）。
- **避免 layout thrashing**：回调内只读 `entry` 提供的尺寸，绝不在回调中读取布局属性后又写样式（读写分离由消费方保证，SPEC 文档化）。

## 10. AI 元数据

提供 `component.meta.ts`，供 AI/低代码/文档生成消费。

```ts
// component.meta.ts
export default {
  name: 'ResizeObserver',
  category: 'other',
  stage: 'M6',
  semiEquivalent: 'ResizeObserver',
  renderless: true,
  hasCore: true,
  coreFactory: 'createResizeObserver',
  consumesTokens: false,
  a11y: { inAccessibilityTree: false, focusable: false, roles: [] },
  i18nKeys: [],            // 运行时无可见文案
  devI18nKeys: [
    'ResizeObserver.devWarn.boxUnsupported',
    'ResizeObserver.devWarn.throttleDebounceConflict',
    'ResizeObserver.devWarn.unsupported',
  ],
  primaryEvent: 'resize',
  controlledModel: 'readonly-stream', // 非 value/change，非 open/openChange
  ssrSafe: true,
  perfBudgetKb: 2.0,
  tags: ['utility', 'observer', 'resize', 'layout', 'throttle', 'primitive'],
  consumers: ['Table', 'Overflow', 'Tooltip', 'Popover', 'List', 'Tree', 'Typography'],
  exports: ['ResizeObserver', 'resize /* action */', 'createResizeObserver'],
} as const
```

## 11. 测试

- **单元（core，jsdom + 模拟 ResizeObserver）**：
  - `observe`/`unobserve`/`disconnect` 生命周期与幂等性。
  - 归一化输出字段正确（content-box vs border-box）。
  - `throttle` leading+trailing 计次正确；`debounce` 仅 trailing；二者互斥告警。
  - `supported=false` 降级路径不抛错；`fallbackToWindow` 绑定/解绑 `window.resize`。
  - 单例池：N 个 `observe` 仅创建 1 个原生 observer；路由分发正确。
  - 内存：`disconnect` 后路由表清空，无残留引用。
- **组件（@testing-library/svelte）**：
  - `observeOnMount` 触发 `firstMeasure`。
  - `disabled` true→false 补发一次。
  - `multiple` 监听多个直接子元素并各自抛 `entry.id`。
  - action 模式 `use:resize` 与组件模式行为一致。
  - `onDestroy` 调 `disconnect`（spy 断言）。
- **集成**：在 `Table` 列宽自适应、`Overflow` 折叠场景下作为数据源的回归测试。
- **性能（基准）**：100 目标共享单例 observer 的回调时延基准；拖拽场景 throttle=16 帧率断言。
- **a11y**：断言不向 DOM 注入 `role`/`aria-*`，不进入可访问树。
- **SSR**：Node 环境渲染不抛错、不访问 `window`。

## 12. 验收标准 checklist

- [ ] core `createResizeObserver` 与 svelte 封装 + `resize` action 三种入口均导出且行为一致。
- [ ] `box` 三种盒模型支持，`device-pixel-content-box` 不支持时回退并 dev 告警。
- [ ] `throttle`/`debounce` 互斥、计次正确、基于 rAF 调度；同设触发 dev 告警且 `debounce` 优先。
- [ ] 单例 observer 池：100 并发目标仅 1 个原生 observer，路由分发正确。
- [ ] `multiple` 监听 slot 直接子元素，回调含可区分的 `entry.id`/`entry.target`。
- [ ] `disabled` 暂停分发，`true→false` 补发一次当前尺寸。
- [ ] `observeOnMount` 触发 `firstMeasure`；`on:resizeStart`/`on:resizeEnd` 边界正确。
- [ ] 归一化输出不调用 `getBoundingClientRect`，不引发强制同步布局。
- [ ] `onDestroy` 严格 `unobserve`/`disconnect`，无内存泄漏（弱引用回收）。
- [ ] SSR 与不支持环境静默降级，不抛错；`fallbackToWindow` 可选生效。
- [ ] 不消费任何 `--cd-*` Token；不注入 `role`/`aria-*`，不进入可访问树。
- [ ] 运行时零可见文案；dev 告警 i18n key 齐备且生产可 tree-shake。
- [ ] gzip 合计 ≤ 2.0 KB；首帧测量 < 1 帧；高频拖拽 throttle 生效。
- [ ] 提供 `component.meta.ts`，字段与本 SPEC 一致。
- [ ] 单元/组件/集成/性能/a11y/SSR 测试全部通过，覆盖率达库基线。
