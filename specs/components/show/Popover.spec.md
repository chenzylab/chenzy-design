# SPEC · Popover
> 分类：show · 阶段：M4
> 对标 Semi：Popover

## 1. 概述

Popover（气泡卡片）是一个由用户交互（点击、悬停、聚焦）触发、相对于触发元素定位的轻量浮层容器。与 Tooltip 不同，Popover 承载更丰富的内容：标题、正文、表单、操作按钮、列表等可交互元素，因此内部元素必须可获得焦点、可被键盘操作。

典型场景：
- 触发元素旁展示补充信息卡片（含链接/按钮）。
- 轻量级二次确认（Popconfirm 即基于 Popover 构建）。
- 表单内联编辑、筛选面板、操作菜单容器。

与库内相关组件的边界：
- Tooltip：纯文本提示，内容不可交互，`role=tooltip`，无焦点陷入。Popover 内容可交互。
- Dropdown：以菜单为内容、强语义 `menu/menuitem`。Popover 是通用容器，无固定语义。
- Modal：阻断式、居中、带遮罩。Popover 非阻断、锚定定位、通常无遮罩。

Popover 是 M4 浮层体系的通用基座，Popconfirm/Dropdown/部分 Select 面板可在其定位与显隐能力上复用。

## 2. 设计语义

- **气泡形态**：圆角卡片 + 阴影 + 可选箭头（arrow）指向触发元素，箭头随定位方位自动翻转、随 `align` 微调偏移。
- **定位语义**：12 方位 `position`（top/topLeft/topRight/bottom/.../left/right + 角对齐变体），默认 `bottom`。基于触发元素与视口计算，支持碰撞翻转（flip）与位移贴边（shift）。
- **触发语义**：`trigger=hover` 表达"探索性、可放弃"信息；`click` 表达"主动、需停留操作"的内容；`focus` 服务键盘/无障碍；`custom` 完全受控。
- **层级**：使用 `--cd-z-popover` 语义层级，低于 Modal/Drawer，高于页面内容。
- **运动**：进入淡入 + 轻微缩放/位移（从触发方位生长），退出反向。尊重 `prefers-reduced-motion`：降级为纯 opacity 或无动画。
- **状态**：仅显隐两态；无校验态（容器组件）。空内容时不渲染浮层。
- **暗色/对比**：背景 `--cd-popover-bg`、边框、箭头三者与底层内容对比度满足 AA；阴影在暗色下减弱、增强边框。

## 3. 分层实现

属于"有交互/键盘/a11y 逻辑"的组件，采用 headless + 渲染分层。

**`@chenzy-design/core` · `createPopover(config)`**
负责无渲染逻辑：
- 触发状态机：`hover`（含 `mouseEnterDelay`/`mouseLeaveDelay`、指针在 trigger↔popover 间移动不关闭的 safe-bridge）、`click`、`focus`、`custom`。
- 定位引擎：position 解析、flip/shift 碰撞处理、箭头坐标计算、`autoAdjustOverflow`、`getPopupContainer` 支持。返回 `floatingStyles` 与 `arrowStyles`。
- 复用 core 原语：
  - `useDismiss`：外部点击、`Esc`、滚动/失焦关闭（可配）。
  - `useFocusTrap`：`trigger=click` 且内容含可聚焦元素时启用，关闭后焦点归还触发器（`returnFocus`）。
  - `useScrollLock`：默认关闭（非阻断），仅 `lockScroll` 显式开启时启用。
  - `useId`：生成浮层 `id`，供触发器 `aria-controls`/`aria-describedby` 关联。
  - `useLiveAnnouncer`：可选，对 `hover/focus` 浮层做礼貌播报（默认关闭，避免噪音）。
- 暴露：`open`、`getTriggerProps()`、`getFloatingProps()`、`getArrowProps()`、`setOpen()`、`update()`（重新计算定位）。

**`@chenzy-design/svelte` · `<Popover>`**
- 通过 action `use:popover.trigger` 绑定触发器，浮层通过 portal 渲染到 `getPopupContainer`（默认 `document.body`），应用 `floatingStyles`。
- 实现 `motion`/transition、`destroyOnClose`/`spring`、slot 透传、reduced-motion 适配。
- 受控/非受控双模：内部 `open` 状态 + `open` prop + `on:openChange`。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| content | string \| Snippet | — | 浮层内容；可用 `content` slot 替代 |
| open | boolean | — | 受控显隐；配合 `on:openChange` |
| defaultOpen | boolean | false | 非受控初始显隐 |
| trigger | 'hover' \| 'click' \| 'focus' \| 'custom' | 'hover' | 触发方式 |
| position | Position（12 方位） | 'bottom' | 浮层相对触发器的方位 |
| align | 'start' \| 'center' \| 'end' | 'center' | 主轴对齐微调 |
| showArrow | boolean | true | 是否显示指向箭头 |
| arrowPointAtCenter | boolean | false | 箭头是否指向触发器中心 |
| spacing | number \| {x;y} | 8 | 浮层与触发器间距（px） |
| mouseEnterDelay | number | 100 | hover 进入延迟（ms） |
| mouseLeaveDelay | number | 100 | hover 离开延迟（ms） |
| autoAdjustOverflow | boolean | true | 视口溢出时自动 flip/shift |
| getPopupContainer | () => HTMLElement | () => body | 浮层挂载容器 |
| zIndex | number | var(--cd-z-popover) | 层级 |
| trapFocus | boolean | trigger==='click' | 是否陷入焦点 |
| returnFocus | boolean | true | 关闭后焦点是否归还触发器 |
| closeOnEsc | boolean | true | Esc 关闭 |
| closeOnOutsideClick | boolean | true | 外部点击关闭 |
| lockScroll | boolean | false | 打开时锁定背景滚动 |
| destroyOnClose | boolean | false | 关闭时销毁内容 DOM |
| rememberFocus | boolean | false | 重新打开时恢复上次焦点位置 |
| stopPropagation | boolean | false | 阻断浮层内事件冒泡 |
| disabled | boolean | false | 禁用触发 |
| size | 'small' \| 'default' \| 'large' | 'default' | 内边距尺寸档位 |
| motion | boolean \| MotionConfig | true | 动画开关/配置 |
| class / style | string | — | 浮层根元素样式 |

### Events

| 事件 | 载荷 | 说明 |
|---|---|---|
| openChange | `{ open: boolean }` | 显隐变化（受控同步入口） |
| open | — | 浮层完成打开（动画结束） |
| close | — | 浮层完成关闭 |
| positionChange | `{ position: Position }` | flip/shift 后实际方位变化 |
| clickOutside | `{ target: EventTarget }` | 点击浮层外部 |
| escKeydown | — | 按下 Esc 触发关闭前 |

### Slots

| 名称 | 作用域参数 | 说明 |
|---|---|---|
| default | — | 触发元素（trigger） |
| content | `{ close: () => void }` | 浮层内容，提供主动关闭方法 |
| arrow | — | 自定义箭头渲染（覆盖默认） |

## 5. 主题 / Token

组件仅消费 Alias 与 Component Token，禁止写死值。

| Component Token | 引用 Alias / Global | 说明 |
|---|---|---|
| --cd-popover-bg | --cd-color-bg-0 | 浮层背景 |
| --cd-popover-color | --cd-color-text-0 | 内容文本色 |
| --cd-popover-border-color | --cd-color-border | 边框/暗色描边 |
| --cd-popover-radius | --cd-radius-medium | 圆角 |
| --cd-popover-shadow | --cd-shadow-elevated | 卡片阴影 |
| --cd-popover-arrow-size | 8px (Global --cd-size-2) | 箭头边长 |
| --cd-popover-padding-small | --cd-spacing-2 / --cd-spacing-3 | small 档内边距 |
| --cd-popover-padding-default | --cd-spacing-3 / --cd-spacing-4 | default 档内边距 |
| --cd-popover-padding-large | --cd-spacing-4 / --cd-spacing-5 | large 档内边距 |
| --cd-popover-max-width | 320px | 默认最大宽度 |
| --cd-popover-z | --cd-z-popover | 层级 |
| --cd-popover-motion-duration | --cd-motion-duration-fast | 动画时长 |
| --cd-popover-motion-easing | --cd-motion-easing-standard | 缓动曲线 |

箭头颜色继承 `--cd-popover-bg`、描边继承 `--cd-popover-border-color`，确保与卡片一致。

## 6. 无障碍

遵循 WAI-ARIA APG（Tooltip/Dialog 混合模式，依触发与内容而定）。

- **role**：
  - 内容可交互 + `trigger=click` → 浮层根 `role="dialog"`，`aria-modal="false"`，`aria-labelledby`（若有标题）。
  - 内容仅信息性 + `trigger=hover/focus` → `role="tooltip"`，触发器加 `aria-describedby={popoverId}`。
- **关联**：触发器 `aria-haspopup="dialog"`（dialog 模式）、`aria-expanded={open}`、`aria-controls={popoverId}`。
- **键盘交互**：
  - `Esc`：关闭并归还焦点（`closeOnEsc`）。
  - `click` 模式：`Enter`/`Space` 触发；打开后 `Tab`/`Shift+Tab` 在浮层内循环（`trapFocus`）。
  - `focus` 模式：触发器获焦即开、失焦即关。
- **焦点管理**：`trapFocus` 时打开后焦点移入浮层首个可聚焦元素（无则浮层根 `tabindex=-1`）；关闭后 `returnFocus` 归还触发器。`useFocusTrap` 实现。
- **对比度**：背景/文本/边框满足 AA（≥4.5:1 文本）；箭头边缘与背景可辨。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用缩放/位移，仅 opacity 或瞬时。
- **RTL**：`position`/`align` 在 `dir=rtl` 下左右镜像；箭头与 shift 偏移随之翻转。
- **指针**：hover safe-bridge 保证指针移入浮层不关闭，避免可达性陷阱。

## 7. 国际化

容器组件自身用户可见文案极少；内置文案与日期/数字格式化交由内容使用方。需 i18n 的内置项：

| i18n key | 用途 |
|---|---|
| Popover.close | 关闭按钮 `aria-label`（destroyOnClose/带关闭图标时） |
| Popover.dialogLabel | dialog 模式无标题时的兜底 `aria-label` |

- 浮层内业务文案零硬编码，由调用方通过 `content`/slot 注入。
- 内容中的日期/数字一律使用 `Intl.DateTimeFormat`/`Intl.NumberFormat`。
- `dir` 跟随当前 locale，驱动定位镜像。

## 8. 文案

- 标题简短（名词/名词短语），正文一句话说清；遵循 content-guidelines 的句式与大小写规范。
- 关闭按钮使用图标 + 可访问名称（`Popover.close`），不在视觉上放冗余"关闭"文字。
- 避免在 hover Popover 内放置需要精确操作的关键控件（指针易移出）。

**危险操作文案（单列）**：Popover 作为 Popconfirm 容器时，危险确认按钮文案须具体且后果明确，例如"删除此项"而非"确定"；标题陈述后果（"删除后无法恢复"）。破坏性按钮用 `--cd-color-danger`，并保证非颜色可辨（图标/文案）。

## 9. 性能

| 维度 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte 渲染层） | ≤ 3.5 KB |
| gzip 体积（core createPopover） | ≤ 4 KB（共享 useDismiss/useFocusTrap/useId 不重复计） |
| 首次打开定位计算 | < 4ms（单次 measure + 1 次 flip 重算） |
| 滚动/resize 跟随 | rAF 节流，`update()` ≤ 1 次/帧；浮层关闭即解绑监听 |
| 内容渲染 | 默认惰性：未打开不渲染浮层 DOM；`destroyOnClose` 关闭即卸载 |
| 内存 | 监听器（scroll/resize/pointer/dismiss）随关闭即时清理，无泄漏 |
| 虚拟化 | 不需要（内容由使用方决定；长列表内容应由调用方虚拟化） |

策略：默认 lazy mount（首次打开才挂载）；高频重开场景设 `destroyOnClose=false` 复用 DOM；hover 防抖减少抖动重算。

## 10. AI 元数据

提供 `component.meta.ts`，包含：
- `name: 'Popover'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Popover'`。
- props/events/slots 的机器可读 schema（类型、默认值、枚举、是否受控对 `open`/`openChange`）。
- 关系：`composes: ['Popconfirm','Dropdown']`、`differsFrom: ['Tooltip','Modal']`，含选择指引文本。
- a11y 概要：role 切换规则（dialog vs tooltip）、键盘表、focus 行为。
- token 清单与可定制点；usage 示例（hover/click/受控/Popconfirm）。
- 约束规则：`trigger=hover` 不建议放交互控件；`trapFocus` 默认随 `click` 联动。

## 11. 测试

- **单元（core）**：触发状态机各分支（hover delay、safe-bridge、click toggle、focus、custom）；定位 flip/shift/arrow 坐标；受控/非受控同步；dismiss（outside/esc/scroll）。
- **组件（svelte）**：slot 透传与 `content` 的 `close()`；`destroyOnClose` 挂卸载；`open`↔`openChange` 双向；`positionChange` 触发。
- **a11y**：axe 无违规；role/aria 随模式切换断言；键盘流（Tab 循环、Esc 关闭、returnFocus）；reduced-motion 降级；RTL 镜像。
- **视觉回归**：12 方位 × {arrow on/off} × {light/dark} × 三 size 快照。
- **性能**：打开定位计算耗时基准；监听器关闭后解绑断言（无泄漏）。
- **交互 E2E**：hover 指针桥接不误关；滚动跟随；嵌套 Popover 焦点与 Esc 逐层关闭。

## 12. 验收标准

- [ ] core `createPopover` 与 svelte `<Popover>` 分层落地，复用 useDismiss/useFocusTrap/useScrollLock/useId/useLiveAnnouncer。
- [ ] 12 方位定位 + align + autoAdjustOverflow（flip/shift）正确，箭头方位自适应。
- [ ] 四种 trigger（hover/click/focus/custom）行为正确，hover safe-bridge 生效。
- [ ] 受控（open+openChange）与非受控（defaultOpen）双模一致；positionChange 上报实际方位。
- [ ] role 在 dialog/tooltip 间按内容与触发正确切换，aria-haspopup/expanded/controls/describedby 关联正确。
- [ ] 键盘：Esc 关闭、click 模式焦点陷入与循环、returnFocus 归还触发器。
- [ ] 所有 Token 走 `--cd-popover-*` → Alias，无硬编码颜色/尺寸；暗色对比度 AA。
- [ ] reduced-motion 与 RTL 适配通过；axe 无障碍零违规。
- [ ] 用户可见文案零硬编码，提供 `Popover.close`/`Popover.dialogLabel` key；日期/数字走 Intl。
- [ ] 惰性挂载 + destroyOnClose 生效，关闭后监听器全部解绑（无泄漏）。
- [ ] gzip 体积达标（svelte ≤3.5KB，core ≤4KB）。
- [ ] 提供 `component.meta.ts`，schema/关系/a11y/token 完整。
- [ ] 单元 / 组件 / a11y / 视觉回归 / 性能 / E2E 测试齐备并通过。
