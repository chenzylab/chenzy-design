# SPEC · SideSheet
> 分类：feedback · 阶段：M5
> 对标 Semi：SideSheet

## 1. 概述

SideSheet（侧边滑出面板）是一种从视口边缘（左/右/上/下）滑入的浮层容器，用于承载次要任务流、详情展示、表单填写或上下文操作，在不完全打断主流程的前提下提供更大的内容承载空间。

- **典型场景**：实体详情查看与编辑、筛选/高级搜索面板、购物车、通知中心、多步配置向导。
- **与 Modal 的区别**：Modal 居中聚焦于单一确认/决策动作，体量受限；SideSheet 贴边、可承载更多滚动内容，且支持非模态（`mask=false`）的"协作式"形态，允许用户在面板打开时继续与主页面交互。
- **与 Drawer 的关系**：本库不再单独提供 Drawer，SideSheet 即对标社区 Drawer + Semi SideSheet 的能力合集，统一为单一组件。
- **形态特征**：贴附 `placement` 边缘、占据该轴向的全尺寸（高度或宽度 100%），另一轴向由 `width`/`height` 控制。
- **浮层 a11y 与 Modal 同构**：复用同一套 focus trap / dismiss / scroll lock / live announcer 原语，行为一致，便于用户形成稳定心智模型。

## 2. 设计语义

- **层级与定位**：固定贴边（`position: fixed`），沿 `placement` 指向的边缘铺满该轴；圆角仅在朝向内容区的一侧（如 `placement=right` 时左上/左下圆角，受 `--cd-sidesheet-radius` 控制，可为 0 表示直角贴边）。
- **进出动效**：沿垂直于贴边方向的 `transform: translate` 位移 + `opacity`，时长 `--cd-sidesheet-motion-duration`（默认 250ms）、缓动 `--cd-sidesheet-motion-easing`（decelerate 进、accelerate 出）。遮罩同步淡入淡出。`prefers-reduced-motion` 下退化为仅 `opacity` 且时长 ≤ 0.01ms。
- **遮罩语义**：`mask=true`（默认，模态）压暗背景 `--cd-sidesheet-mask-bg` 并锁定滚动；`mask=false`（非模态）无遮罩、不锁滚动、不抢焦点，适合协作式面板。
- **尺寸语义**：`size=small|default|large` 映射到该轴向的预设尺度（横向面板对应宽度，纵向面板对应高度）；`width`/`height` 显式覆盖预设。移动端（窄视口）默认铺满（near full-bleed）。
- **结构语义**：Header（标题 + 关闭按钮 + 可选额外操作）/ Body（可滚动主区）/ Footer（操作按钮区，sticky 贴底）三段式，三者均可选。
- **校验态**：SideSheet 自身不含 `status`（其内容由业务表单组件承载），保持容器中性。
- **RTL**：`placement=left/right` 在 RTL 下镜像（`left`↔`right` 的视觉边由 `dir` 决定），动效位移方向同步镜像；`top/bottom` 不受 RTL 影响。

## 3. 分层实现

SideSheet 含完整交互/键盘/焦点逻辑，采用 headless + 渲染分层。

- **@chenzy-design/core · `createSideSheet`**：与 `createModal` 共享浮层内核，输出状态机与可访问性属性。
  - 复用原语：
    - `useFocusTrap`：`mask=true` 时启用，限制 Tab 循环于面板内；`mask=false` 时不启用（允许焦点离开）。
    - `useDismiss`：聚合 Esc（`closeOnEsc`）、点击遮罩（`maskClosable`）、点击外部（`mask=false` 且 `outsideClosable`）触发关闭意图，统一发出 `openChange(false)`。
    - `useScrollLock`：仅 `mask=true` 时锁定 `document` 滚动，处理 scrollbar gutter 防抖动。
    - `useLiveAnnouncer`：可选地在打开时向 SR 播报标题（非模态场景）。
    - `useId`：生成 `aria-labelledby`/`aria-describedby` 关联 id。
  - 输出：`open` 受控状态、`getTriggerProps`/`getOverlayProps`/`getMaskProps`/`getCloseButtonProps`、返焦目标管理（关闭后焦点回到触发元素）、`placement` 推导的动效方向 token。
- **@chenzy-design/svelte · `<SideSheet>`**：消费 core，负责 DOM 结构、`transition:`/CSS 动效、Portal 挂载（`getContainer`）、`destroyOnClose`/`lazyMount` 惰性渲染、Header/Body/Footer 插槽编排、`afterOpen`/`afterClose` 生命周期回调派发。
- **Portal**：默认挂载至 `document.body`，可通过 `getContainer` 指定容器（用于嵌入式/受限滚动区域）。
- **嵌套**：支持多层 SideSheet/Modal 叠加，z-index 由共享浮层栈管理，Esc 仅关闭栈顶。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `open` | `boolean` | `false` | 受控显隐。配合 `on:openChange` 使用。 |
| `placement` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 滑出方向（贴附边缘）。RTL 下 left/right 镜像。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 预设尺度（横向→宽度，纵向→高度）。 |
| `width` | `number \| string` | — | 显式宽度（left/right 生效），覆盖 `size`。数字按 px。 |
| `height` | `number \| string` | — | 显式高度（top/bottom 生效），覆盖 `size`。数字按 px。 |
| `title` | `string` | — | 标题文案；为空且无 `title` slot 时不渲染 Header 标题。 |
| `mask` | `boolean` | `true` | 是否显示遮罩并以模态方式呈现（锁滚动 + focus trap）。 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭（`mask=true` 时生效）。 |
| `outsideClosable` | `boolean` | `false` | `mask=false` 时点击面板外部是否关闭。 |
| `closeOnEsc` | `boolean` | `true` | 按 Esc 是否关闭（仅作用于浮层栈顶）。 |
| `closable` | `boolean` | `true` | 是否在 Header 显示关闭按钮。 |
| `keepDOM` / `lazyMount` | `boolean` | `lazyMount=true` | 首次打开前是否惰性挂载内容。 |
| `destroyOnClose` | `boolean` | `false` | 关闭后是否销毁内部内容（释放表单/重内容资源）。 |
| `getContainer` | `() => HTMLElement` | `() => document.body` | Portal 挂载容器。 |
| `zIndex` | `number` | `1000` | 浮层基准层级（栈内自动递增）。 |
| `disableScrollLock` | `boolean` | `false` | 强制不锁定背景滚动（即便 `mask=true`）。 |
| `returnFocusTo` | `HTMLElement \| (() => HTMLElement)` | 触发元素 | 关闭后焦点返回目标。 |
| `motionDisabled` | `boolean` | `false` | 关闭进出动效（独立于 reduced-motion）。 |
| `class` / `bodyClass` / `maskClass` | `string` | — | 自定义类名钩子。 |
| `ariaLabel` | `string` | — | 无可见标题时提供 `aria-label`（无障碍兜底）。 |

### Events

| 事件 | payload | 说明 |
|---|---|---|
| `on:openChange` | `{ open: boolean; reason: 'esc' \| 'mask' \| 'outside' \| 'closeButton' \| 'programmatic' }` | 显隐意图变化（受控，需外部回写 `open`）。 |
| `on:afterOpen` | `void` | 进入动效结束、内容完全可见后触发。 |
| `on:afterClose` | `void` | 退出动效结束、DOM 卸载（如适用）后触发。 |
| `on:cancel` | `{ reason }` | 用户主动取消（Esc/遮罩/外部/关闭按钮）的语义快捷事件。 |

### Slots

| Slot | props | 说明 |
|---|---|---|
| `default` | — | Body 主内容区（可滚动）。 |
| `title` | — | 自定义标题区（覆盖 `title` prop）。 |
| `headerExtra` | — | Header 右侧额外操作（关闭按钮之前）。 |
| `footer` | `{ close }` | Footer 操作区；提供 `close()` 以便按钮关闭面板。 |
| `closeIcon` | — | 自定义关闭图标。 |

## 5. 主题 / Token 表

仅消费 Alias / Component 级 Token，禁止写死值。

| Component Token | 回退（Alias） | 用途 |
|---|---|---|
| `--cd-sidesheet-bg` | `--cd-color-bg-0` | 面板背景。 |
| `--cd-sidesheet-color` | `--cd-color-text-0` | 面板主文本色。 |
| `--cd-sidesheet-mask-bg` | `rgba(from var(--cd-color-text-0) r g b / 0.6)` → `--cd-color-mask` | 遮罩背景。 |
| `--cd-sidesheet-border` | `--cd-color-border` | 贴边分隔线 / Header/Footer 分割线。 |
| `--cd-sidesheet-radius` | `--cd-radius-large` | 朝向内容侧圆角。 |
| `--cd-sidesheet-shadow` | `--cd-shadow-elevated` | 面板投影。 |
| `--cd-sidesheet-padding` | `--cd-spacing-loose` | Body 内边距。 |
| `--cd-sidesheet-header-height` | `--cd-spacing-xl` 派生 | Header 高度。 |
| `--cd-sidesheet-title-color` | `--cd-color-text-0` | 标题色。 |
| `--cd-sidesheet-title-font` | `--cd-typography-title` | 标题字号/字重。 |
| `--cd-sidesheet-close-color` | `--cd-color-text-2` | 关闭按钮图标色。 |
| `--cd-sidesheet-close-hover-bg` | `--cd-color-fill-0` | 关闭按钮 hover 底色。 |
| `--cd-sidesheet-width-small` / `-default` / `-large` | `448px / 60% / 90%` | 横向预设宽度。 |
| `--cd-sidesheet-height-small` / `-default` / `-large` | `40% / 60% / 90%` | 纵向预设高度。 |
| `--cd-sidesheet-zindex` | `--cd-zindex-overlay` | 基准层级。 |
| `--cd-sidesheet-motion-duration` | `--cd-motion-duration-2` | 进出时长。 |
| `--cd-sidesheet-motion-easing` | `--cd-motion-easing-standard` | 进出缓动。 |

> 暗色模式由 Alias 层自动切换，组件层无需额外定义。

## 6. 无障碍（WCAG 2.1 AA · 遵循 WAI-ARIA APG Dialog (Modal) Pattern）

- **role**：模态（`mask=true`）容器 `role="dialog"` + `aria-modal="true"`；非模态（`mask=false`）使用 `role="dialog"` 但 **不** 设 `aria-modal`（或视内容用 `role="complementary"`），避免误导 SR 锁定语义。
- **命名/描述**：有标题时 `aria-labelledby` 指向标题元素 id；无标题须提供 `ariaLabel`。`aria-describedby` 可指向首段说明性内容。
- **焦点管理**：
  - 打开时焦点移入面板（优先 `autofocus` 元素 → 首个可聚焦元素 → 面板容器）。
  - `mask=true` 启用 `useFocusTrap`，Tab/Shift+Tab 在面板内循环。
  - 关闭后焦点返回 `returnFocusTo`（默认触发元素），避免焦点丢失到 `<body>`。
- **键盘交互**：
  - `Esc`：关闭（`closeOnEsc`），仅作用于浮层栈顶。
  - `Tab` / `Shift+Tab`：焦点循环（模态）。
  - 关闭按钮可由 `Enter`/`Space` 激活，具 `aria-label`（i18n `SideSheet.closeAriaLabel`）。
- **遮罩**：`aria-hidden` 不施加于遮罩本身；模态打开时对背景兄弟节点施加 `aria-hidden="true"` / `inert`（由浮层栈统一管理，仅栈顶可交互）。
- **对比度**：标题/正文文本对背景 ≥ 4.5:1；关闭图标对背景 ≥ 3:1（非文本）。遮罩压暗不得使任何前景内容低于阈值。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时移除位移动效，保留即时显隐。
- **RTL**：`dir=rtl` 下 left/right 自动镜像，动效方向同步；逻辑属性（`inset-inline-*`）实现贴边。

## 7. 国际化

- 用户可见文案零硬编码，全部经 i18n 解析。

| i18n key | 默认（zh-CN） | 说明 |
|---|---|---|
| `SideSheet.closeAriaLabel` | 关闭 | 关闭按钮无障碍名。 |
| `SideSheet.closeText` | 关闭 | Footer 默认取消按钮文案（若使用内置 footer）。 |
| `SideSheet.confirmText` | 确定 | Footer 默认确认按钮文案（若使用内置 footer）。 |

- 组件不内嵌日期/数字渲染；若内容含日期/数字，由业务侧使用 `Intl.DateTimeFormat` / `Intl.NumberFormat` 并传入当前 locale。
- RTL 语言（ar/he）下方向镜像由 `dir` 驱动（见 §6）。
- 文案长度自适应：标题区单行省略（`text-overflow: ellipsis`），Footer 按钮随文案宽度自适应，避免截断。

## 8. 文案（遵循 content-guidelines）

- **标题**：名词短语，描述面板内容主体（如"编辑用户"、"高级筛选"），避免句末标点。
- **关闭按钮**：图标按钮，aria-label 用动词"关闭"，不显示可见文字。
- **Footer 操作**：主操作用具体动词（"保存"、"应用筛选"）优于泛化的"确定"。
- **空/加载态**：由 Body 内容承载，建议配合 Empty / Spin。

### 危险操作文案（单列）

- 当 SideSheet 内承载不可逆操作（如删除、清空），主操作按钮使用 `--cd-color-danger` 语义并明确后果，文案为具体动词 + 对象（如"删除此项"），避免模糊的"确定"。
- 若面板存在未保存的编辑内容，用户触发关闭意图（Esc/遮罩/外部）时应由业务侧拦截 `on:openChange` 并弹出二次确认（"放弃未保存的更改？"），SideSheet 本身不自动丢弃。

## 9. 性能

### Perf Budget

| 指标 | 预算 | 说明 |
|---|---|---|
| 组件 gzip 体积（svelte） | ≤ 4.5 KB | 不含共享 core 原语。 |
| 共享 core（createSideSheet，与 Modal 共摊） | ≤ 2 KB 增量 | 复用 Modal 浮层内核。 |
| 打开首帧（lazyMount） | ≤ 16ms（不含业务内容） | 惰性挂载，关闭态零渲染成本。 |
| 进出动效 | 60fps，仅 `transform`/`opacity` 合成层 | 不触发 layout/paint。 |
| 滚动锁定开销 | 一次性，关闭还原无跳动 | scrollbar gutter 补偿。 |

- **惰性渲染**：`lazyMount=true` 默认，首次打开前不挂载 Body 内容；`destroyOnClose=true` 适用于重表单/大列表，关闭即释放。
- **虚拟化**：SideSheet 自身不内建虚拟化；若 Body 承载长列表，应在内容侧使用 List/Table 的虚拟滚动。
- **动效合成**：仅动画 `transform` + `opacity`，`will-change` 在动画期间临时启用并在结束后移除。
- **多实例**：浮层栈复用单一全局 scroll-lock 引用计数，避免多面板叠加重复锁定/还原。

## 10. AI 元数据

- 提供 `component.meta.ts`，内容包含：
  - `name: 'SideSheet'`、`category: 'feedback'`、`stage: 'M5'`、`semiEquivalent: 'SideSheet'`。
  - `props`/`events`/`slots` 的机器可读 schema（类型、默认值、枚举、必填、描述），与 §4 一致。
  - `a11yPattern: 'dialog-modal'`、`apgRef: 'dialog (modal)'`。
  - `tokens`：导出消费的 Component Token 列表（同 §5）供主题工具校验。
  - `relatedComponents: ['Modal', 'Popover', 'Notification']`、`replaces: ['Drawer']`。
  - `usageHints`：例如"承载次要任务流/详情/筛选；模态用 mask=true，协作式用 mask=false"，供 AI 代码生成正确选型与避免与 Modal 混用。
  - `dangerousActions`: 标注 footer 危险操作需 `--cd-color-danger` 与二次确认。

## 11. 测试

- **单元（core · createSideSheet）**：
  - `open` 状态机与 `openChange` reason 正确性（esc/mask/outside/closeButton/programmatic）。
  - focus trap 仅在 `mask=true` 启用；返焦目标解析（默认触发元素 / `returnFocusTo`）。
  - scroll-lock 引用计数（多实例叠加/还原）。
  - 浮层栈：Esc 仅关栈顶；嵌套 z-index 递增。
- **组件（svelte）**：
  - 四个 `placement` 的贴边与动效方向；RTL 镜像。
  - `lazyMount` / `destroyOnClose` 挂载与销毁时机；`afterOpen`/`afterClose` 派发顺序。
  - `maskClosable` / `outsideClosable` / `closeOnEsc` 行为矩阵。
  - slot（title/headerExtra/footer with `close`/closeIcon）渲染。
- **a11y（axe + 键盘）**：
  - `role`/`aria-modal`/`aria-labelledby`/`aria-label` 兜底；背景 `inert`/`aria-hidden`。
  - Tab/Shift+Tab 循环、Esc 关闭、关闭后焦点返回。
  - 对比度断言（标题/正文 ≥ 4.5:1，关闭图标 ≥ 3:1）。
- **视觉回归**：四方向 × {small/default/large} × {light/dark} × {LTR/RTL} 快照；reduced-motion 快照。
- **i18n**：切换 locale 校验 `closeAriaLabel`/footer 文案；RTL 渲染。

## 12. 验收标准 Checklist

- [ ] 支持 `placement` 四方向，贴边与动效方向正确，RTL 镜像。
- [ ] `open` + `on:openChange` 受控模型一致，`reason` 准确覆盖五种来源。
- [ ] `mask=true` 模态（focus trap + scroll lock + `aria-modal`）与 `mask=false` 非模态（不抢焦点/不锁滚动）行为正确。
- [ ] 关闭后焦点返回触发元素或 `returnFocusTo`，无焦点丢失。
- [ ] `lazyMount`/`destroyOnClose` 生效，关闭态零渲染成本，资源可释放。
- [ ] `size` 与 `width`/`height` 覆盖关系正确；窄视口近铺满。
- [ ] 所有可见文案经 i18n，关闭按钮含 `aria-label`，无硬编码。
- [ ] 仅消费 Alias/Component Token，无写死颜色/尺寸；暗色自动适配。
- [ ] 动效仅用 `transform`/`opacity`，`prefers-reduced-motion` 与 `motionDisabled` 退化正确。
- [ ] WCAG 2.1 AA 通过：role/aria、键盘交互、对比度、背景 inert。
- [ ] Header/Body/Footer 三段式与对应 slots 工作；footer 提供 `close()`。
- [ ] 危险操作使用 `--cd-color-danger` 并支持未保存内容的二次确认拦截。
- [ ] 多实例/嵌套：scroll-lock 引用计数与浮层栈 z-index、Esc 栈顶语义正确。
- [ ] 提供 `component.meta.ts`，schema 与 §4 API 一致。
- [ ] Perf Budget 达标（gzip ≤ 4.5KB，动效 60fps，首帧 ≤ 16ms）。
