# SPEC · Tooltip
> 分类：show · 阶段：M4
> 对标 Semi：Tooltip

## 1. 概述

Tooltip 是轻量级文字提示组件：当用户悬停（hover）、聚焦（focus）或点击触发元素时，在其周围浮层中展示一段简短的辅助说明文字。它不承载交互内容（不可聚焦、不含按钮/链接），纯文本/极简内联节点，与 Popover（承载富交互内容）形成明确分工。

典型场景：图标按钮的语义解释、被省略号截断文本的完整内容、表单字段的格式提示、禁用元素的禁用原因。

设计要点：
- 智能定位（12 个方位 + 视口翻转/平移避让，跟随滚动/缩放）。
- 显隐延迟（mouseEnterDelay/mouseLeaveDelay）防止抖动闪烁。
- a11y 默认 `aria-describedby` 关联（提示是「描述性」而非「标签性」），不抢占焦点。
- 受控/非受控两种用法，触发方式可组合（hover/focus/click）。

不做的事：不支持表单输入、菜单、可滚动长内容（用 Popover）；不做确认气泡（用 Popconfirm）。

## 2. 设计语义

- **颜色**：默认深色反相气泡（`--cd-tooltip-bg` 取暗色，`--cd-tooltip-color` 取浅色），与页面前景形成对比，强调「临时浮层」属性；浅色变体（`theme="light"`）用于密集图表/深色背景场景。状态语义复用 Alias：警示提示可叠加 `--cd-color-warning`/`--cd-color-danger` 背景。
- **形状**：圆角 `--cd-tooltip-radius`（取 Global 小圆角），可选箭头 `--cd-tooltip-arrow-size` 指向触发元素，箭头颜色继承气泡背景。
- **间距**：触发元素与气泡间距 `--cd-tooltip-gap`（默认 8px），内边距 `--cd-tooltip-padding`。
- **层级**：`z-index` 取 `--cd-tooltip-z`（高于内容、低于 Modal/Dropdown 的语义层）。
- **运动**：进出场为「淡入 + 轻微位移/缩放」`--cd-tooltip-motion-duration`，源点 transform-origin 朝向触发元素；`prefers-reduced-motion` 下降级为纯透明度切换或瞬时。
- **尺寸语义**：Tooltip 文本提示不提供 small/default/large 三档（文字尺寸跟随 `--cd-font-size-0`）；仅 `maxWidth` 控制换行边界，避免单行过长。

## 3. 分层实现

属于「有交互/键盘/a11y 逻辑」组件，采用 headless + 渲染分层。

**@chenzy-design/core — `createTooltip`**
- 输入：trigger 配置、delay、placement、open（受控）、disabled、defaultOpen。
- 输出：`triggerProps`（事件与 aria 绑定）、`contentProps`（role/id/style）、`arrowProps`、`open` store、`getFloatingStyle()`。
- 复用 core 原语：
  - `useId`：生成 content id 用于 `aria-describedby`。
  - `useDismiss`：Esc 关闭、滚动/外部交互关闭策略（hover 模式下离开触发链关闭）。
  - 定位引擎 `usePositioning`（基于 floating 原语：flip/shift/offset/arrow 中间件，autoUpdate 监听 scroll/resize/ResizeObserver）。
  - 不使用 `useFocusTrap`（Tooltip 不接管焦点）；不使用 `useRovingTabindex`。
  - `useScrollLock`：不使用（Tooltip 跟随滚动，不锁定）。
- 延迟状态机：管理 open/close timer、hover 在 trigger↔content 间移动时的「安全多边形」桥接（防止移动到气泡途中关闭）。

**@chenzy-design/svelte — `<Tooltip>`**
- 用 `bind:this` 拿到触发元素引用（默认包裹单一 slot 子节点，或通过 action 附着）。
- Portal 渲染气泡到 body（避免 `overflow:hidden`/`transform` 祖先裁剪）；支持 `getPopupContainer`/`mountTo`。
- `destroyOnClose`（默认 true，关闭即卸载内容 DOM）与 `keepDOM` 可选。
- 应用 `getFloatingStyle()` 到 portal 容器，渲染 arrow。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string \| Snippet` | — | 提示内容（文本或渲染片段）。可见文案应来自 i18n。 |
| `open` | `boolean` | — | 受控显隐；配合 `on:openChange` 使用。 |
| `defaultOpen` | `boolean` | `false` | 非受控初始显隐。 |
| `trigger` | `'hover' \| 'focus' \| 'click' \| 'custom' \| Array` | `['hover','focus']` | 触发方式，可组合。`custom` 完全受控。 |
| `placement` | `'top'\|'topLeft'\|'topRight'\|'bottom'\|'bottomLeft'\|'bottomRight'\|'left'\|'leftTop'\|'leftBottom'\|'right'\|'rightTop'\|'rightBottom'` | `'top'` | 期望方位（实际会按避让翻转）。 |
| `mouseEnterDelay` | `number` (ms) | `100` | hover 进入显示延迟。 |
| `mouseLeaveDelay` | `number` (ms) | `100` | hover 离开隐藏延迟。 |
| `showArrow` | `boolean` | `true` | 是否显示指向箭头。 |
| `arrowPointAtCenter` | `boolean` | `false` | 箭头是否对齐触发元素中心。 |
| `theme` | `'dark' \| 'light'` | `'dark'` | 配色主题。 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验/语义态（影响背景与可选图标）。 |
| `maxWidth` | `number \| string` | `300` | 内容最大宽度，超出换行。 |
| `gap` | `number` | `8` | 触发元素与气泡间距（offset）。 |
| `disabled` | `boolean` | `false` | 禁用提示（始终不显示）。 |
| `destroyOnClose` | `boolean` | `true` | 关闭时卸载内容 DOM。 |
| `getPopupContainer` | `() => HTMLElement` | `() => document.body` | 指定挂载容器。 |
| `zIndex` | `number` | `--cd-tooltip-z` | 浮层层级覆盖。 |
| `closeOnEsc` | `boolean` | `true` | Esc 关闭（focus/click 触发时生效）。 |
| `spacing` | `number \| { x:number; y:number }` | `0` | 在 gap 基础上的额外偏移微调。 |
| `id` | `string` | 自动生成 | 气泡 id，用于 `aria-describedby` 关联。 |

### Events

| Event | Payload | 说明 |
|-------|---------|------|
| `on:openChange` | `(open: boolean)` | 显隐状态变更（受控同步）。 |
| `on:visibleChange` | `(open: boolean)` | `openChange` 别名，兼容 Semi 习惯（标记 deprecated）。 |
| `on:clickOutside` | `(event: PointerEvent)` | 浮层外部点击。 |
| `on:escKeyDown` | `(event: KeyboardEvent)` | Esc 触发关闭前回调。 |
| `on:mountChange` | `(mounted: boolean)` | 内容 DOM 挂载/卸载（用于惰性资源）。 |

### Slots

| Slot | 作用域参数 | 说明 |
|------|-----------|------|
| `default` | — | 触发元素（单一根节点；多节点需包一层）。 |
| `content` | `{ close: () => void }` | 自定义提示内容，优先级高于 `content` prop。 |
| `arrow` | — | 自定义箭头渲染（默认提供）。 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component 级 Token，禁止写死值。

| Component Token | 默认引用（Alias/Global） | 用途 |
|-----------------|--------------------------|------|
| `--cd-tooltip-bg` | dark: `--cd-color-bg-inverse` / light: `--cd-color-bg-0` | 气泡背景 |
| `--cd-tooltip-color` | dark: `--cd-color-text-inverse` / light: `--cd-color-text-0` | 气泡文字色 |
| `--cd-tooltip-bg-warning` | `--cd-color-warning` | warning 态背景 |
| `--cd-tooltip-bg-danger` | `--cd-color-danger` | error 态背景 |
| `--cd-tooltip-border` | `--cd-color-border` | light 主题描边 |
| `--cd-tooltip-radius` | `--cd-radius-small` | 圆角 |
| `--cd-tooltip-padding` | `--cd-spacing-2` `--cd-spacing-3` | 内边距 |
| `--cd-tooltip-gap` | `--cd-spacing-2` (8px) | 与触发元素间距 |
| `--cd-tooltip-arrow-size` | `--cd-spacing-2` | 箭头尺寸 |
| `--cd-tooltip-max-width` | `300px` (Alias 推导) | 默认最大宽度 |
| `--cd-tooltip-font-size` | `--cd-font-size-0` | 文字字号 |
| `--cd-tooltip-line-height` | `--cd-line-height-0` | 行高 |
| `--cd-tooltip-shadow` | `--cd-shadow-elevated` | 浮层阴影 |
| `--cd-tooltip-z` | `--cd-z-tooltip` | 层级 |
| `--cd-tooltip-motion-duration` | `--cd-motion-duration-fast` | 进出场时长 |
| `--cd-tooltip-motion-easing` | `--cd-motion-easing-standard` | 缓动曲线 |

对比度：dark 主题需保证 `--cd-tooltip-color` 对 `--cd-tooltip-bg` ≥ 4.5:1（AA 正文）；warning/error 态同样校验文字与背景对比。

## 6. 无障碍

遵循 WAI-ARIA APG Tooltip Pattern（WCAG 2.1 AA）。

- **role / aria**：
  - 气泡容器 `role="tooltip"`，带稳定 `id`。
  - 触发元素绑定 `aria-describedby="<tooltip-id>"`（提示是描述，不是名称；若用作标签场景由调用方改用 `aria-labelledby`，文档说明）。
  - `disabled`/隐藏时不渲染 id 关联，避免悬空引用。
- **键盘交互**：
  - `Tab` 聚焦触发元素 → 提示显示（focus 触发）；移出焦点 → 隐藏。
  - `Esc`：在提示显示时关闭，且不冒泡触发祖先（如关闭 Modal）；`closeOnEsc` 控制。
  - Tooltip 内容**不可聚焦、不含交互元素**（APG 约束）；需交互内容请用 Popover。
- **焦点管理**：不接管焦点、无 focus trap、不改变 Tab 顺序；hover 与 keyboard-focus 路径都能触发（满足 WCAG 1.4.13 Content on Hover or Focus）。
- **WCAG 1.4.13（Hoverable / Persistent / Dismissible）**：
  - Dismissible：Esc 可关闭，不移动指针即可消除。
  - Hoverable：指针可移入气泡而不消失（安全多边形桥接 + `mouseLeaveDelay`）。
  - Persistent：除非失焦/Esc/内容失效，否则保持可见。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用位移/缩放，仅保留瞬时或淡入。
- **RTL**：`dir="rtl"` 下 left/right 方位与 `*Left/*Right` 对齐镜像翻转；箭头与 placement 随逻辑方向计算。
- **对比度**：见第 5 节；禁用元素的 Tooltip（解释禁用原因）需将 Tooltip 附着在可聚焦的 wrapper 上（disabled 元素不触发事件），文档给出范式。
- **触摸/无指针**：触摸设备 hover 不可用，自动回退为 focus/long-press 或 click 触发（按 `trigger` 配置）。

## 7. 国际化

- 组件自身无内置可见文案；所有可见文本来自调用方传入的 `content`，要求调用方使用 i18n（非组件硬编码）。
- 组件提供的 a11y/兜底文案 key：

| i18n key | 用途 |
|----------|------|
| `Tooltip.dismissHint` | 屏幕阅读器辅助提示「按 Esc 关闭」（可选注入 SR-only） |
| `Tooltip.warningLabel` | warning 态可选前缀图标的 aria-label |
| `Tooltip.errorLabel` | error 态可选前缀图标的 aria-label |

- 文档/示例中的提示文案必须经 i18n 函数；涉及日期/数字内容由调用方用 `Intl.DateTimeFormat`/`Intl.NumberFormat` 预格式化后传入 `content`。
- RTL 语言下方位镜像见第 6 节。

## 8. 文案

遵循 content-guidelines：

- 简短、单一信息点；避免整段说明（>2 行考虑 Popover）。
- 句式以名词短语或祈使为主，无句末标点（短提示），完整句保留标点。
- 不重复触发元素已有的可见文字（避免冗余）。
- 不放置链接/按钮等需点击内容（不可达）。

**危险操作文案（单列）**：Tooltip 一般不承载危险操作（无确认动作）。当用于解释「危险操作为何被禁用」时（如「删除」按钮置灰）：
- 说明原因 + 解锁条件，例如「需先取消关联项目后才能删除」。
- 不在 Tooltip 内直接触发危险动作；危险确认请用 Popconfirm。
- warning/error 态文案使用 `--cd-color-warning`/`--cd-color-danger`，措辞明确风险，不使用「可能」等模糊词。

## 9. 性能

| 指标 | Budget | 说明 |
|------|--------|------|
| gzip 体积（svelte 渲染层） | ≤ 3.5 KB | 不含 core 定位引擎 |
| gzip 体积（core `createTooltip`） | ≤ 2.5 KB | 含延迟状态机，复用共享定位原语（与 Popover/Dropdown 共担） |
| 共享定位引擎（首个浮层组件计入） | ≤ 4 KB | tree-shake 复用，多组件摊销 |
| 显示延迟首帧 | ≤ 1 帧（延迟计时除外） | 定位在 RAF 内完成，无布局抖动 |
| autoUpdate 滚动开销 | 仅 open 时挂载监听 | 关闭即移除 scroll/resize/RO 监听 |

- **惰性渲染**：`destroyOnClose` 默认 true，未打开不挂载内容 DOM；`on:mountChange` 暴露挂载时机。
- **虚拟化**：不适用（内容极简）。
- **批量场景**（表格大量单元格各带 Tooltip）：推荐单实例 + 事件委托（提供 `bindToTarget` action / 全局共享 portal），避免 N 个实例各自监听；文档给出范式。
- **定位节流**：autoUpdate 使用 rAF 合并，scroll 监听 passive。

## 10. AI 元数据

提供 `component.meta.ts`，导出：
- `name: 'Tooltip'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Tooltip'`。
- `props`/`events`/`slots` 的结构化 schema（类型、默认值、枚举、deprecated 标记如 `visibleChange`）。
- `tokens`：第 5 节 Component Token 列表及其 Alias 引用关系。
- `a11y`：`role: 'tooltip'`、APG pattern 链接、WCAG 1.4.13 标记、`describedby` 关联说明。
- `usageHints`：「描述性短文本用 Tooltip；富交互/可点击内容用 Popover；确认危险操作用 Popconfirm」。
- `antiPatterns`：「Tooltip 内放按钮/链接」「在 disabled 元素直接绑定（事件不触发）」「长段落内容」。
- `relatedComponents`: `['Popover','Popconfirm','Dropdown']`。

## 11. 测试

- **单元（core）**：延迟状态机（enter/leave timer、快速进出抖动抑制）；安全多边形桥接逻辑；受控 `open` 与非受控 `defaultOpen` 一致性；`disabled` 抑制；id 生成稳定性。
- **定位**：flip（视口边缘翻转）、shift（平移避让）、arrow 对齐、`arrowPointAtCenter`、RTL 镜像、scroll/resize autoUpdate 跟随。
- **a11y（自动）**：axe 无违规；`aria-describedby` 正确绑定/解绑；`role="tooltip"`；reduced-motion 媒体查询下无动画样式。
- **a11y（交互/键盘）**：Tab 聚焦显示、blur 隐藏、Esc 关闭且不冒泡、hover 移入气泡保持可见（1.4.13）。
- **渲染（svelte）**：Portal 挂载到 `getPopupContainer`、`destroyOnClose` 卸载、`content` prop 与 `content` slot 优先级、各 `placement`/`theme`/`status` 快照。
- **视觉回归**：dark/light × status × placement 截图矩阵。
- **触摸**：hover 不可用时回退触发路径。

## 12. 验收标准 Checklist

- [ ] 包名/导出符合 `@chenzy-design/core#createTooltip` 与 `@chenzy-design/svelte#Tooltip`。
- [ ] 所有类名为 `cd-tooltip` BEM-like（`cd-tooltip__content`/`cd-tooltip__arrow`/`cd-tooltip--dark`/`cd-tooltip--warning`）。
- [ ] 仅消费 Alias/Component 级 `--cd-tooltip-*` Token，无写死颜色/尺寸。
- [ ] API 遵循约定：`open` + `on:openChange`、`status: default|warning|error`；`visibleChange` 标记 deprecated。
- [ ] headless 逻辑在 core，复用 `useId`/`useDismiss`/定位原语；渲染层 Portal + `destroyOnClose`。
- [ ] `role="tooltip"` + `aria-describedby` 正确关联，隐藏/禁用时无悬空引用。
- [ ] 满足 WCAG 1.4.13：Dismissible(Esc)、Hoverable(移入不消失)、Persistent。
- [ ] 键盘：focus 显示、blur 隐藏、Esc 关闭不冒泡；Tooltip 内无可聚焦交互元素。
- [ ] 定位：12 方位 + flip/shift/arrow + autoUpdate 跟随 + RTL 镜像通过测试。
- [ ] `prefers-reduced-motion` 降级生效。
- [ ] dark 主题及 warning/error 态文字对比度 ≥ 4.5:1。
- [ ] 可见文案零硬编码，a11y key（`Tooltip.*`）齐备。
- [ ] 危险操作（解释禁用原因）文案范式与 Popconfirm 分工文档化。
- [ ] Perf Budget 达标（svelte ≤3.5KB / core ≤2.5KB gzip），关闭时移除监听。
- [ ] 提供 `component.meta.ts`，含 props/events/slots/tokens/a11y/usageHints/antiPatterns。
- [ ] 批量场景（表格）共享实例/委托范式文档化。
