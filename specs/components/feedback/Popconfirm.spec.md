# SPEC · Popconfirm
> 分类：feedback · 阶段：M5
> 对标 Semi：Popconfirm

## 1. 概述

Popconfirm 是一种轻量级的就地确认气泡：点击触发元素后，在其旁边弹出一个带标题、内容、确认/取消按钮的小型浮层，用户必须显式确认或取消才能继续。它定位在 `Tooltip`/`Popover` 与 `Modal` 之间——比 Modal 更轻、不打断主流程上下文（锚定在触发元素旁），但比 Tooltip 多了"必须做出决策"的交互语义。

典型用例：
- 删除单行数据、移除标签、清空列表等**破坏性/不可逆操作**的二次确认（核心场景，重文案）。
- 启用/禁用开关、提交不可撤销的状态变更。
- 退出未保存的编辑、注销登录等需要用户停顿确认的轻量操作。

与同类组件边界：
- 信息量大、需要表单/多步交互 → 用 `Modal`。
- 仅展示信息无需决策 → 用 `Popover`/`Tooltip`。
- 全局非阻塞提示 → 用 `Toast`/`Notification`。

Popconfirm 内部复用 `Popover` 的浮层定位与显隐能力，额外封装了"双按钮 + 异步确认 loading + 焦点管理"的确认语义。

## 2. 设计语义

- **就地锚定（in-context confirmation）**：浮层箭头指向触发元素，强调"你正在对这个具体对象操作"，避免 Modal 把用户拉离上下文。
- **决策强制性**：与 Tooltip 不同，Popconfirm 默认 **不** 因 hover-out 或随意点击外部就静默消失视为"取消"——`onCancel` 是显式语义。点击遮挡区外部默认关闭并视为取消（可配置 `closeOnEsc`/外部点击行为）。
- **危险分级**：通过 `type="danger"` 把确认按钮渲染为危险色（`--cd-color-danger`），并在图标使用警示色，向用户传达"此操作有风险"。普通确认用主色。
- **视觉层级**：浮层使用 `--cd-color-bg-0` 背景 + `--cd-shadow-elevated` 阴影 + 箭头，z-index 高于页面内容但低于全屏 Modal。
- **尺寸与节奏**：内容紧凑，标题（必填语义）+ 描述（可选）+ 警示图标 + 右下角对齐的按钮组（取消在左、确认在右，符合 LTR 阅读终点习惯；RTL 镜像）。
- **动效**：浮层入场用轻微的 scale + fade（transform-origin 跟随箭头方位），尊重 `prefers-reduced-motion` 时退化为纯 opacity 渐变。

## 3. 分层实现

属于有交互/键盘/焦点/a11y 逻辑的复合控件，采用 headless + 渲染分层。

**@chenzy-design/core — `createPopconfirm`**
- 管理 `open` 状态机（受控/非受控）、`trigger`（click/hover/focus/custom）到显隐的映射。
- 异步确认编排：`onConfirm` 返回 Promise 时进入 `confirmLoading` 态，按钮 disabled，resolve 后自动关闭、reject 后保持打开（保留错误处理空间）。
- 焦点管理：打开时把焦点移入浮层（默认聚焦确认按钮，危险操作时聚焦取消按钮以防误触，见 a11y），关闭后焦点归还触发元素。
- 复用 core 原语：
  - `useId` — 生成 title/content 的 id 用于 `aria-labelledby/aria-describedby`。
  - `useDismiss` — Esc / 外部点击 关闭并触发 cancel。
  - `useFocusTrap` — 浮层内 Tab 循环（轻量 trap，仅限两按钮 + 内容内可聚焦元素）。
  - `useRovingTabindex` — 不需要（按钮天然可 Tab），不引入。
  - `useLiveAnnouncer` — 异步确认进入 loading 时向 SR 播报"处理中"。
  - 定位计算复用 `createPopover` 的 floating 引擎（placement/flip/shift/arrow）。
- 暴露 getter：`getTriggerProps()` / `getPopupProps()` / `getConfirmButtonProps()` / `getCancelButtonProps()` / `getArrowProps()`。

**@chenzy-design/svelte — `<Popconfirm>`**
- 消费 `createPopconfirm` 的 store/actions，渲染触发器 slot、浮层结构（图标 / 标题 / 内容 / 按钮组 / 箭头）。
- 透传 `Button` 组件给确认/取消按钮，确认按钮根据 `type` 注入 `theme="solid" type="danger"`。
- 支持 `destroyOnClose`（默认 true，关闭时卸载浮层 DOM）与惰性渲染（首次打开才挂载内容）。

纯展示部分（箭头、布局）无独立逻辑，随 Svelte 层模板实现。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `open` | `boolean` | `undefined` | 受控显隐。配合 `on:openChange` 使用 |
| `defaultOpen` | `boolean` | `false` | 非受控初始显隐 |
| `title` | `string \| Snippet` | — | 确认标题（语义必填，建议为一句话提问，如"确定删除？"） |
| `content` | `string \| Snippet` | — | 补充描述/后果说明（危险操作建议填写） |
| `type` | `'default' \| 'danger' \| 'warning'` | `'default'` | 确认语义，影响图标色与确认按钮主题 |
| `icon` | `Snippet \| false` | 自动 | 标题前图标；`type=danger/warning` 默认警示图标，`false` 隐藏 |
| `okText` | `string` | i18n 默认 | 确认按钮文案 |
| `cancelText` | `string` | i18n 默认 | 取消按钮文案 |
| `okType` | `ButtonProps['type']` | 跟随 `type` | 覆盖确认按钮颜色类型 |
| `okButtonProps` | `Partial<ButtonProps>` | — | 透传确认按钮属性 |
| `cancelButtonProps` | `Partial<ButtonProps>` | — | 透传取消按钮属性 |
| `showCancel` | `boolean` | `true` | 是否显示取消按钮 |
| `trigger` | `'click' \| 'hover' \| 'focus' \| 'custom'` | `'click'` | 触发方式 |
| `placement` | `Placement`（top/bottom/left/right + start/end 共 12 向） | `'top'` | 浮层方位 |
| `position` | 同 `placement` 别名 | — | 与 Semi 对齐的别名 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 浮层与按钮尺寸 |
| `disabled` | `boolean` | `false` | 禁用触发（不弹出） |
| `closeOnEsc` | `boolean` | `true` | Esc 关闭并触发 cancel |
| `closeOnOutsideClick` | `boolean` | `true` | 点击外部关闭并触发 cancel |
| `destroyOnClose` | `boolean` | `true` | 关闭时卸载浮层 DOM |
| `getPopupContainer` | `() => HTMLElement` | `body` | 浮层挂载容器 |
| `zIndex` | `number` | token 默认 | 浮层层级 |
| `motion` | `boolean` | `true` | 是否启用入场动效（受 reduced-motion 覆盖） |
| `arrowPointAtCenter` | `boolean` | `false` | 箭头是否指向触发元素中心 |
| `class` | `string` | — | 浮层根节点自定义类 |

### Events

| Event | 载荷 (`event.detail`) | 说明 |
|---|---|---|
| `on:openChange` | `{ open: boolean, reason: 'trigger' \| 'confirm' \| 'cancel' \| 'esc' \| 'outsideClick' }` | 显隐变化，含原因 |
| `on:confirm` | `MouseEvent` | 点击确认。若回调返回 `Promise`，浮层进入 loading 直到 settle |
| `on:cancel` | `MouseEvent \| KeyboardEvent` | 点击取消 / Esc / 外部点击触发 |
| `on:clickOutside` | `MouseEvent` | 点击浮层外部（在关闭逻辑前触发，可阻止默认关闭） |
| `on:afterOpen` | `void` | 入场动效结束、浮层完全可见 |
| `on:afterClose` | `void` | 出场动效结束、DOM 卸载后 |

> 注：异步确认通过 `okButtonProps.loading` 自动托管；调用方也可在 `on:confirm` 中 `event.detail` 之外通过返回 Promise 控制（Svelte 事件不支持返回值时，提供 `confirmLoading` 受控 prop 作为兜底）。

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| (default) | — | 触发元素（被包裹，注入 trigger props） |
| `title` | — | 自定义标题区 |
| `content` | — | 自定义内容区 |
| `icon` | `{ type }` | 自定义图标 |
| `footer` | `{ confirm, cancel, loading }` | 完全自定义按钮组（覆盖默认双按钮） |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 默认引用（Alias） | 用途 |
|---|---|---|
| `--cd-popconfirm-bg` | `--cd-color-bg-0` | 浮层背景 |
| `--cd-popconfirm-color-text` | `--cd-color-text-0` | 标题/内容文字 |
| `--cd-popconfirm-color-text-secondary` | `--cd-color-text-1` | 描述次级文字 |
| `--cd-popconfirm-border` | `--cd-color-border` | 浮层描边（高对比模式） |
| `--cd-popconfirm-shadow` | `--cd-shadow-elevated` | 浮层阴影 |
| `--cd-popconfirm-radius` | `--cd-radius-medium` | 圆角 |
| `--cd-popconfirm-padding` | `--cd-spacing-loose` | 内边距（small 用 `--cd-spacing-base`） |
| `--cd-popconfirm-icon-color-danger` | `--cd-color-danger` | 危险图标色 |
| `--cd-popconfirm-icon-color-warning` | `--cd-color-warning` | 警示图标色 |
| `--cd-popconfirm-icon-color-info` | `--cd-color-primary` | 普通确认图标色 |
| `--cd-popconfirm-arrow-bg` | `--cd-popconfirm-bg` | 箭头背景（与浮层一致） |
| `--cd-popconfirm-max-width` | `--cd-size-popup-max-width`（约 280px） | 内容最大宽度 |
| `--cd-popconfirm-zindex` | `--cd-zindex-popover` | 层级 |
| `--cd-popconfirm-gap-footer` | `--cd-spacing-tight` | 按钮间距 |

确认按钮颜色由 `Button` 组件 Token 接管：`type=danger` 时映射到 `--cd-button-danger-*`（最终引用 `--cd-color-danger`）。暗色模式通过 Alias 自动切换，组件无需额外定义。

## 6. 无障碍（WCAG 2.1 AA · WAI-ARIA APG · Dialog Pattern）

Popconfirm 是一个轻量非模态对话框，遵循 APG **Dialog (Non-Modal)** 模式：

- **role / aria**
  - 浮层根节点：`role="dialog"`，`aria-labelledby={titleId}`，`aria-describedby={contentId}`（content 存在时）。
  - 触发元素：`aria-haspopup="dialog"`，`aria-expanded={open}`，`aria-controls={popupId}`。
  - 危险图标：装饰性 `aria-hidden="true"`；危险语义改由文案承载（不依赖颜色，满足 1.4.1 不靠颜色传递信息）。
- **键盘交互**
  - `Esc`：关闭并触发 cancel（`closeOnEsc`）。
  - `Tab` / `Shift+Tab`：在浮层内可聚焦元素间循环（轻量 focus trap）。
  - `Enter` / `Space`：在确认/取消按钮上激活对应动作。
  - 触发器 `click`/`Enter`/`Space` 打开。
- **焦点管理**
  - 打开后焦点移入浮层。**默认聚焦取消按钮**（破坏性操作防误触，符合危险操作最佳实践）；`type=default` 可配置默认聚焦确认按钮。
  - 关闭后焦点归还触发元素（`useFocusTrap` 的 returnFocus）。
- **对比度**：文字/图标对背景 ≥ 4.5:1，确认按钮（含 danger 态）满足 3:1 非文本对比；阴影不作为唯一边界，高对比模式补充 `--cd-popconfirm-border`。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用 scale 动效，仅保留 opacity。
- **RTL**：`dir="rtl"` 时按钮组顺序与箭头/placement 自动镜像（start/end 逻辑属性驱动）。
- **SR 播报**：异步确认进入 loading 时 `useLiveAnnouncer` 以 `polite` 播报 `Popconfirm.confirming`。

## 7. 国际化

- 所有用户可见文案零硬编码，走 i18n provider；缺省回退英文。
- i18n keys：

| Key | 默认（en） | 默认（zh） |
|---|---|---|
| `Popconfirm.confirm` | `Confirm` | `确定` |
| `Popconfirm.cancel` | `Cancel` | `取消` |
| `Popconfirm.confirming` | `Processing…` | `处理中…` |
| `Popconfirm.deleteTitle` | `Delete this item?` | `确定删除该项？` |
| `Popconfirm.deleteContent` | `This action cannot be undone.` | `此操作无法撤销。` |

- `okText`/`cancelText` 显式传入时覆盖 i18n 默认。
- 文案中如含数量/日期，调用方应使用 `Intl.NumberFormat` / `Intl.DateTimeFormat` 格式化后再传入 `title`/`content`，组件不内置格式化但保证插值位置 RTL 安全。

## 8. 文案（content-guidelines）

- **标题**：一句话提问式，聚焦"对什么做什么"，避免冗长。例："删除此文件？"。
- **内容**：说明后果，尤其是不可逆性，简短客观。
- **按钮**：动词优先、与标题动作呼应；不可逆操作避免使用模糊的"确定/OK"，推荐明确动词。
- **大小写/标点**：标题句末用问号；内容完整句加句号；按钮文案 Title Case（en）。

**危险操作文案（单列）**
- 确认按钮使用明确破坏性动词而非"确定"：`删除` / `Delete`、`移除` / `Remove`、`清空` / `Clear`，使用户在不读标题时也知道后果。
- 标题必须点名对象与不可逆性：例 "删除「项目 A」？该操作无法撤销。"
- 禁止诱导式默认（如把危险按钮设为高亮主按钮并默认聚焦）；危险态默认聚焦取消、确认按钮用 danger 红而非高诱导主色。
- 涉及批量/计数时明确数量："删除 3 个文件？"（数量经 Intl 格式化）。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 策略 |
|---|---|
| `@chenzy-design/core` `createPopconfirm`（gzip） | ≤ 2.2 KB（含状态机+异步编排，复用 popover floating 引擎不重复计入） |
| `@chenzy-design/svelte` `<Popconfirm>`（gzip，不含 Button/Popover 共享依赖） | ≤ 2.0 KB |
| 共享 floating/dismiss/focus-trap 原语 | 与 Popover/Tooltip 共用，复用 0 额外成本 |
| 首屏 | 触发器无浮层成本；浮层惰性渲染（首次打开才挂载） |
| 关闭行为 | `destroyOnClose` 默认 true，卸载浮层 DOM 释放内存 |
| 虚拟化 | 不需要（内容轻量） |
| 运行时关键场景 | 打开 → 定位计算 < 1 帧（16ms）；异步确认期间按钮 disabled 防重复提交；定位监听用 ResizeObserver/rAF 节流，关闭即解绑 |
| 多实例（表格每行一个） | 触发器零浮层开销，仅打开的实例挂载 DOM；建议表格场景共享单实例 + 动态锚点以避免 N×浮层节点 |

## 10. AI 元数据

提供 `component.meta.ts`，包含：
- `name: 'Popconfirm'`、`category: 'feedback'`、`stage: 'M5'`、`semiEquivalent: 'Popconfirm'`。
- `props` 全量 schema（类型、默认值、枚举、是否必填语义、危险标记 `dangerous: ['type=danger 场景']`）。
- `events`/`slots` 描述与载荷类型。
- `aiHints`：
  - "破坏性操作请设 `type='danger'` 并填写说明后果的 `content`。"
  - "确认按钮文案用明确动词（删除/移除），勿用泛化的'确定'。"
  - "异步删除：`on:confirm` 回调返回 Promise 以获得自动 loading。"
  - "表格批量行场景优先共享单实例 + 动态锚点。"
- `tokens`：导出该组件全部 Component Token 及其 Alias 映射，供主题工具消费。
- `a11yPattern: 'dialog-non-modal'`、`recommendedReplacementOf: ['window.confirm']`。

## 11. 测试

- **单元（core，createPopconfirm）**
  - open 状态机：受控/非受控、trigger 各模式、disabled 不弹。
  - 异步确认：Promise resolve → 关闭；reject → 保持打开 + loading 解除。
  - reason 正确性：confirm/cancel/esc/outsideClick。
- **组件（svelte）**
  - 渲染结构：role=dialog、aria-labelledby/describedby 关联正确。
  - 危险态：`type=danger` 时确认按钮 danger 主题、默认聚焦取消按钮。
  - slot 覆盖：title/content/icon/footer。
  - `destroyOnClose`：关闭后浮层 DOM 卸载。
- **a11y（axe + 键盘）**
  - axe 无 violations（含对比度）。
  - 键盘流程：打开→Tab 循环→Esc 关闭→焦点归还触发器。
  - reduced-motion 下无 transform 动效。
- **交互（Playwright）**
  - 定位/flip：边界处 placement 自动翻转。
  - 外部点击关闭、loading 期间防重复确认。
  - RTL 按钮顺序与箭头镜像。
- **视觉回归**：default/danger/warning × small/default/large × 12 placement 快照；暗色模式快照。

## 12. 验收标准 Checklist

- [ ] 包/类名/Token 前缀符合全局约定（`@chenzy-design/*`、`cd-`、`--cd-`），组件不写死值，仅消费 Alias/Component Token。
- [ ] API 遵循一致性约定：`open` + `on:openChange`、`size` 三档；危险态由 `type` 驱动。
- [ ] headless 逻辑在 core `createPopconfirm`，渲染在 svelte，复用 useId/useDismiss/useFocusTrap/useLiveAnnouncer 与 popover floating 引擎。
- [ ] WAI-ARIA non-modal dialog 模式落地：role/aria-haspopup/aria-expanded/aria-controls/labelledby/describedby 齐备。
- [ ] 键盘可达：Esc 关闭、Tab 循环、Enter/Space 激活；关闭后焦点归还触发器。
- [ ] 危险操作：默认聚焦取消、确认按钮 danger 色、文案用明确动词、不靠颜色单独传递风险（axe 通过）。
- [ ] reduced-motion / RTL / 暗色模式 / 高对比度均验证。
- [ ] 用户可见文案零硬编码，i18n keys 全部接入，缺省英文回退。
- [ ] 异步确认自动 loading 且防重复提交；reject 保持打开。
- [ ] 惰性渲染 + `destroyOnClose` 生效；满足 Perf Budget（core ≤ 2.2KB / svelte ≤ 2.0KB gzip）。
- [ ] 提供 `component.meta.ts`（props/events/slots/tokens/aiHints/a11yPattern 完整）。
- [ ] 单元 / 组件 / a11y / 交互 / 视觉回归测试全部通过。
