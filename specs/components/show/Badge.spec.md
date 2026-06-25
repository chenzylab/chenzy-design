# SPEC · Badge
> 分类：show · 阶段：M4
> 对标 Semi：Badge

## 1. 概述

Badge（徽标）用于在宿主元素（图标、头像、按钮等）的角标位置展示状态提示：未读数字、红点（dot）、或自定义内容。典型场景包括消息计数、未读提醒、新功能标记、状态点。

核心能力：
- **数字徽标**：展示 `count` 数值；超过 `overflowCount` 时显示溢出格式（如 `99+`）。
- **红点（dot）**：不展示具体数值，仅以小圆点表示存在未读/新状态。
- **状态点（status dot）**：独立的语义状态指示器（success/processing/error/warning/default），可附带文本，不依赖宿主子元素。
- **自定义内容**：通过 slot 或 `count` 传入任意节点。
- **定位**：相对宿主元素四角定位（默认右上），支持像素级 `offset` 偏移。
- **count=0 控制**：通过 `showZero` 决定 count 为 0 时是否仍显示。

Badge 本质是纯展示组件 + 受控宿主包裹，无键盘交互、无浮层，因此**不需要 core headless 逻辑**，仅需 `useId`/`useLiveAnnouncer` 用于无障碍读屏。

非目标：Badge 不负责轮播未读列表、不提供点击行为（点击交给宿主元素自行处理）。

## 2. 设计语义

- **角标定位**：徽标绝对定位于宿主包裹盒（`position: relative` 的 `cd-badge`）四角，默认 `top-right`。`offset=[x, y]` 在该锚点基础上做平移（正值向右/下）。
- **数字徽标**：圆角胶囊（pill），高度 `--cd-badge-height`（默认 20px），单数字时为正圆，多数字横向 padding 扩展。背景默认 `--cd-color-danger`，文字 `--cd-color-white`。
- **dot 红点**：直径 `--cd-badge-dot-size`（默认 6px），无文字，纯圆点。
- **status 点**：直径同 dot，颜色由 `type` 映射语义色；`processing` 类型附带呼吸涟漪动画（`reduced-motion` 下静止）。
- **溢出**：`count > overflowCount` 时渲染 `${overflowCount}+`。
- **theme 变体**：`solid`（实心，默认）/ `light`（浅色背景 + 深色文字），用于不同对比度场景。
- **尺寸**：`small | default`（Badge 无 large；与全局尺寸约定对齐，数字徽标尺寸通过 token 区分）。
- **隐藏**：count=0 且 `showZero=false`、或 dot 模式 `dot=false` 时不渲染徽标节点（仅渲染宿主）。
- **进出动画**：徽标出现/消失使用缩放 + 透明度过渡（`--cd-badge-motion-duration`），`reduced-motion` 下取消缩放仅保留即时显隐。

## 3. 分层实现

Badge 为**纯展示组件**，无交互逻辑，**省略 @chenzy-design/core 的 createBadge**。

- **@chenzy-design/svelte**：`Badge.svelte` 全部实现（定位计算、溢出格式化、显隐判断、status 渲染）。
- 复用 core 原语（轻量）：
  - `useId`：为徽标节点生成 id，供宿主 `aria-describedby` 关联。
  - `useLiveAnnouncer`（可选，`announce` prop 开启时）：当 `count` 变化时向 `aria-live=polite` 区播报新计数，供动态未读消息场景。
- 定位/溢出/显隐均为纯函数（可内联，无状态机），不引入 roving/focus-trap/dismiss/scroll-lock 等。
- SSR 安全：不读取 DOM 尺寸，定位纯 CSS 绝对定位 + token，无客户端测量，首屏无闪烁。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| count | `number \| string \| Snippet` | — | 徽标内容；数字时受 `overflowCount`/`showZero` 控制 |
| dot | `boolean` | `false` | 红点模式，忽略 `count` 内容只显示圆点 |
| overflowCount | `number` | `99` | 数字溢出阈值，超过显示 `${overflowCount}+` |
| showZero | `boolean` | `false` | `count` 为 0 时是否仍显示徽标 |
| type | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | `'danger'` | 徽标/状态点语义色 |
| theme | `'solid' \| 'light'` | `'solid'` | 实心 / 浅色变体 |
| position | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | 角标锚点 |
| offset | `[number, number]` | `[0, 0]` | 在锚点基础上的 `[x, y]` 像素偏移 |
| size | `'small' \| 'default'` | `'default'` | 徽标尺寸 |
| status | `'default' \| 'success' \| 'processing' \| 'error' \| 'warning'` | — | 独立状态点模式（不依赖子元素）；设置后渲染 status 点 |
| text | `string` | — | `status` 模式下状态点右侧文本 |
| announce | `boolean` | `false` | 是否在 `count` 变化时向读屏播报 |
| countAriaLabel | `string` | — | 覆盖默认数字徽标的无障碍标签 |
| class | `string` | — | 透传到根节点的自定义类名 |
| style | `string` | — | 透传内联样式 |

> 注：Badge 无受控显隐与受控输入，故不涉及 `value`/`on:change`/`open`/`on:openChange`。显隐由 `count`/`dot`/`showZero` 派生。

### Events

| 名称 | 载荷 (detail) | 说明 |
|---|---|---|
| countChange | `{ count: number, overflowed: boolean }` | `count` 解析为数字且变化时派发（含是否溢出标记），便于外部统计/动画钩子 |

> 点击行为不由 Badge 提供；宿主元素自行绑定 `on:click`。

### Slots

| 名称 | props | 说明 |
|---|---|---|
| default | — | 宿主子元素（被包裹的图标/头像/按钮等）；`status` 模式下可省略 |
| count | `{ count, overflowed }` | 自定义徽标内容，覆盖 `count`/`dot` 的默认渲染 |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 取值（默认引用） | 说明 |
|---|---|---|
| `--cd-badge-height` | `20px` | 数字徽标高度（default 尺寸） |
| `--cd-badge-height-small` | `16px` | small 尺寸高度 |
| `--cd-badge-padding-x` | `6px` | 多字符横向内边距 |
| `--cd-badge-font-size` | `12px` | 数字字号 |
| `--cd-badge-dot-size` | `6px` | 红点 / status 点直径 |
| `--cd-badge-radius` | `999px` | 胶囊圆角 |
| `--cd-badge-color-bg` | `var(--cd-color-danger)` | 徽标背景（默认 danger） |
| `--cd-badge-color-text` | `var(--cd-color-white)` | 徽标文字 |
| `--cd-badge-color-bg-light` | `var(--cd-color-danger-light-default)` | light 变体背景 |
| `--cd-badge-color-text-light` | `var(--cd-color-danger)` | light 变体文字 |
| `--cd-badge-border-color` | `var(--cd-color-bg-0)` | 描边色（与宿主背景同色，制造分离感） |
| `--cd-badge-border-width` | `1px` | 徽标外描边宽度 |
| `--cd-badge-status-color-success` | `var(--cd-color-success)` | status=success 颜色 |
| `--cd-badge-status-color-processing` | `var(--cd-color-primary)` | status=processing 颜色 |
| `--cd-badge-status-color-error` | `var(--cd-color-danger)` | status=error 颜色 |
| `--cd-badge-status-color-warning` | `var(--cd-color-warning)` | status=warning 颜色 |
| `--cd-badge-status-color-default` | `var(--cd-color-text-2)` | status=default 颜色 |
| `--cd-badge-status-text-color` | `var(--cd-color-text-0)` | status 文本颜色 |
| `--cd-badge-motion-duration` | `var(--cd-motion-duration-fast, 200ms)` | 显隐/缩放过渡时长 |

- `type` 通过映射切换 `--cd-badge-color-bg`/`--cd-badge-color-text`（如 `type=primary` → `--cd-color-primary`）。
- 暗色模式：所有色值经 Alias 自动切换，组件不需额外适配。
- 对比度：solid 徽标文字与背景须满足 AA（≥4.5:1），数字字号 12px 视为普通文本而非大文本，danger/white 组合需在 token 层校验。

## 6. 无障碍（WCAG 2.1 AA）

参考 WAI-ARIA：Badge 非交互，归类为状态文本。

- **数字徽标**：徽标节点 `aria-hidden` 不设；改为给宿主关联 `aria-describedby={badgeId}`，徽标自身提供可读文本（如 `5 条未读消息`），由 `countAriaLabel` / i18n 生成。纯视觉的 `99+` 应同时提供精确语义文本（`超过 99 条`）。
- **dot 红点**：无数值语义，徽标节点 `aria-hidden="true"`，由宿主 `aria-label` 自行表达（如「消息（有未读）」），Badge 提供 `dotAriaLabel`（经 i18n）可选挂到宿主 `aria-describedby`。
- **status 点**：渲染为 `<span role="status">` 或普通文本；点本体 `aria-hidden="true"`，语义由 `text` 文本承担；无 `text` 时用 `aria-label`（i18n 映射 status → 文案）。
- **动态计数（announce=true）**：通过 `useLiveAnnouncer` 写入 `aria-live="polite"` 区域，避免频繁打断（节流，仅播报最终值）。
- **焦点**：Badge 不可聚焦、不进入 Tab 序；焦点完全归宿主元素。
- **对比度**：solid 文字/背景满足 4.5:1；status 点作为非文本图形需满足 3:1（与相邻背景）。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用 `processing` 涟漪动画与缩放进出过渡，改为即时显隐。
- **RTL**：`position` 的 `left/right` 与 `offset.x` 在 `[dir=rtl]` 下镜像（top-right → top-left 视觉），逻辑用 `inset-inline-*`。

## 7. 国际化

用户可见文案零硬编码，全部经 i18n。数字格式化使用 `Intl.NumberFormat`（按 locale 处理千分位/数字系统），溢出符号 `+` 通过模板组合。

| i18n key | 默认（zh-CN） | 说明 |
|---|---|---|
| `Badge.unreadCount` | `{count} 条未读` | 数字徽标无障碍文本（`count` 用 Intl 格式化） |
| `Badge.overflowCount` | `超过 {max} 条` | 溢出时精确语义文本 |
| `Badge.dot` | `有新内容` | dot 模式无障碍文本 |
| `Badge.status.success` | `成功` | status=success 默认标签 |
| `Badge.status.processing` | `进行中` | status=processing 默认标签 |
| `Badge.status.error` | `错误` | status=error 默认标签 |
| `Badge.status.warning` | `警告` | status=warning 默认标签 |
| `Badge.status.default` | `默认` | status=default 默认标签 |

- 溢出展示文本 `99+`：数字部分经 `Intl.NumberFormat(locale).format(overflowCount)`，`+` 由模板拼接（保证 RTL 下符号位置正确）。
- `text` prop 为业务侧传入，不在库 i18n 范围，但库默认 status 标签提供完整 key。

## 8. 文案

遵循 content-guidelines：

- 计数文本简洁，仅数字，无单位后缀（单位放宿主语境）。
- 无障碍文本完整可读：`5 条未读`、`超过 99 条`，避免读屏只读出孤立数字「5」。
- status 文本用名词/形容词短语，首字母/句首语气统一，不加句号。
- 溢出阈值文案统一为 `{max}+`，不混用 `99+` / `>99`。

**危险操作文案**：Badge 为只读展示，**不涉及危险操作**，无破坏性确认文案。若 `type=danger` 仅表示视觉强调（如错误计数），不得让其文案产生「点击即删除」等误导。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
|---|---|---|
| gzip 体积（svelte，单组件） | ≤ 2.5 KB | 纯展示，无状态机/无 core 依赖 |
| 共享 core 增量 | ~0（仅 `useId`，可选 `useLiveAnnouncer`） | announce 关闭时不引入 announcer |
| 首次渲染 | < 0.3ms / 实例 | 纯 CSS 定位，无 DOM 测量 |
| count 更新 | 单 text 节点更新，O(1) | 仅徽标文本变化，宿主不重渲染 |
| 列表场景（如 100 项带 Badge） | 无虚拟化需求（宿主列表负责） | Badge 自身极轻 |

- **不需要虚拟化**：单实例 DOM 极小（1-2 节点）。
- **惰性渲染**：count=0 且 `!showZero`、`!dot` 时不渲染徽标节点（条件 `{#if}`），降低 DOM 数量。
- **destroyOnClose**：不适用（无浮层）。
- 溢出格式化为纯函数，按 `count`/`overflowCount` 派生（`$derived`），无副作用。
- 动画用 CSS transform/opacity（合成层），不触发 layout。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：

- `name: 'Badge'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Badge'`。
- `tags: ['徽标', '红点', '计数', '未读', 'overflow', 'status']`。
- `props` schema（类型、默认值、枚举、是否 i18n 相关）镜像第 4 节。
- `slots`/`events` 描述。
- `a11yNotes`：非交互、宿主 `aria-describedby` 关联、status role。
- `usageHints`：「用于宿主右上角计数」「dot 适合无需精确数字的提醒」「status 用于独立状态指示」。
- `antiPatterns`：「不要把可点击逻辑放进 Badge」「不要用 Badge 做 Tag/标签（用 Tag）」「count 极大时改用文本」。
- `relatedComponents: ['Tag', 'Avatar', 'Tooltip']`。

## 11. 测试

- **单元（vitest）**：
  - `count > overflowCount` 渲染 `${overflowCount}+`；边界 `count === overflowCount` 不溢出。
  - `count=0` 且 `showZero=false` 不渲染徽标；`showZero=true` 渲染 `0`。
  - `dot=true` 仅渲染圆点、无文本。
  - `type`/`theme` 映射正确的 token class。
  - `position`/`offset` 生成正确的定位样式。
  - 溢出格式化纯函数随 `Intl` locale 变化。
- **a11y（vitest-axe / testing-library）**：
  - dot 徽标节点 `aria-hidden="true"`。
  - 数字徽标无障碍文本经 i18n 输出完整句（非孤立数字）。
  - status 模式 `role="status"` 且有可读标签。
  - axe 零违规。
- **交互/动态**：`announce=true` 时 count 变化触发 live region 更新（节流断言）。
- **视觉回归（playwright/storybook）**：四角定位、small/default、solid/light、status 各类型、processing 动画、reduced-motion 静止态、RTL 镜像、暗色模式快照。
- **SSR**：服务端渲染输出与客户端 hydrate 一致，无定位闪烁。

## 12. 验收标准 checklist

- [ ] Props/Events/Slots 与第 4 节一致，类型导出完整（含 `Snippet` 类型）。
- [ ] count 溢出、showZero、dot、status 五类显隐分支行为正确，边界值覆盖。
- [ ] 仅消费 `--cd-` Alias/Component token，无写死颜色/尺寸（lint 校验通过）。
- [ ] 类名遵循 `cd-badge` / `cd-badge__*` / `cd-badge--*` BEM 约定。
- [ ] 不引入 core headless（纯展示），仅按需 `useId`/`useLiveAnnouncer`。
- [ ] a11y：dot `aria-hidden`、数字徽标完整可读文本、status `role="status"`、宿主 `aria-describedby` 关联，axe 零违规。
- [ ] 所有可见文案经 i18n（key 同第 7 节），数字用 `Intl.NumberFormat`。
- [ ] reduced-motion 关闭 processing 动画与缩放过渡；RTL 镜像定位正确；暗色模式自动适配。
- [ ] Perf：gzip ≤ 2.5KB；count=0/!showZero 不渲染徽标节点；count 更新 O(1)。
- [ ] 提供 `component.meta.ts`，字段完整（props/slots/events/a11y/usageHints/antiPatterns）。
- [ ] 单元 + a11y + 视觉回归 + SSR 测试齐全且通过。
- [ ] 无受控显隐误用（不出现 `open`/`value` 等不适用 API）。
