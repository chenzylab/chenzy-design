# SPEC · Toast
> 分类：feedback · 阶段：M5
> 对标 Semi：Toast

## 1. 概述

Toast 是轻量级全局反馈组件，用于在不打断用户当前操作流的前提下，给出短暂的非阻塞提示（成功、信息、警告、错误、加载）。它以命令式 API 为主（`Toast.success('已保存')`），由库内部维护一个全局挂载点（`ToastContainer`），多条 Toast 在屏幕指定方位堆叠，到时自动消失，也可手动关闭或持久驻留（`duration: 0`）。

与同分类组件的边界：
- 与 Notification 区别：Toast 文案更短、无标题/操作区为主、定位居中或顶部、强调"一闪而过"；Notification 信息更丰富、常带标题与操作按钮、定位四角。
- 与 Message（Semi 中并入 Toast）合并：本组件即承担 Semi 的轻提示职责。
- 与 Alert 区别：Alert 内嵌在文档流中常驻，Toast 为浮层、自动消失。

核心能力：命令式调用与去重/更新（按 `id`）、类型预设、自动消失与悬停暂停、堆叠与最大可见数、可配置定位、aria-live 播报、命令式销毁（单条/全部）、Promise 联动（`Toast.promise`）。

## 2. 设计语义

- **类型语义**：`info`（中性，`--cd-color-primary`）、`success`（`--cd-color-success`）、`warning`（`--cd-color-warning`）、`error`（`--cd-color-danger`）、`loading`（spinner，无自动消失默认）。每类有专属前导图标，颜色仅取 Alias Token。
- **层级**：Toast 处于浮层最高层之一，z-index 取 `--cd-z-index-toast`（高于 Modal 遮罩，低于关键的全屏阻断层），保证错误反馈在弹窗之上仍可见。
- **定位**：6 方位 `top|topLeft|topRight|bottom|bottomLeft|bottomRight`，默认 `top`。同一方位的多条按时间顺序堆叠，新条目按方位从近边滑入。
- **动效**：进入用位移+淡入（top 系从上方滑入，bottom 系从下方滑入），退出用淡出+高度坍缩（让后续条目平滑上移）。时长 `--cd-toast-motion-duration`（约 200ms）。`prefers-reduced-motion` 时退化为纯透明度切换、无位移。
- **形状/留白**：圆角 `--cd-toast-radius`，内边距 `--cd-toast-padding`，阴影 `--cd-toast-shadow`（与 Popover 同级阴影令牌），背景 `--cd-color-bg-0`，文字 `--cd-color-text-0`。
- **尺寸**：复用全局 `small|default|large` 仅影响内边距与字号；图标尺寸随之。
- **可读上限**：单条最大宽度 `--cd-toast-max-width`，文案过长换行而非截断（轻提示不应截断关键信息）。

## 3. 分层实现

属于"有交互/键盘/a11y 逻辑"的组件，需 core + svelte 双层。

- **@chenzy-design/core · `createToastStore`**（非 per-instance 的 `create<Name>`，而是单例栈管理）：
  - 维护 toasts 数组（`{id, type, content, duration, position, createdAt, paused, status}`），提供 `add/update/remove/removeAll`。
  - 计时器逻辑：每条独立 timer，`duration>0` 时到点自动 `remove`；悬停/聚焦时 `pause`，离开时 `resume`（基于剩余时间，非重置）。
  - 去重/更新：`add` 时若传入已存在 `id` 则走 `update`（用于 `Toast.promise` 由 loading → success）。
  - `maxCount`：超出时移除最早一条（FIFO）。
  - 复用 core 原语：`useId`（生成唯一 id）、`useLiveAnnouncer`（向单例 live region 播报文案与类型，避免每条都自带 live region 导致重复播报）。
  - **不**使用 useFocusTrap/useScrollLock（Toast 不抢焦点、不锁滚动）；可选 `useDismiss` 仅用于"点击文档关闭可关闭项"的扩展场景，默认不启用。
  - 纯 TS、框架无关，便于 React/Vue 适配复用同一栈与计时模型。
- **@chenzy-design/svelte · `ToastContainer` + `Toast` 渲染 + 命令式入口**：
  - 库初始化时惰性创建唯一 `ToastContainer`（appendTo `document.body` 或自定义 `getPopupContainer`），订阅 `createToastStore`。
  - 渲染按 position 分组的 6 个堆叠列，逐条渲染 `ToastItem`（图标+内容+关闭按钮），处理进入/退出过渡（Svelte transition + `flip` 实现重排动画）。
  - 命令式 API（`Toast.info/success/warning/error/loading/open/update/close/destroyAll/promise/config`）是对 store 方法的薄封装；`Toast.config` 设置全局默认（duration/position/maxCount/getPopupContainer/top）。
  - 单例 live region 与计时暂停均在容器层与 core 协作。

## 4. API

### Props（`Toast.config` 全局默认 / 单条 `open` 入参 options）

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| content | string \| Snippet | — | 提示内容；必填（命令式首参可直接传 string） |
| type | `'info'\|'success'\|'warning'\|'error'\|'loading'` | `'info'` | 类型预设，决定图标与色彩 |
| duration | number | 3 | 自动消失秒数；`0` 表示不自动关闭（`loading` 默认 0） |
| id | string | 自动 | 唯一标识；重复传入则更新现有 Toast |
| position | `'top'\|'topLeft'\|'topRight'\|'bottom'\|'bottomLeft'\|'bottomRight'` | `'top'` | 弹出方位 |
| size | `'small'\|'default'\|'large'` | `'default'` | 尺寸 |
| icon | Snippet \| false | 类型默认图标 | 自定义前导图标；`false` 隐藏图标 |
| showClose | boolean | true | 是否显示关闭按钮 |
| closable | boolean | true | 是否允许手动关闭（含关闭按钮与可选点击） |
| pauseOnHover | boolean | true | 悬停/聚焦时暂停计时 |
| top | number \| string | 24 | 距视口顶/底的偏移（top/bottom 系生效） |
| zIndex | number | `--cd-z-index-toast` | 自定义层级 |
| maxCount | number | 5 | 同时可见上限（全局，超出 FIFO 移除） |
| getPopupContainer | () => HTMLElement | () => body | 自定义挂载容器 |
| theme | `'light'\|'dark'` | 跟随系统/主题 | 强制配色主题 |
| stack | boolean | true | 是否堆叠展示；false 时仅显示最新一条 |
| onClose | () => void | — | 关闭回调（见 Events） |
| onClick | (e) => void | — | 点击 Toast 主体回调 |

> 说明：本组件以命令式为主，无传统受控 `value`；其"显隐受控"语义由 `id` + `Toast.close(id)` / `Toast.update(id, opts)` 表达，符合命令式浮层的一致性变体。

### Events / Callbacks

| 事件 | 触发时机 | 回调参数 |
|---|---|---|
| onClose | 任意原因关闭（到时/手动/destroyAll）后 | `(id: string, reason: 'timeout'\|'manual'\|'replace'\|'destroyAll')` |
| onClick | 用户点击 Toast 主体 | `(event: MouseEvent, id: string)` |
| onMouseEnter | 指针进入（暂停计时） | `(id: string)` |
| onMouseLeave | 指针离开（恢复计时） | `(id: string)` |
| onOpenChange | 单条出现/消失（统一变体，open=true 出现，false 消失） | `(open: boolean, id: string)` |

> 命令式返回值：`Toast.success(...)` 返回 `id: string`，便于后续 `close/update`。`Toast.promise(p, msgs)` 返回原 Promise。

### Slots / Snippets

| 名称 | 说明 | 参数 |
|---|---|---|
| content | 自定义内容区（命令式可传 Snippet） | `{ id, type, close }` |
| icon | 自定义前导图标 | `{ type, size }` |
| closeIcon | 自定义关闭图标 | `{ id }` |

## 5. 主题 / Token 表

仅消费 Alias，新增 Component 级 `--cd-toast-*`：

| Component Token | 默认引用（Alias/Global） | 用途 |
|---|---|---|
| `--cd-toast-bg` | `--cd-color-bg-0` | 卡片背景 |
| `--cd-toast-color-text` | `--cd-color-text-0` | 正文文字 |
| `--cd-toast-color-icon-info` | `--cd-color-primary` | info 图标色 |
| `--cd-toast-color-icon-success` | `--cd-color-success` | success 图标色 |
| `--cd-toast-color-icon-warning` | `--cd-color-warning` | warning 图标色 |
| `--cd-toast-color-icon-error` | `--cd-color-danger` | error 图标色 |
| `--cd-toast-color-close` | `--cd-color-text-2` | 关闭按钮默认色 |
| `--cd-toast-color-close-hover` | `--cd-color-text-0` | 关闭按钮 hover 色 |
| `--cd-toast-radius` | `--cd-radius-medium` | 圆角 |
| `--cd-toast-shadow` | `--cd-shadow-elevated` | 浮层阴影 |
| `--cd-toast-padding` | `--cd-spacing-3 --cd-spacing-4` | 内边距（default） |
| `--cd-toast-padding-small` | `--cd-spacing-2 --cd-spacing-3` | small 内边距 |
| `--cd-toast-padding-large` | `--cd-spacing-4 --cd-spacing-5` | large 内边距 |
| `--cd-toast-gap` | `--cd-spacing-2` | 图标-文字、堆叠间距 |
| `--cd-toast-font-size` | `--cd-font-size-body` | 字号（default） |
| `--cd-toast-max-width` | `560px` 经 `--cd-size-*` | 单条最大宽度 |
| `--cd-toast-min-width` | `--cd-size-toast-min` | 单条最小宽度 |
| `--cd-toast-motion-duration` | `--cd-motion-duration-fast` | 进出场时长 |
| `--cd-toast-motion-easing` | `--cd-motion-easing-standard` | 缓动 |
| `--cd-z-index-toast` | `--cd-z-index-popover + 10` | 层级 |

暗色主题：`--cd-toast-bg` 在 dark 下指向 `--cd-color-bg-2`，阴影减弱，保证与暗背景对比。`theme` prop 可单条强制覆盖。

## 6. 无障碍

遵循 WAI-ARIA"alert / status"模式，不抢焦点（轻提示原则）。

- **role / aria-live**：
  - 单例 live region 容器：`error`/`warning` 类 → `role="alert"` + `aria-live="assertive"`；`info`/`success`/`loading` → `role="status"` + `aria-live="polite"`。播报由 `useLiveAnnouncer` 写入隐藏 live region 的文本，避免给每张可见卡片直接挂 live 造成重复或被过渡打断的播报。
  - 可见 ToastItem 自身用 `aria-hidden` 不参与额外播报（内容已通过 live region 播报），但关闭按钮可被指针/读屏用户访问。
- **关闭按钮**：`<button>` + `aria-label`（i18n `Toast.close`），可 Tab 聚焦；非阻断浮层，不做焦点陷阱。
- **键盘交互**：
  - Toast 不自动获取焦点；关闭按钮在 DOM Tab 序中可达。
  - `Esc`：当指针/焦点位于某条 Toast 上且 `closable` 时关闭该条（可选，默认仅关闭悬停项）。
  - 计时暂停同样响应键盘焦点（`focusin` 暂停 / `focusout` 恢复），保证键盘用户有时间阅读/操作。
- **焦点管理**：关闭一条后不转移焦点（避免打断），除非该条内有可聚焦元素且被关闭——此时焦点回退到 `document.body` 前的最近合理位置（一般不触发，因 Toast 罕有内部交互）。
- **对比度**：文字/图标对背景 ≥ 4.5:1，图标与状态色满足 3:1；不以颜色作为类型的唯一区分（图标形状区分）。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时移除滑入/坍缩位移，仅透明度切换；`pauseOnHover` 行为不变。
- **RTL**：`topLeft/topRight` 等方位在 `dir="rtl"` 下镜像（left↔right）；图标与文字顺序随逻辑方向；内边距用 logical properties。

## 7. 国际化

用户可见文案零硬编码，经 i18n provider 注入；命令式 `content` 由调用方负责本地化。库自带文案：

| i18n key | 默认（zh-CN） | 说明 |
|---|---|---|
| `Toast.close` | 关闭 | 关闭按钮 aria-label |
| `Toast.loading` | 加载中 | loading 类型缺省播报前缀（无 content 时） |
| `Toast.typeLabel.info` | 信息 | 播报时前缀类型语义（供读屏） |
| `Toast.typeLabel.success` | 成功 | 同上 |
| `Toast.typeLabel.warning` | 警告 | 同上 |
| `Toast.typeLabel.error` | 错误 | 同上 |

- 播报文本组装为 `{typeLabel} + content`（如"错误：保存失败"），`typeLabel` 走 i18n。
- 涉及时间/数量的内容由调用方用 `Intl.DateTimeFormat` / `Intl.NumberFormat` 格式化后传入；组件不内置格式化。
- RTL 语言自动镜像方位（见 6）。

## 8. 文案

遵循 content-guidelines：

- 轻提示文案应**短、具体、以结果为导向**：用"已保存草稿"而非"操作成功"；用"网络异常，请重试"而非"错误"。
- 句式：陈述句，不加句号（短提示）；避免技术黑话与错误码裸露（错误码可折叠到详情/控制台）。
- 单条建议 ≤ 一行半，超长信息改用 Notification 或 Modal。
- loading 文案表明正在进行的动作："正在上传…"。
- **危险操作文案（单列）**：Toast 仅用于"危险操作已发生后的反馈"，**不**承担危险操作的确认（确认须用 Modal.confirm）。
  - 危险结果反馈用 `error` 类型、明确后果与补救：如"删除失败，文件已被锁定"，避免模糊的"出错了"。
  - 不可逆操作的成功反馈应可提供撤销入口时，优先用 Notification（带"撤销"按钮）而非纯 Toast；若用 Toast 承载撤销，须 `duration` 适当延长（≥ 5s）并 `pauseOnHover`。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| core gzip | ≤ 1.8 KB | `createToastStore` + 计时/暂停/FIFO 逻辑，无 DOM 依赖 |
| svelte gzip（含样式） | ≤ 4.5 KB | `ToastContainer` + `ToastItem` + 命令式入口 |
| 首次调用挂载延迟 | ≤ 16ms | 惰性创建单例容器（首条 Toast 触发），不影响首屏 |
| 单条新增/移除 | ≤ 1 帧 | 仅操作单例栈与对应列，flip 重排控制在可见条数内 |
| 同时可见条数 | `maxCount` 默认 5 | 超出 FIFO 移除，**无需虚拟化**（轻提示天然少量） |

- **惰性渲染**：容器与 live region 在首次 `Toast.*` 调用时才创建；全部关闭后容器可保留（开销极小）或经配置回收。
- **destroyOnClose**：每条退出过渡结束后从 DOM 移除（坍缩动画后销毁），不保留隐藏节点。
- **计时器**：每条独立 timer，悬停/聚焦暂停记录剩余时间，避免 `setInterval` 轮询；页面 `visibilitychange` 隐藏时暂停所有计时，避免后台到点后一次性涌现。
- 不需虚拟化（数量受 `maxCount` 限制）；超大量场景应改用日志面板而非 Toast。

## 10. AI 元数据

提供 `component.meta.ts`（`Toast.meta.ts`），供 AI/低代码消费：

- `name: 'Toast'`，`category: 'feedback'`，`stage: 'M5'`，`imperative: true`（标记为命令式 API，无 JSX/标签用法为主）。
- `entry`: `import { Toast } from '@chenzy-design/svelte'`；方法签名 `success(content, opts?) => id` 等全列出。
- `props`/`events`/`slots` 结构化镜像第 4 节，含类型、默认值、枚举、必填、`a11y` 注记。
- `tokens`: 第 5 节 token 列表（名称+引用+用途），供主题工具生成。
- `i18nKeys`: 第 7 节 key 列表。
- `examples`: 典型片段（基础四类型、`Toast.promise`、自定义 position、loading→success 更新）。
- `relations`: `alternatives: ['Notification','Alert','Modal.confirm']`，`doNotUseFor: ['危险操作确认']`。
- `aiHints`: "短文案、不要承载确认、错误用 error 类型并给补救"。

## 11. 测试

- **单元（core）**：`createToastStore` 的 add/update/remove/removeAll；`id` 去重→更新；`maxCount` FIFO；计时到点自动移除；`pause/resume` 按剩余时间恢复（用假定时器 `vi.useFakeTimers`）；`duration:0` 永不自动关闭；`visibilitychange` 暂停。
- **组件（svelte）**：四类型渲染正确图标/色；命令式 `Toast.success` 返回 id 并出现卡片；`close(id)` 移除；`destroyAll` 清空；`pauseOnHover` 悬停后计时不前进；position 分组渲染；`stack:false` 仅留最新。
- **a11y**：axe 无违规；`error/warning` 命中 `role=alert`/`aria-live=assertive`，其余 `role=status`/`polite`；关闭按钮有 `aria-label`；reduced-motion 下无位移过渡；RTL 方位镜像。
- **交互/键盘**：关闭按钮可 Tab 聚焦并 Enter/Space 触发；`focusin` 暂停计时；`Esc` 关闭悬停项（若启用）。
- **i18n**：切换 locale 后 `Toast.close`/typeLabel 文本更新；播报文本含本地化 typeLabel。
- **视觉回归**：6 方位、5 类型、三尺寸、明暗主题、堆叠多条、进出场过渡快照。
- **性能**：bundle size 断言（size-limit）符合第 9 节预算；连续触发 50 条仅保留 `maxCount` 条且无内存泄漏（timer 清理）。

## 12. 验收标准 Checklist

- [ ] 命令式 API 全集可用：`info/success/warning/error/loading/open/update/close/destroyAll/promise/config`，`success` 等返回 `id`。
- [ ] `duration` 到点自动关闭；`0` 与 `loading` 默认常驻；`pauseOnHover`/`focusin` 暂停并按剩余时间恢复。
- [ ] `id` 重复触发更新（支持 `Toast.promise` loading→success/error 平滑切换）。
- [ ] 6 方位、`maxCount` FIFO、`stack:false` 行为正确；`getPopupContainer` 可自定义挂载。
- [ ] a11y：error/warning=`role=alert`+assertive，其余=`role=status`+polite；单例 live region 无重复播报；关闭按钮 `aria-label` 来自 i18n。
- [ ] 不抢焦点、不锁滚动、无焦点陷阱；reduced-motion 退化为纯透明度；RTL 方位镜像。
- [ ] 颜色对比 ≥ AA，类型不以颜色为唯一区分（含图标）。
- [ ] 仅消费 Alias/Component Token，无写死颜色/尺寸；暗色主题与 `theme` 覆盖生效。
- [ ] 用户可见文案零硬编码，i18n key 齐全；播报含本地化 typeLabel。
- [ ] 文案符合 guidelines；危险操作不由 Toast 承担确认，错误反馈给补救信息。
- [ ] 分层：core `createToastStore`（含计时/FIFO/announcer）框架无关，svelte 仅渲染+命令式封装，复用 `useId`/`useLiveAnnouncer`。
- [ ] Perf：core ≤ 1.8KB、svelte ≤ 4.5KB gzip；容器惰性创建；`destroyOnClose` 退场后移除 DOM；`visibilitychange` 暂停计时。
- [ ] 提供 `Toast.meta.ts`（`imperative:true`、props/events/slots/tokens/i18nKeys/examples/relations/aiHints 完整）。
