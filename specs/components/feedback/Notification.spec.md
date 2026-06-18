# SPEC · Notification
> 分类：feedback · 阶段：M5
> 对标 Semi：Notification

## 1. 概述

Notification（通知提醒框）是一种**命令式**的全局反馈组件，用于在页面角落弹出短时或可常驻的消息卡片，承载比 Toast/Message 更丰富的内容（标题 + 描述 + 操作按钮 + 图标），且不打断用户主流程。

核心特征：
- **命令式 API 为主**：`notification.open(config)` / `success` / `info` / `warning` / `error` / `close(id)` / `destroyAll()`，无需在模板中预先挂载组件。
- **堆叠（stacking）**：同一位置的多条通知按时间顺序纵向堆叠，新通知按 `placement` 决定从顶部或底部插入，移除时其余项做位移动画补位。
- **六个位置**：`topLeft | top | topRight | bottomLeft | bottom | bottomRight`，每个位置独立维护一个容器与堆叠队列。
- **自动关闭 + 悬停暂停**：默认 `duration` 后自动消失，鼠标移入容器暂停计时、移出恢复。
- **可常驻**：`duration={0}` 表示不自动关闭，需用户手动关闭或代码 `close`。

与同族组件边界：Message 是单行轻量、居中顶部、无标题；Toast 概念在本库归并入 Notification 的 `top` 简化形态；带有"是否继续"语义的应交给 Modal.confirm。

典型场景：后台任务完成提示、新消息到达、带"撤销/查看详情"操作的反馈、错误堆栈摘要。

## 2. 设计语义

- **层级语义**：通知是顶层浮层（`z-index` 取 `--cd-z-index-notification`，高于内容与 Tooltip，低于 Modal 遮罩内的 Modal 体）。每个 `placement` 对应一个 `portal` 容器，挂载到 `document.body`。
- **状态语义（type）**：`default | success | info | warning | error`，分别映射图标与左侧/图标强调色（`--cd-color-success/info/warning/danger`）；`default` 无强调图标。`error` 复用 `--cd-color-danger` 语义（库内 danger == error 色板），保证危险反馈一致。
- **尺寸**：通知不提供 `small|default|large` 三档（卡片宽度固定语义），宽度由 `--cd-notification-width` 控制（默认 360px），内容超长自动换行；不参与全局 size 约定，此处刻意偏离以匹配 Semi 行为。
- **动画语义**：进入为 slide-in（左侧位置从左滑入、右侧从右滑入、纯 top/bottom 从对应边缘垂直滑入）+ fade；离开为 fade-out + collapse 高度；堆叠补位用 transform 过渡。`prefers-reduced-motion` 时降级为纯 opacity 渐变、无位移。
- **视觉结构**：图标区（可选）→ 主体（标题 title + 内容 content）→ 关闭按钮（右上）→ 操作区 footer（可选按钮组）。
- **RTL**：左右位置在 RTL 下镜像（`topRight` 视觉落到左上，slide 方向同步翻转），图标与关闭按钮逻辑端对齐。

## 3. 分层实现

属于有交互/键盘/计时/a11y 逻辑的组件，**需要 core 层**。

- **@chenzy-design/core · `createNotificationStore` / `createNotification`**
  - 维护全局单例 store：按 `placement` 分组的通知队列（`Map<placement, NotificationItem[]>`），`open/close/update/destroyAll` 命令式接口，返回唯一 `id`（`useId` 生成）。
  - 计时逻辑：每条通知独立 timer，暴露 `pause/resume`（供悬停）、`duration=0` 不启动。
  - 复用 core 原语：
    - `useId` — 生成通知 id 与 `aria-labelledby/-describedby` 关联 id。
    - `useLiveAnnouncer` — 将通知文本注入对应极性的 live region（status/alert），保证屏幕阅读器播报；命令式组件无固定 DOM 焦点，依赖 live region 而非焦点移动。
    - `useDismiss` — 处理可聚焦通知内 `Esc` 关闭（当通知含可交互操作并被聚焦时）。
    - `useReducedMotion`（封装媒体查询）— 决定动画降级。
  - 不使用 `useFocusTrap`（通知非模态，禁止抢占焦点）；不使用 `useScrollLock`（不锁滚动）。
- **@chenzy-design/svelte · `Notification`（渲染 + portal）**
  - 提供 `notification` 命名导出（命令式单例）与可选 `<NotificationProvider>`（用于设置全局默认 `placement/duration/getPopupContainer`、SSR/测试隔离）。
  - 渲染层订阅 store，按 placement 渲染 portal 容器与 `transition:`（自定义 slide/collapse），消费 Token 出样式。
  - 焦点管理：关闭按钮、footer 按钮可 Tab 进入；通过 `useRovingTabindex` 非必需（按钮天然可聚焦），但容器内 `Tab` 顺序遵循 DOM。

## 4. API

### Props（命令式 config 字段，亦为 `<Notification>` 受控渲染属性）

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `id` | `string` | 自动生成 | 通知唯一标识，传入相同 id 调用 `open` 等价于 `update` |
| `type` | `'default' \| 'success' \| 'info' \| 'warning' \| 'error'` | `'default'` | 通知类型，决定图标与强调色 |
| `title` | `string \| Snippet` | — | 标题，纯文本时用于 aria-labelledby |
| `content` | `string \| Snippet` | — | 正文内容 |
| `icon` | `Snippet \| false` | 按 type 推断 | 自定义图标；`false` 隐藏图标 |
| `duration` | `number` | `4.5`（秒） | 自动关闭延时；`0` 表示不自动关闭 |
| `placement` | `'topLeft' \| 'top' \| 'topRight' \| 'bottomLeft' \| 'bottom' \| 'bottomRight'` | `'topRight'` | 弹出位置 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `closeIcon` | `Snippet` | 内置 X | 自定义关闭图标 |
| `showProgress` | `boolean` | `false` | 是否显示剩余时间进度条 |
| `pauseOnHover` | `boolean` | `true` | 悬停时暂停计时 |
| `footer` | `Snippet` | — | 操作区（按钮组） |
| `width` | `string \| number` | `360` | 卡片宽度（覆盖 `--cd-notification-width`） |
| `theme` | `'light' \| 'dark'` | 跟随全局 | 卡片配色主题 |
| `className` | `string` | — | 根节点附加类名 |
| `style` | `string` | — | 根节点内联样式 |
| `getPopupContainer` | `() => HTMLElement` | `() => document.body` | 自定义挂载容器（局部通知） |
| `zIndex` | `number` | `--cd-z-index-notification` | 自定义层级 |
| `role` | `'status' \| 'alert'` | 按 type 推断 | 强制指定 live 极性 |

### Events / Callbacks（config 回调 + `<Notification>` 事件）

| 名称 | 载荷 | 说明 |
|---|---|---|
| `on:close` / `onClose` | `(id: string)` | 通知关闭后触发（自动或手动） |
| `on:click` / `onClick` | `(e: MouseEvent, id)` | 点击通知主体触发 |
| `on:openChange` | `{ open: boolean, id }` | 显隐变化（受控渲染模式下） |
| `on:durationEnd` | `(id: string)` | 计时结束触发关闭前回调 |
| `on:mouseenter` / `on:mouseleave` | `(id)` | 悬停暂停/恢复时触发 |

命令式返回：`notification.open(config) => string(id)`；`notification.close(id)`；`notification.update(id, config)`；`notification.destroyAll(placement?)`。

### Slots（Snippet）

| 名称 | 参数 | 说明 |
|---|---|---|
| `title` | — | 标题区自定义内容 |
| `content` | — | 正文自定义内容 |
| `icon` | `{ type }` | 自定义图标 |
| `footer` | `{ close }` | 操作区，注入 `close()` 便于按钮关闭 |
| `closeIcon` | — | 自定义关闭图标 |

## 5. 主题 / Token 表

组件仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 取值（引用 Alias/Global） | 用途 |
|---|---|---|
| `--cd-notification-width` | `360px` | 卡片宽度 |
| `--cd-notification-bg` | `var(--cd-color-bg-0)` | 卡片背景 |
| `--cd-notification-bg-dark` | `var(--cd-color-bg-3)` | 暗色主题背景 |
| `--cd-notification-color-title` | `var(--cd-color-text-0)` | 标题文字 |
| `--cd-notification-color-content` | `var(--cd-color-text-1)` | 正文文字 |
| `--cd-notification-border` | `var(--cd-color-border)` | 卡片描边 |
| `--cd-notification-radius` | `var(--cd-radius-large)` | 圆角 |
| `--cd-notification-shadow` | `var(--cd-shadow-elevated)` | 卡片投影 |
| `--cd-notification-padding` | `var(--cd-spacing-4)` | 内边距 |
| `--cd-notification-gap` | `var(--cd-spacing-3)` | 堆叠项间距 |
| `--cd-notification-icon-success` | `var(--cd-color-success)` | 成功图标色 |
| `--cd-notification-icon-info` | `var(--cd-color-info)` | 信息图标色 |
| `--cd-notification-icon-warning` | `var(--cd-color-warning)` | 警告图标色 |
| `--cd-notification-icon-error` | `var(--cd-color-danger)` | 错误图标色 |
| `--cd-notification-close-color` | `var(--cd-color-text-2)` | 关闭按钮默认色 |
| `--cd-notification-close-color-hover` | `var(--cd-color-text-0)` | 关闭按钮悬停色 |
| `--cd-notification-progress-bg` | `var(--cd-color-primary)` | 进度条颜色 |
| `--cd-notification-z-index` | `var(--cd-z-index-notification)` | 层级 |
| `--cd-notification-offset` | `var(--cd-spacing-6)` | 距视口边缘偏移 |
| `--cd-notification-enter-duration` | `var(--cd-motion-duration-mid)` | 进入动画时长 |
| `--cd-notification-leave-duration` | `var(--cd-motion-duration-fast)` | 离开动画时长 |

类名：`cd-notification`（容器项）、`cd-notification__icon`、`cd-notification__body`、`cd-notification__title`、`cd-notification__content`、`cd-notification__close`、`cd-notification__footer`、`cd-notification__progress`、`cd-notification-list`（按 placement 的堆叠容器）、修饰符 `cd-notification--success/info/warning/error`、`cd-notification--dark`、`cd-notification-list--topRight` 等。

## 6. 无障碍（WCAG 2.1 AA）

- **role / live region**：通知本身渲染为 `role="status"`（`default/success/info`）或 `role="alert"`（`warning/error`），分别对应 `aria-live="polite"` 与 `assertive`；可由 `role` prop 强制。容器（list）设 `aria-live` + `aria-relevant="additions text"`。通过 `useLiveAnnouncer` 保证内容被播报，不强制移动焦点。
- **关联**：卡片 `aria-labelledby` 指向 title id、`aria-describedby` 指向 content id（均由 `useId` 生成）。
- **关闭按钮**：`<button aria-label>`，文案来自 i18n key `Notification.closeText`；可 Tab 聚焦，Enter/Space 触发。
- **键盘交互**：
  - 通知非模态，**不抢占焦点**、不创建焦点陷阱。
  - 含可聚焦元素（footer 按钮/关闭）时，可经 `Tab` 进入；`Esc` 在焦点位于该通知内时关闭它（`useDismiss`）。
  - 提供可选全局快捷：聚焦最近通知（如 `F8`，遵循 APG live region 建议，默认关闭，由 Provider 开启）。
- **计时可达性**：自动关闭违反 WCAG 2.2.1（Timing Adjustable）风险——故 `pauseOnHover` 默认开，键盘聚焦进入通知亦暂停计时；建议重要操作类通知用 `duration={0}`。
- **对比度**：文字与背景、图标与背景满足 ≥4.5:1（正文）/≥3:1（图标与大字/UI 组件）；Token 经由通过 AA 校验的色板派生。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用 slide/collapse 位移，仅 opacity 过渡。
- **RTL**：`dir="rtl"` 下镜像位置与滑入方向，关闭按钮逻辑端对齐。

## 7. 国际化

用户可见文案零硬编码，经 i18n provider 注入：

| i18n key | 默认（zh-CN / en-US） | 用途 |
|---|---|---|
| `Notification.closeText` | 关闭 / Close | 关闭按钮 aria-label |
| `Notification.success` | 成功 / Success | success 图标的视觉隐藏前缀（屏幕阅读器） |
| `Notification.info` | 提示 / Info | info 同上 |
| `Notification.warning` | 警告 / Warning | warning 同上 |
| `Notification.error` | 错误 / Error | error 同上 |
| `Notification.notification` | 通知 / Notification | live region 区域标签 |

- 类型前缀（如"错误："）以视觉隐藏文本注入卡片首部，供屏幕阅读器先播报极性。
- 文案/数字若出现在 content 由调用方负责，但组件内的相对时间、计数等若由组件提供，须用 `Intl.RelativeTimeFormat` / `Intl.NumberFormat`，locale 跟随 provider。
- 文本方向跟随 i18n provider 的 `dir`。

## 8. 文案（content-guidelines）

- **标题**：名词短语，简洁、可省略句号，≤1 行；说明"发生了什么"。如"文件已上传"。
- **内容**：补充必要细节或后续动作，完整句、句末标点；避免与标题重复。
- **操作按钮**：动词开头、≤4 字，如"撤销""查看"。主操作至多 1 个。
- **类型用语**：success 报告完成、info 中性告知、warning 提醒潜在后果但非阻断。
- **避免**：技术堆栈/错误码直出（error 可折叠详情）、感叹号堆砌、第二人称指责语气。

**危险操作文案（单列）**：
- Notification **不承载需确认的破坏性操作**（删除/不可逆动作应走 Modal.confirm）。
- `error` 类通知仅用于"已发生的失败"事后告知，文案聚焦"出了什么问题 + 可恢复路径"，如标题"保存失败"、内容"网络中断，未保存的更改已暂存本地"、操作"重试"。
- 禁止在通知 footer 放置一键执行不可逆操作的按钮；若必须提供撤销，撤销应是"恢复"语义而非"再次删除"。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
|---|---|---|
| svelte 渲染层 gzip | ≤ 4.5 KB | 含 6 容器渲染、transition、portal |
| core 逻辑 gzip | ≤ 2.5 KB | store + 计时 + announcer + dismiss |
| 合计（含图标按需） | ≤ 7.5 KB | 默认图标 tree-shakable |
| 单条 open→可见 | < 16ms（1 帧） | 不触发整页 reflow，容器局部更新 |
| 堆叠补位动画 | 维持 60fps | 仅用 transform/opacity，避免 layout thrash |
| 最大并发通知 | 软上限默认 5/位置 | 超出时最旧自动出队（`maxCount` 可配） |

- **destroyOnClose**：离开动画结束后从 DOM 与 store 移除，不保留隐藏节点；`portal` 容器在该位置队列空时移除。
- **惰性**：portal 容器按需创建（首次该位置 open 时）；图标组件惰性导入。
- **虚拟化**：不需要——通过 `maxCount` 限流，通知数量天然有界。
- **计时**：单 timer/通知，悬停用 pause 记录剩余时间，避免重启误差；页面 `visibilitychange` 隐藏时可选暂停。

## 10. AI 元数据

提供 `component.meta.ts`，内容覆盖：
- `name: 'Notification'`、`category: 'feedback'`、`stage: 'M5'`、`semiEquivalent: 'Notification'`。
- `imperative: true`，导出方法签名（`open/success/info/warning/error/close/update/destroyAll`）及 `config` schema（映射第 4 节 Props）。
- `props/events/slots` 结构化描述（类型、默认值、枚举值、是否必填）。
- `tokens`：第 5 节 Component Token 清单及其 Alias 引用。
- `a11y`：role 映射规则（type→status/alert）、键盘表、live region 行为。
- `i18nKeys`：第 7 节 key 列表。
- `usageHints`：何时用 Notification vs Message vs Modal.confirm；破坏性操作禁用规则。
- `antiPatterns`：用于确认对话、抢占焦点、放置不可逆操作按钮。
- `examples`：基础、四类型、常驻 + 操作、自定义位置/容器。

## 11. 测试

- **单元（core）**：`createNotificationStore` 的 open/close/update/destroyAll、相同 id 去重更新、`maxCount` 出队、计时 pause/resume 剩余时间精度、`duration=0` 不计时、placement 分组队列正确性。
- **组件（svelte，Testing Library）**：渲染各 type 图标/强调色；点击关闭触发 `on:close`；悬停暂停、移出恢复；`closable=false` 无关闭按钮；footer Snippet 渲染与 `close()` 注入；`getPopupContainer` 挂载到指定容器。
- **a11y（jest-axe / axe-core）**：零违规；断言 `role=status/alert` 与 `aria-live` 极性匹配 type；`aria-labelledby/describedby` 正确关联；关闭按钮有 aria-label。
- **键盘**：`Esc` 关闭聚焦中的通知；`Tab` 可进入 footer/关闭按钮；非模态不陷阱焦点。
- **视觉/交互回归**：六位置堆叠快照、进入/离开/补位动画、RTL 镜像、reduced-motion 降级、dark 主题。
- **i18n**：切换 locale 关闭按钮 aria-label 与极性前缀文本更新；`dir=rtl` 镜像。
- **性能**：bundle size 断言（size-limit）；多条 open 不超 maxCount；无内存泄漏（close 后 timer 与 DOM 清理）。

## 12. 验收标准 checklist

- [ ] 命令式 API 完整：`open/success/info/warning/error/close/update/destroyAll`，`open` 返回 id，相同 id 触发 update。
- [ ] 六个 placement 各自独立堆叠，新增/移除有补位动画，`maxCount` 限流生效。
- [ ] 自动关闭按 `duration` 工作，`duration=0` 常驻；`pauseOnHover` 与键盘聚焦均暂停计时（满足 WCAG 2.2.1）。
- [ ] headless 逻辑位于 `@chenzy-design/core` 的 `createNotificationStore`，渲染位于 `@chenzy-design/svelte`，复用 `useId/useLiveAnnouncer/useDismiss/useReducedMotion`。
- [ ] a11y：type→`role`/`aria-live` 极性映射正确，`aria-labelledby/describedby` 关联，关闭按钮有 i18n aria-label，jest-axe 零违规，非模态不抢焦点。
- [ ] reduced-motion 降级、RTL 镜像、dark 主题均正确。
- [ ] 所有可见文案走 i18n（key 形如 `Notification.*`），无硬编码；相对时间/数字用 Intl。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸；类名遵循 `cd-notification` BEM。
- [ ] 破坏性操作不进入 Notification；`error` 仅事后告知，footer 无一键不可逆操作。
- [ ] destroyOnClose 生效，portal 按需创建/销毁，无内存泄漏。
- [ ] Perf Budget 达标（svelte ≤4.5KB / core ≤2.5KB gzip），open→可见 <1 帧。
- [ ] 提供 `component.meta.ts`，含 props/events/slots/tokens/a11y/i18nKeys/usageHints/antiPatterns/examples。
