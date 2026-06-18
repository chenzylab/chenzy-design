# SPEC · Drawer
> 分类：feedback · 阶段：M5
> 对标 Semi：SideSheet（Semi 称 SideSheet，本库命名为 Drawer，含别名导出）

## 1. 概述

Drawer（抽屉）是从视口边缘滑入的浮层容器，承载临时性的次要任务流：表单编辑、详情查看、筛选面板、设置项等。相比 Modal 居中弹窗，Drawer 不打断主内容的空间认知，适合内容较长、需要并行参照主界面的场景。

**与相邻组件的边界**：
- 与 **Modal** 的区分：Modal 居中、强阻断、用于关键确认/短交互；Drawer 贴边滑入、可配 `mask=false` 弱阻断、用于较长的编辑/浏览流。
- 与 **SideSheet** 的关系：Semi 中二者为同一组件。本库统一为 **Drawer**，并提供 `SideSheet` 作为类型别名导出（`export { Drawer as SideSheet }`），不重复实现，避免概念分裂。
- 与 **Popover/Dropdown** 的区分：后者锚定于触发元素、轻量、无遮罩焦点陷阱；Drawer 锚定视口边缘、为对话框语义（`role="dialog"`）、需焦点管理。

核心能力：四方向滑入（`placement` left/right/top/bottom）、可选遮罩、可拖拽/预设宽高、嵌套（多层 Drawer）、`closeOnEsc`/`closeOnMaskClick`、`destroyOnClose`、`getContainer` 自定义挂载点、滚动锁定、完整焦点陷阱与 a11y。

## 2. 设计语义

- **方向与尺寸**：`placement=left|right` 控制 `width`（默认 `--cd-drawer-width` 448px），`top|bottom` 控制 `height`。`size=small|default|large` 映射到预设尺寸 token；显式 `width/height` 优先级高于 `size`。
- **层级语义**：遮罩层 `--cd-drawer-z-mask`，面板层 `--cd-drawer-z-panel`，与 Modal 共享 `--cd-z-popup` 基线，嵌套时按打开顺序递增 z-index（由 core 维护层栈）。
- **运动**：贴边方向位移 + 透明度过渡，时长 `--cd-drawer-motion-duration`（默认 250ms），缓动 `--cd-motion-ease-out`（入）/`--cd-motion-ease-in`（出）。遮罩仅做透明度过渡。`prefers-reduced-motion` 时退化为纯透明度切换且时长趋零。
- **结构语义**：`__mask`（遮罩）/ `__panel`（面板）/ `__header`（标题区，含 title + closeIcon）/ `__body`（可滚动内容）/ `__footer`（操作区，固定吸底）。header 与 footer 不参与 body 滚动。
- **弱阻断模式**：`mask=false` 时面板带 `--cd-shadow-elevated` 投影以区分图层，主内容仍可交互。
- **颜色**：面板背景 `--cd-color-bg-0`，文字 `--cd-color-text-0`，分隔线 `--cd-color-border`，遮罩 `--cd-color-overlay-bg`。

## 3. 分层实现

属于复杂交互/a11y 组件，**逻辑入 core，渲染入 svelte**。

`@chenzy-design/core` 暴露 `createDrawer(config)`，返回状态与 action：
- `useFocusTrap`：面板内 Tab 循环，open 时聚焦首个可聚焦元素或 `panel`，close 时归还焦点到触发元素（`returnFocusOnClose`）。
- `useDismiss`：聚合 Esc（`closeOnEsc`）与遮罩点击（`closeOnMaskClick`）触发 `openChange(false)`；支持 `mask=false` 时禁用外部点击关闭。
- `useScrollLock`：open 且 `mask` 时锁定 `document.body` 滚动（带滚动条补偿，防布局抖动）；嵌套时按引用计数，最后一层关闭才解锁。
- `useLiveAnnouncer`：可选，打开时向 SR 通报标题（用于无 title 兜底）。
- `useId`：生成 `aria-labelledby`/`aria-describedby` 关联 id。
- **层栈管理**：维护打开顺序栈，确定 z-index 与“仅顶层响应 Esc”策略。

`@chenzy-design/svelte`：消费 core action，负责 DOM 结构、过渡（svelte transition + token 时长）、Portal（`getContainer`）、`destroyOnClose` 的内容挂卸、slot 分发。SSR 安全（open 默认 false，Portal 在 mount 后创建）。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| open | `boolean` | `false` | 受控显隐，配合 `on:openChange` |
| placement | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 滑入方向 |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 预设尺寸，被 width/height 覆盖 |
| width | `number \| string` | — | left/right 时宽度，优先于 size |
| height | `number \| string` | — | top/bottom 时高度，优先于 size |
| title | `string` | — | 标题文案，未设则需用 slot 或 `aria-label` |
| mask | `boolean` | `true` | 是否显示遮罩 |
| maskClosable | `boolean` | `true` | 点击遮罩是否关闭（即 closeOnMaskClick） |
| closeOnEsc | `boolean` | `true` | Esc 是否关闭（仅顶层响应） |
| closable | `boolean` | `true` | 是否显示右上角关闭按钮 |
| keyboard | `boolean` | `true` | 是否启用键盘交互总开关 |
| destroyOnClose | `boolean` | `false` | 关闭时卸载内容（重置内部状态） |
| getContainer | `() => HTMLElement` | `() => document.body` | 浮层挂载点 |
| zIndex | `number` | — | 覆盖自动层级 |
| returnFocusOnClose | `boolean` | `true` | 关闭后归还焦点到触发元素 |
| disableScrollLock | `boolean` | `false` | 禁用 body 滚动锁定 |
| className | `string` | — | 透传到 `__panel` |
| style | `string` | — | 透传到 `__panel` |
| ariaLabel | `string` | — | 无 title 时的可访问名 |

### Events

| 名称 | payload | 说明 |
|---|---|---|
| on:openChange | `boolean` | 显隐变更意图（Esc/遮罩/关闭按钮触发），父组件据此更新 `open` |
| on:close | `void` | 关闭动作发生（语义糖，等价 openChange(false)） |
| on:afterEnter | `void` | 入场过渡结束（已完全展开） |
| on:afterLeave | `void` | 出场过渡结束（DOM 卸载后），适合配合 destroyOnClose 清理 |
| on:maskClick | `MouseEvent` | 遮罩被点击（无论 maskClosable 是否生效） |

### Slots

| 名称 | 作用域 | 说明 |
|---|---|---|
| default | — | 主体内容（`__body`，可滚动） |
| title | — | 自定义标题区（覆盖 `title` prop） |
| footer | — | 吸底操作区，未提供则不渲染 footer |
| closeIcon | — | 自定义关闭图标 |
| extra | — | header 右侧附加区域（关闭按钮左侧） |

## 5. 主题 / Token 表

| Token | 消费 Alias/Global | 说明 |
|---|---|---|
| --cd-drawer-bg | --cd-color-bg-0 | 面板背景 |
| --cd-drawer-color-text | --cd-color-text-0 | 主体文字 |
| --cd-drawer-color-title | --cd-color-text-0 | 标题文字 |
| --cd-drawer-border | --cd-color-border | header/footer 分隔线 |
| --cd-drawer-mask-bg | --cd-color-overlay-bg | 遮罩颜色（半透明） |
| --cd-drawer-shadow | --cd-shadow-elevated | mask=false 时面板投影 |
| --cd-drawer-width | 448px（Global 引用） | left/right 默认宽 |
| --cd-drawer-width-small | 320px | size=small 宽 |
| --cd-drawer-width-large | 720px | size=large 宽 |
| --cd-drawer-height | 320px | top/bottom 默认高 |
| --cd-drawer-header-padding | --cd-spacing-5 | header 内边距 |
| --cd-drawer-body-padding | --cd-spacing-5 | body 内边距 |
| --cd-drawer-footer-padding | --cd-spacing-4 --cd-spacing-5 | footer 内边距 |
| --cd-drawer-radius | --cd-radius-0 (0) | 贴边侧无圆角，背侧可选 |
| --cd-drawer-z-mask | --cd-z-popup | 遮罩层级基线 |
| --cd-drawer-z-panel | calc(--cd-z-popup + 1) | 面板层级基线 |
| --cd-drawer-motion-duration | --cd-motion-duration-md (250ms) | 过渡时长 |
| --cd-drawer-close-color | --cd-color-text-2 | 关闭图标默认色 |
| --cd-drawer-close-color-hover | --cd-color-text-0 | 关闭图标 hover 色 |

组件仅消费 Alias/Component 级 token，无写死颜色/尺寸。

## 6. 无障碍（WCAG 2.1 AA · WAI-ARIA APG Dialog (Modal) Pattern）

- **role**：`__panel` 为 `role="dialog"`，`aria-modal="true"`（`mask=true` 时）；`mask=false` 时 `aria-modal="false"` 且不做整页 inert。
- **可访问名**：`aria-labelledby` 指向 header title 的 id；无 title 时用 `aria-label`（来自 `ariaLabel` prop），二者皆缺时开发态告警。可选 `aria-describedby` 关联首段说明。
- **焦点管理**：打开时焦点移入面板（首个可聚焦元素 → 否则 `panel` 设 `tabindex="-1"` 并聚焦）；Tab/Shift+Tab 在面板内循环（useFocusTrap）；关闭后归还焦点到触发元素（returnFocusOnClose）。
- **背景隔离**：`mask=true` 时对面板外内容设 `inert`/`aria-hidden`，SR 与指针均不可达。
- **键盘交互**：
  - `Esc`：关闭（closeOnEsc 且为顶层 Drawer）。
  - `Tab` / `Shift+Tab`：焦点循环。
  - 关闭按钮：`Enter`/`Space` 触发。
- **关闭按钮**：`<button>` 元素，`aria-label`（i18n `Drawer.close`），非 `<div>`。
- **对比度**：文字/图标对面板背景 ≥ 4.5:1；关闭图标 hover/focus 态 ≥ 3:1；focus ring 用 `--cd-color-focus`，可见且对比达标。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用位移过渡，仅保留极短透明度切换，保证打开后立即可用。
- **RTL**：`dir="rtl"` 时 `placement=left/right` 的视觉起始边镜像（逻辑属性 inset-inline-start/end），关闭按钮位置随之镜像。
- **嵌套**：仅最顶层响应 Esc 与遮罩点击，避免一次关闭多层。

## 7. 国际化

- 所有用户可见文案走 i18n，零硬编码。i18n key：
  - `Drawer.close`：关闭按钮 `aria-label`（默认“关闭”）。
  - `Drawer.title`：无业务标题时的兜底通用标题（默认“详情”，按需启用）。
- 日期/数字若出现在内容区由调用方处理；组件自身不渲染日期/数字，无 Intl 直接依赖。Drawer 提供的内置文案数量极少，确保 RTL 与多语言下布局自适应（逻辑属性、不写死方向）。

## 8. 文案（content-guidelines）

- 标题：名词短语，简洁描述任务对象，如“编辑用户”“筛选条件”，不加句末标点。
- 关闭按钮：仅图标 + `aria-label`“关闭”，不显示文字。
- footer 操作按钮：主操作动词明确（“保存”“提交”），次操作“取消”。

**危险操作文案（单列）**：
- 当 Drawer 内含未保存编辑、用户尝试关闭（Esc/遮罩/关闭按钮）时，调用方应拦截 `on:openChange(false)` 弹出二次确认（用 Modal/Popconfirm），文案如：标题“放弃未保存的更改？”、说明“关闭后当前编辑内容将丢失，且无法恢复。”、确认按钮“放弃更改”（danger 态），取消“继续编辑”。
- 危险确认按钮文字须为具体动作（“放弃更改”），禁止用模糊“确定/是”。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
|---|---|---|
| gzip 体积（svelte 层） | ≤ 4.5 KB | 不含共享 core 原语 |
| gzip 体积（core createDrawer） | ≤ 2.5 KB | 与 Modal 共享 focusTrap/dismiss/scrollLock，多组件摊薄 |
| 打开首帧 | ≤ 1 帧调度内启动过渡 | Portal 节点惰性创建，open=false 时零 DOM |
| 过渡时长 | 250ms（reduced-motion ≈ 0） | token 驱动，不阻塞主线程 |
| 内容渲染 | 默认惰性 | `open=false` 不渲染 body slot；`destroyOnClose` 关闭即卸载 |
| 滚动锁定 | O(1) | 滚动条宽度补偿一次性计算，嵌套引用计数 |

- 不需虚拟化（容器组件，长列表由调用方在 body 内自行虚拟化）。
- `destroyOnClose=true` 用于重型内容（表单/图表）以释放内存并重置状态；默认 false 以保留状态、加快二次打开。
- 嵌套多层 Drawer 共用单一层栈与一次滚动锁，避免重复副作用。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: "Drawer"`、`category: "feedback"`、`stage: "M5"`、`aliases: ["SideSheet"]`。
- `since`、`status: "stable"`、对标 `semi: "SideSheet"`。
- props/events/slots 的机器可读 schema（类型、默认值、枚举、是否受控）。
- `a11y`: `{ pattern: "APG/dialog-modal", role: "dialog", keyboard: ["Esc","Tab","Shift+Tab"] }`。
- `i18nKeys: ["Drawer.close","Drawer.title"]`。
- `composes: ["useFocusTrap","useDismiss","useScrollLock","useLiveAnnouncer","useId"]`。
- `dangerousActions`: 描述未保存关闭确认模式，供 AI 生成时自动补二次确认。
- `usageExamples`/`relatedComponents: ["Modal","Popover"]`，供 AI 辅助选型（何时用 Drawer vs Modal）。

## 11. 测试

- **单测（core）**：`createDrawer` 状态机（open/close、嵌套层栈 z-index、Esc 仅顶层、滚动锁引用计数、焦点归还目标记录）。
- **组件测**（@testing-library/svelte）：
  - 受控 `open` 变更触发渲染/卸载；`on:openChange` 在 Esc/遮罩/关闭按钮时各触发一次且 payload=false。
  - `maskClosable=false` 时遮罩点击不关闭但 `on:maskClick` 仍触发。
  - `destroyOnClose` 关闭后内容 DOM 不存在；afterLeave 在卸载后触发。
  - `placement` 四方向类名与 inset 逻辑属性正确。
  - `getContainer` 挂载到指定节点。
- **a11y 测**（jest-axe）：open 态无 violation；`aria-modal`、`aria-labelledby` 关联正确；缺 title/ariaLabel 开发态告警。
- **键盘/焦点测**：打开聚焦面板内首元素；Tab 循环不逃逸；关闭归还焦点到触发器；嵌套时 Esc 只关顶层。
- **视觉回归**：四方向 × {mask, mask=false} × {small/default/large} 截图；RTL 镜像；reduced-motion 快照。
- **SSR**：服务端渲染 open=false 不报错、不产生 Portal。

## 12. 验收标准 checklist

- [ ] API 遵循全局约定：`open` + `on:openChange` 受控显隐；`size` 枚举 small|default|large。
- [ ] 四方向 `placement` 滑入正确，width/height 优先于 size，RTL 镜像。
- [ ] 逻辑在 `@chenzy-design/core` 的 `createDrawer`，渲染在 `@chenzy-design/svelte`；复用 useFocusTrap/useDismiss/useScrollLock/useLiveAnnouncer/useId。
- [ ] `role="dialog"` + `aria-modal` + `aria-labelledby`/`aria-label` 正确；缺可访问名时开发态告警。
- [ ] 焦点管理：打开移入、Tab 循环、关闭归还（returnFocusOnClose）；背景 inert。
- [ ] 键盘：Esc（顶层）关闭、Tab/Shift+Tab 循环、关闭按钮 Enter/Space。
- [ ] 嵌套：层栈 z-index 递增、单次滚动锁（引用计数）、Esc 仅顶层。
- [ ] 滚动锁定带滚动条补偿，无布局抖动；`disableScrollLock` 可关。
- [ ] `destroyOnClose` 卸载内容并重置状态；afterLeave 在卸载后触发。
- [ ] 所有可见文案走 i18n（`Drawer.close`/`Drawer.title`），零硬编码；逻辑属性支持 RTL。
- [ ] 仅消费 `--cd-` Alias/Component token，无写死颜色/尺寸；`prefers-reduced-motion` 退化。
- [ ] 危险操作（未保存关闭）确认模式文档化，确认按钮用具体动词。
- [ ] 提供 `component.meta.ts`，含 a11y/i18n/composes/aliases(SideSheet)/dangerousActions 元数据。
- [ ] Perf Budget 达标：svelte ≤ 4.5KB / core ≤ 2.5KB gzip；open=false 零 DOM、惰性 Portal。
- [ ] `SideSheet` 别名导出与 Drawer 行为一致。
