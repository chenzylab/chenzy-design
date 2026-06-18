# SPEC · Banner
> 分类：feedback · 阶段：M5
> 对标 Semi：Banner

## 1. 概述

Banner 是页面级/区块级的横幅通知组件，用于在内容流的顶部或局部容器内持续展示一条具有特定语义（信息、成功、警告、危险）的提示信息。与 `Toast`（短暂、漂浮、自动消失）和 `Notification`（角标、可堆叠）不同，Banner 是**内嵌在文档流中、需要用户主动关注甚至主动关闭**的常驻反馈，适合表达「当前页面/模块的全局状态」，例如系统维护公告、表单提交结果、订阅过期提醒、降级提示等。

核心能力：
- 四种语义类型：`info | success | warning | danger`。
- 两种视觉密度：`full`（铺满，强调，常用于页面顶部）与 `card`（卡片，圆角带边框，常用于区块内）。
- 可关闭（`closable`）：右侧关闭按钮，关闭走 `open + on:openChange` 受控/非受控两种模式。
- 标题 + 描述双层文案，左侧语义图标，可自定义图标，支持尾部操作区（按钮/链接）。
- 关闭过渡动画，支持 `reduced-motion` 降级。

非目标：不负责自动消失（那是 Toast）、不负责堆叠管理（那是 Notification）。

## 2. 设计语义

- **类型语义颜色**：每种 `type` 绑定一套 Alias 色板——`info` 用 `--cd-color-primary` 系，`success` 用成功色系，`warning` 用 `--cd-color-warning` 系，`danger` 用 `--cd-color-danger` 系。背景为低饱和浅底（light tint），左侧图标与边框（card 模式）取强调色，文本始终用 `--cd-color-text-0` 保证对比度，不依赖颜色单独传达语义（图标 + 文案双通道）。
- **密度 / 形态**：
  - `full`：无圆角、无外边框、左侧可选 4px 强调色竖条（accent bar），水平内边距对齐页面栅格，视觉权重最高。
  - `card`：圆角 `--cd-banner-radius`、1px 边框 `--cd-color-border` 叠加类型色调，可嵌入卡片/表单内部。
- **布局结构**：`[图标] [标题/描述堆叠] [操作区] [关闭按钮]`，单行短文案时图标与文字垂直居中；多行（含描述）时图标顶对齐第一行。
- **层级与节奏**：标题用 `--cd-font-weight-bold` + `--cd-banner-title-size`，描述用常规字重 + 次级行高，二者间距 `--cd-spacing-1`。
- **状态变化**：仅有「显示 / 关闭」两态，关闭时高度收拢 + 透明度淡出（`--cd-motion-duration-fast`）。
- **暗色主题**：所有色值经 Alias 自动映射，浅底改为对应暗色 tint，保证 AA 对比度。

## 3. 分层实现

Banner 含「关闭交互 + 关闭动画 + a11y 公告」逻辑，因此采用 core + svelte 分层（逻辑较轻，core 仅封装受控状态与可访问性，不强依赖 focus trap）。

**@chenzy-design/core · `createBanner(config)`**
- 维护 `open` 受控/非受控状态机，暴露 `getRootProps()`（注入 `role`、`aria-live`）、`getCloseButtonProps()`（注入 `aria-label`、`type=button`、`onClick`）。
- 复用原语：
  - `useId`：为 title/description 生成 id，供 `aria-labelledby`/`aria-describedby` 关联。
  - `useLiveAnnouncer`（仅 `danger`/`warning` 且动态插入时）：以 `assertive`/`polite` 向 AT 播报。
  - `useDismiss`（可选）：当 `closeOnEsc` 开启时监听 Esc 触发关闭（默认关闭，避免误触全局键）。
- 不使用 `useFocusTrap`/`useScrollLock`/`useRovingTabindex`/`useScrollLock`——Banner 非模态、不夺焦、不锁滚。
- 纯函数、框架无关，输出 props 对象与 `setOpen` 方法。

**@chenzy-design/svelte · `Banner.svelte`**
- 消费 `createBanner`，负责渲染语义图标（按 `type` 默认映射，可被 `icon` slot 覆盖）、过渡（`svelte/transition` 的 `slide`+`fade`，`prefers-reduced-motion` 时退化为瞬时移除）、`destroyOnClose` 时关闭后从 DOM 卸载。
- 透传 `class`/`style`，类名遵循 `cd-banner` BEM。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | 语义类型，决定配色与默认图标 |
| `fullMode` | `boolean` | `true` | `true` 为 full 铺满模式，`false` 为 card 卡片模式 |
| `bordered` | `boolean` | `false` | card 模式下是否显示边框（full 模式忽略） |
| `title` | `string` | `''` | 标题文案；为空时仅渲染描述 |
| `description` | `string` | `''` | 描述文案；与 title 可单独或同时使用 |
| `open` | `boolean` | `true` | 受控显隐；与 `on:openChange` 配合 |
| `defaultOpen` | `boolean` | `true` | 非受控初始显隐 |
| `closable` | `boolean` | `true` | 是否显示右侧关闭按钮 |
| `closeIcon` | `Snippet \| boolean` | `true` | 自定义关闭图标，`false` 等价于 `closable=false` |
| `icon` | `Snippet \| boolean` | `true` | 自定义左侧图标，`false` 隐藏图标 |
| `closeOnEsc` | `boolean` | `false` | 是否允许按 Esc 关闭 |
| `destroyOnClose` | `boolean` | `false` | 关闭后是否从 DOM 卸载（释放 slot 内重型内容） |
| `animation` | `boolean` | `true` | 是否启用关闭过渡（受 reduced-motion 覆盖） |
| `class` | `string` | `''` | 根节点附加类名 |
| `style` | `string` | `''` | 根节点内联样式 |

> 注：Banner 形态由 `fullMode` 区分而非通用 `size`；无校验态 `status`（语义由 `type` 表达），符合本组件实际。

### Events

| 事件 | 载荷 (detail) | 触发时机 |
|---|---|---|
| `on:openChange` | `{ open: boolean }` | 显隐状态变化时（点击关闭、Esc、外部受控变更）；受控模式下需据此回写 `open` |
| `on:close` | `{ trigger: 'closeButton' \| 'esc' }` | 用户主动触发关闭的语义事件，便于埋点与文案差异化 |
| `on:afterClose` | `void` | 关闭过渡结束后触发；`destroyOnClose` 卸载发生在此之后 |

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| `default` | — | 描述区主体内容，优先级高于 `description` prop，可放富文本/链接 |
| `title` | — | 自定义标题区，覆盖 `title` prop |
| `icon` | `{ type }` | 自定义左侧图标，参数透出当前类型 |
| `action` | `{ close }` | 尾部操作区（按钮/链接），`close` 为关闭方法供操作触发关闭 |
| `closeIcon` | — | 自定义关闭按钮内的图标 |

## 5. 主题 / Token 表

组件仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 引用 Alias / 计算 | 用途 |
|---|---|---|
| `--cd-banner-radius` | `--cd-radius-md` | card 模式圆角 |
| `--cd-banner-padding-y` | `--cd-spacing-3` | 垂直内边距 |
| `--cd-banner-padding-x` | `--cd-spacing-4` | 水平内边距 |
| `--cd-banner-gap` | `--cd-spacing-3` | 图标/内容/操作区间距 |
| `--cd-banner-icon-size` | `--cd-size-icon-md` | 左侧语义图标尺寸 |
| `--cd-banner-title-color` | `--cd-color-text-0` | 标题文本色 |
| `--cd-banner-desc-color` | `--cd-color-text-1` | 描述文本色 |
| `--cd-banner-title-size` | `--cd-font-size-2` | 标题字号 |
| `--cd-banner-desc-size` | `--cd-font-size-1` | 描述字号 |
| `--cd-banner-accent-width` | `2px`（取自 `--cd-border-width-lg`） | full 模式左侧强调竖条宽度 |
| `--cd-banner-info-bg` | `--cd-color-primary-light-default` | info 背景 tint |
| `--cd-banner-info-accent` | `--cd-color-primary` | info 图标/竖条/边框色 |
| `--cd-banner-success-bg` | `--cd-color-success-light-default` | success 背景 tint |
| `--cd-banner-success-accent` | `--cd-color-success` | success 强调色 |
| `--cd-banner-warning-bg` | `--cd-color-warning-light-default` | warning 背景 tint |
| `--cd-banner-warning-accent` | `--cd-color-warning` | warning 强调色 |
| `--cd-banner-danger-bg` | `--cd-color-danger-light-default` | danger 背景 tint |
| `--cd-banner-danger-accent` | `--cd-color-danger` | danger 强调色 |
| `--cd-banner-close-color` | `--cd-color-text-2` | 关闭图标默认色 |
| `--cd-banner-close-hover-bg` | `--cd-color-fill-1` | 关闭按钮 hover 底色 |
| `--cd-banner-motion-duration` | `--cd-motion-duration-fast` | 关闭过渡时长 |

类名约定：根 `cd-banner`，修饰 `cd-banner--info/--success/--warning/--danger`、`cd-banner--full`、`cd-banner--card`、`cd-banner--bordered`；元素 `cd-banner__icon`、`cd-banner__content`、`cd-banner__title`、`cd-banner__description`、`cd-banner__action`、`cd-banner__close`。

## 6. 无障碍 (WCAG 2.1 AA)

- **role / aria**：
  - 根节点 `role="alert"`（`danger`/`warning`）或 `role="status"`（`info`/`success`），分别对应 `aria-live="assertive"` / `aria-live="polite"`。当 Banner 为静态首屏内容（非动态插入）时降为 `role="region"` + `aria-label` 以避免无意义播报（由 `live` prop 内部根据是否动态挂载判断）。
  - 标题节点 id 关联根节点 `aria-labelledby`；描述节点 id 关联 `aria-describedby`。
  - 关闭按钮 `<button type="button">` 带 `aria-label`（i18n `Banner.closeButtonAriaLabel`）。
- **键盘交互**：
  - 关闭按钮可 Tab 聚焦，`Enter`/`Space` 触发关闭。
  - `closeOnEsc=true` 时，焦点在 Banner 内部按 `Esc` 关闭（默认关闭，避免与全局 Esc 冲突）。
  - 操作区按钮遵循各自原生 tab 顺序，DOM 顺序：内容 → 操作区 → 关闭按钮。
- **焦点管理**：非模态，挂载时不抢焦；关闭后若焦点位于关闭按钮上，将焦点回退至根节点的前一个可聚焦元素或 `document.body`（避免焦点丢失），`destroyOnClose` 同此处理。
- **对比度**：所有 tint 背景上的标题/描述/图标对比度 ≥ 4.5:1（图标作为非文本指示 ≥ 3:1）；不以颜色为唯一语义通道（图标形状区分）。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用 slide/fade，直接显示/移除。
- **RTL**：`[dir="rtl"]` 下图标与关闭按钮左右镜像，padding 使用逻辑属性（`padding-inline`），accent bar 移至右侧。

## 7. 国际化

- 用户可见文案零硬编码，全部走 i18n。
- i18n keys：

| key | 默认 (zh-CN) | 说明 |
|---|---|---|
| `Banner.closeButtonAriaLabel` | `关闭` | 关闭按钮无障碍标签 |
| `Banner.info` | `提示` | info 类型默认 role 语义前缀（供 AT 朗读，可选） |
| `Banner.success` | `成功` | success 语义前缀 |
| `Banner.warning` | `警告` | warning 语义前缀 |
| `Banner.danger` | `错误` | danger 语义前缀 |

- 业务传入的 `title`/`description`/slot 内容由调用方负责 i18n，组件不内置。
- 日期/数字若出现在描述中由调用方用 `Intl.DateTimeFormat`/`Intl.NumberFormat` 格式化；组件不直接处理。
- 文案随 locale 变化时，依赖外部 i18n provider 的响应式 store，组件订阅当前 locale 重渲染。

## 8. 文案

遵循 content-guidelines：
- 标题简短、动词或名词短语，句首大写（西文），中文不加句号；描述给出原因与下一步动作。
- 类型与语气匹配：`info` 中性陈述、`success` 肯定、`warning` 提示可能后果、`danger` 明确问题并给修复路径。
- 操作区文案用明确动词（「重试」「查看详情」「立即续费」），避免「点击这里」。
- 避免技术黑话与堆叠感叹号。

**危险操作文案（单列）**：
- `danger` 类型用于不可逆/阻断性问题（如「支付失败」「数据将于 7 天后删除」）。文案须：说明发生了什么 → 影响范围 → 用户可执行的恢复动作。例：标题「订阅已过期」，描述「高级功能已停用，续费后立即恢复。」，操作「立即续费」。
- 关闭按钮不可承担确认/取消等破坏性语义；关闭仅表示「忽略此横幅」，不得用于「确认删除」之类操作。

## 9. 性能 (Perf Budget)

| 指标 | 预算 | 说明 |
|---|---|---|
| core `createBanner` gzip | ≤ 1.2 KB | 仅状态机 + props 生成 + useId |
| svelte `Banner` gzip | ≤ 2.5 KB | 含 4 套默认图标（按需 tree-shake）+ 过渡 |
| 默认图标单个 gzip | ≤ 0.3 KB | SVG，未使用类型可被摇树 |
| 首次渲染 | < 1ms | 静态结构，无布局抖动 |
| 关闭过渡 | 1 帧内启动，时长 = `--cd-motion-duration-fast`（~150ms） | slide+fade，GPU 合成（transform/opacity） |

- 多个 Banner 同时存在属低频场景，**不需要虚拟化**。
- `destroyOnClose` 用于 slot 内含重型内容（图表/图片）的场景，关闭后卸载释放内存；默认 `false` 保留 DOM 以便重新展开。
- 惰性渲染：`open=false` 且 `destroyOnClose=true` 时不渲染子树；图标按 `type` 惰性引用。
- 过渡仅动画 `transform`/`opacity`/`height`，避免触发重排的属性。

## 10. AI 元数据

提供 `component.meta.ts`（`Banner.meta.ts`），内容包含：
- `name: 'Banner'`、`category: 'feedback'`、`stage: 'M5'`、`semiEquivalent: 'Banner'`。
- `description`：一句话用途；`whenToUse` / `whenNotToUse`（vs Toast / Notification / Alert 辨析）。
- `props`/`events`/`slots` 的结构化描述（类型、默认值、枚举、是否受控），与本 SPEC 第 4 节同源。
- `tokens`：消费的 Component/Alias token 列表（同第 5 节）。
- `a11y`：role 映射规则、键盘表、`live` 推断逻辑。
- `i18nKeys`：第 7 节 key 列表。
- `examples`：常见用法片段（页面顶 full info、表单内 card danger 带操作、可关闭受控）。
- 供 AI 代码生成与文档站消费，构建期校验与 SPEC 一致。

## 11. 测试

- **单元（core）**：`createBanner` 受控/非受控状态切换；`setOpen` 触发回调；`closeOnEsc` 开关；`live`/`role` 推断（动态 vs 静态、type → assertive/polite）；useId 关联正确。
- **组件渲染（svelte，@testing-library/svelte）**：四种 `type` 渲染正确图标与类名；`fullMode`/`card`/`bordered` 修饰类；`closable=false` 不渲染关闭按钮；slot 覆盖 prop 优先级；`destroyOnClose` 关闭后 DOM 卸载。
- **交互**：点击关闭触发 `openChange`/`close`/`afterClose` 顺序正确；Enter/Space 关闭；Esc 在开关下行为；操作区 `close` 回调可关闭。
- **a11y（vitest-axe / jest-axe）**：无 axe 违规；`role`/`aria-live`/`aria-labelledby`/`aria-describedby`/关闭按钮 `aria-label` 断言；焦点回退验证。
- **视觉回归（Storybook + Chromatic/Playwright）**：四类型 × full/card × 亮/暗 × LTR/RTL 快照；reduced-motion 快照。
- **i18n**：切换 locale 后关闭按钮 `aria-label` 与语义前缀更新。

## 12. 验收标准 Checklist

- [ ] 四种 `type` 均正确映射配色、默认图标、role/aria-live 语义。
- [ ] `fullMode` / card / `bordered` 三种形态视觉符合设计稿，仅消费 Alias/Component token，无写死色值。
- [ ] `open + on:openChange` 受控、`defaultOpen` 非受控两路径均工作。
- [ ] `closable`/`closeIcon=false` 正确隐藏关闭按钮；关闭触发 `openChange`、`close`、`afterClose` 三事件且顺序正确。
- [ ] `closeOnEsc` 默认关闭，开启后仅在焦点位于 Banner 内生效。
- [ ] `destroyOnClose` 关闭后卸载子树，重型 slot 内容内存释放。
- [ ] 全部用户可见文案走 i18n，无硬编码；切换 locale 即时更新。
- [ ] 通过 axe 零违规；键盘可完整操作；关闭后焦点不丢失。
- [ ] `prefers-reduced-motion` 降级为无动画；RTL 镜像正确（逻辑属性 + accent bar 换边）。
- [ ] 暗色主题对比度 ≥ AA。
- [ ] gzip 体积满足 Perf Budget；未用类型图标可摇树。
- [ ] 提供 `Banner.meta.ts` 且字段与本 SPEC 一致，构建期校验通过。
- [ ] 单元/组件/交互/a11y/视觉回归/i18n 测试全部通过，覆盖率达标。
