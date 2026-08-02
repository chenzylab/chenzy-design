# SPEC · BackTop
> 分类：other · 阶段：M6
> 对标 Semi：BackTop

## 1. 概述

BackTop（回到顶部）是一个浮于页面右下角的悬浮按钮，当目标滚动容器的滚动距离超过设定阈值时显现，点击后将容器平滑滚动回顶部。它解决长页面/长列表场景下用户快速返回起点的诉求。

核心能力：
- **滚动阈值显隐**：监听目标容器 `scroll`，滚动距离 ≥ `visibilityHeight` 时显示，反之隐藏。
- **目标容器可配**：默认监听 `window`，可通过 `target` 指定任意滚动容器（如 Modal 内的滚动区、侧栏 List）。
- **平滑滚动**：内置缓动动画返回顶部，`duration` 可配，尊重 `prefers-reduced-motion`。
- **自定义内容**：默认渲染一个上箭头圆形按钮，支持通过默认插槽完全自定义外观/文案。
- **定位可配**：`bottom` / `right`（或左侧）偏移可配，支持 RTL 镜像。

与 `Affix` 的区别：Affix 是"吸附固定"任意内容；BackTop 是"阈值显隐 + 滚动到顶"的专用行为按钮。BackTop 属轻量交互组件，不涉及焦点陷阱或浮层栈。

## 2. 设计语义

- **视觉层级**：悬浮于内容之上，使用中性/低饱和背景的圆形按钮，避免与主操作（primary CTA）抢夺注意力。默认不使用 `--cd-color-primary`，而用 `--cd-color-bg-2` + 阴影做"次要悬浮控件"语义。
- **进出场动画**：`fade + 轻微 translateY` 进出，时长走 token `--cd-back-top-motion-duration`（默认 200ms）。`prefers-reduced-motion` 下退化为瞬时显隐 + 瞬时跳转（`scrollTo` 不带 behavior:smooth）。
- **尺寸**：默认 `default`（40px），`small`（32px）、`large`（48px）。圆形，图标居中。
- **状态**：default / hover（提升阴影、背景变深）/ active（按下）/ focus-visible（2px 焦点环 `--cd-color-primary`）。无 disabled 语义（隐藏即不可交互）。
- **定位语义**：相对最近定位上下文（target 为 window 时相对 viewport，`position: fixed`；target 为元素时建议 `position: absolute` 于容器内或 fixed 配合偏移）。
- **不抢占指针**：隐藏态 `pointer-events: none` + `visibility: hidden`，避免遮挡底层内容。

## 3. 分层实现

属于"有滚动监听 + 显隐状态 + 可访问按钮"的轻交互组件，逻辑下沉到 core。

**@chenzy-design/core · `createBackTop`（headless）**
- 输入：`target`（() => Window | HTMLElement）、`visibilityHeight`、`duration`、`onClick`、`getReducedMotion`。
- 职责：
  - 解析 target、绑定 `scroll`（passive: true）与 `resize`，用 `rAF` 节流读取 `scrollTop`，输出响应式 `visible` 状态（store）。
  - 计算并执行 `scrollToTop()`：自实现缓动（easeInOutCubic）以保证 `duration` 可控且跨浏览器一致；reduced-motion 时直接 `scrollTo(0)`。
  - 提供 `getTriggerProps()`：返回 `role/tabindex/aria-label/on:click/on:keydown`（Enter/Space）。
  - 生命周期清理：解绑监听、取消未完成的滚动 rAF。
- 复用 core 原语：
  - `useId`：为可选的 `aria-label`/描述生成稳定 id。
  - `useLiveAnnouncer`：点击后可选向 SR 播报"已回到顶部"（`announceOnArrive` 时）。
  - 不需要 `useFocusTrap`/`useDismiss`/`useScrollLock`/`useRovingTabindex`（单一按钮、无浮层栈、不应锁滚动）。

**@chenzy-design/svelte · `BackTop.svelte`（渲染）**
- 消费 `createBackTop`，渲染圆形按钮容器 + 默认箭头图标 + 默认插槽。
- 处理 `transition:fade`/自定义过渡，绑定 token 类名，处理 RTL（`left` vs `right`）。
- SSR 安全：监听绑定置于 `onMount`（无 `window` 访问于模块顶层）。

## 4. API

### Props

> 本表由 `packages/svelte/src/back-top/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| target | `() => HTMLElement \| Window \| null` | `() => window` | 返回需要监听其滚动事件的元素对应 DOM 元素的函数（对齐 Semi） |
| visibilityHeight | `number` | `400` | 出现 BackTop 需要达到的滚动高度(px) |
| duration | `number` | `450` | 滚动到顶部的时间(ms) |
| onClick | `(e: MouseEvent) => void` | `undefined` | 点击事件的回调函数 |
| children | `Snippet` | `undefined` | 自定义按钮内容（替换默认 IconButton） |
| style | `string` | `''` | 根节点内联样式 |
| class | `string` | `''` | 根节点类名 |

**事件**（回调 prop 形式，对齐 Semi）：

| 事件 | 说明 |
| --- | --- |
| `onClick` | 按钮点击 |

### Events

| 事件 | 说明 |
| --- | --- |
| `onClick` | 按钮点击 |

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| `default` | `{ visible: boolean }` | 完全自定义按钮内容；提供时不渲染内置箭头图标 |
| `icon` | `{ size: string }` | 仅替换图标，保留内置圆形按钮容器与样式 |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 token，禁止写死值。

| Component Token | 回退（Alias） | 用途 |
|---|---|---|
| `--cd-back-top-size` | `40px`（default；small 32 / large 48 由 modifier 覆盖） | 按钮直径 |
| `--cd-back-top-bg` | `var(--cd-color-bg-2)` | 默认背景 |
| `--cd-back-top-bg-hover` | `var(--cd-color-bg-3)` | hover 背景 |
| `--cd-back-top-bg-active` | `var(--cd-color-bg-4)` | active 背景 |
| `--cd-back-top-color` | `var(--cd-color-text-0)` | 图标颜色 |
| `--cd-back-top-border` | `var(--cd-color-border)` | 描边（默认透明，hover 显现可选） |
| `--cd-back-top-shadow` | `var(--cd-shadow-elevated)` | 悬浮阴影 |
| `--cd-back-top-radius` | `var(--cd-radius-full)` | 圆角（默认全圆） |
| `--cd-back-top-z-index` | `var(--cd-z-affix)` | 层级 |
| `--cd-back-top-focus-ring` | `var(--cd-color-primary)` | focus-visible 焦点环色 |
| `--cd-back-top-motion-duration` | `200ms` | 进出场过渡时长 |
| `--cd-back-top-offset-bottom` | 由 `bottom` prop 注入 | 底部偏移 |
| `--cd-back-top-offset-inline-end` | 由 `right` prop 注入 | inline-end 偏移（RTL 自适应） |

类名结构：`cd-back-top`（根/按钮）、`cd-back-top`（图标由 children/IconButton 承担，无独立类）、修饰符 `cd-back-top`（同上） / `cd-back-top`（尺寸由 style/class prop 自定义，无内置档位） / `cd-back-top`（显隐由条件渲染而非修饰类） / `cd-back-top`（隐藏由条件渲染而非修饰类）。

## 6. 无障碍（WCAG 2.1 AA）

- **role / 语义**：根节点为原生 `<button type="button">`（首选；自动获得 button role 与键盘行为）。若用插槽渲染非按钮元素，则降级为 `role="button"` + `tabindex="0"`。
- **aria**：`aria-label` 默认取 i18n `BackTop.ariaLabel`（"回到顶部"），可被插槽/prop 覆盖。隐藏态从 a11y 树移除（`visibility: hidden` + `aria-hidden` 由隐藏实现保证不可聚焦，使用 `tabindex` 移除或元素卸载）。
- **键盘交互**：原生 button 自带 Enter / Space 触发。自定义元素时 core 的 `getTriggerProps` 显式处理 `keydown`（Enter、Space，且 Space 阻止默认页面滚动）。组件不抢占 Tab 顺序之外的焦点。
- **焦点管理**：点击回顶后焦点保留在按钮（不强制移动焦点至页首，避免打断 SR 用户上下文）；到顶播报**未实现**（BackTop slice 只有 `ariaLabel` 一键，无 `arrived`；亦无 `announceOnArrive` prop）。
- **对比度**：图标对背景 ≥ 4.5:1（`--cd-color-text-0` on `--cd-color-bg-2` 满足）；焦点环对相邻色 ≥ 3:1。
- **reduced-motion**：`@media (prefers-reduced-motion: reduce)` 下进出场动画关闭，回顶使用瞬时 `scrollTo(0)`（不传 `behavior: 'smooth'`）。
- **RTL**：偏移使用 `inset-inline-end` / `inline-end`，箭头图标方向不受影响（始终向上）。
- **可见性**：按钮不应遮挡同区域关键操作；建议 `pointer-events: none` 于隐藏态。

## 7. 国际化

用户可见文案零硬编码，经 i18n provider 注入。

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-07-30 重校）。键名与键值都是 Semi 契约，勿手写「规划中」的键——历史上本表列过大量从未实现的键名，见 [[locale-dangling-keys-render-raw-key]]。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `BackTop.ariaLabel` | 回到顶部 |

- 无日期/数字展示需求；若未来扩展"显示滚动百分比"等，需用 `Intl.NumberFormat` 格式化。
- 文案随 locale 切换实时更新（响应式订阅 i18n store）。

## 8. 文案

- 遵循 content-guidelines：无障碍名称用动词短语"回到顶部"，简洁、动作导向，避免"点击此处"。
- 播报文案"已回到顶部"为完成态反馈，过去式/完成语气。
- **危险操作文案**：本组件不含任何破坏性/不可逆操作，无危险文案项。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 目标 | 说明 |
|---|---|---|
| gzip 体积（svelte 渲染） | ≤ 2.65 KB | 单按钮 + 过渡，无重依赖 |
| gzip 体积（core headless） | ≤ 1.2 KB | 含缓动滚动 + 监听节流 |
| 滚动监听开销 | 每帧 ≤ 1 次 `scrollTop` 读取 | `passive` 监听 + `rAF` 节流，避免 layout thrash |
| 回顶动画 | 60fps，单 rAF 循环 | 自实现 easeInOutCubic，结束即取消 rAF |
| 显隐切换 | 无重排抖动 | 用 `opacity`/`transform` 过渡，不动 `display` 触发 reflow |
| 监听器数量 | 每实例 ≤ 2（scroll + resize） | resize 仅在 target 为元素且需重算时绑定 |

- **虚拟化**：不适用（单元素）。
- **惰性渲染 / destroyOnClose**：隐藏态默认保留 DOM（成本极低）但置 `pointer-events:none` + 移出 a11y 树；不提供 destroyOnClose（无必要）。
- **SSR**：服务端渲染初始隐藏，`scroll` 监听仅 `onMount` 绑定。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'BackTop'`、`category: 'other'`、`stage: 'M6'`、`semiEquivalent: 'BackTop'`。
- `props` / `events` / `slots` 的机器可读 schema（类型、默认值、枚举、是否受控）。
- `a11y`: `{ apgPattern: 'button', wcag: 'AA', keyboard: ['Enter','Space'] }`。
- `tokens`: 上表 Component token 列表及回退链。
- `i18nKeys: ['BackTop.ariaLabel','BackTop.arrived']`。
- `usageHints`: 典型场景（长列表 / Modal 内滚动 / 自定义内容），与 `Affix` 的选用区分说明。
- `composes`: `['useId','useLiveAnnouncer']`。

## 11. 测试

- **单元（core `createBackTop`）**：
  - 阈值边界：scrollTop = visibilityHeight ± 1 时 `visible` 正确翻转。
  - `scrollToTop` 在 duration>0 走缓动、duration=0 与 reduced-motion 走瞬时。
  - target 为 string/元素/window 三态解析正确；卸载时解绑监听、取消 rAF。
  - 受控 `visible` 时忽略阈值。
- **组件（svelte）**：
  - 渲染默认箭头、`default`/`icon` 插槽覆盖生效。
  - 点击/Enter/Space 触发 `on:click` 与滚动；`on:visibleChange`、`on:scrollEnd` 触发时机。
  - size 修饰符类名、RTL 下 `inset-inline-end` 偏移。
- **a11y（axe / 手测）**：button 角色、`aria-label` 来自 i18n、隐藏态不可聚焦、focus-visible 焦点环、对比度。
- **视觉回归**：default/small/large × hover/active/focus × LTR/RTL × reduced-motion 快照。
- **i18n**：locale 切换后 `aria-label` 文案更新。

## 12. 验收标准 checklist

- [ ] core/svelte 分层落地，`createBackTop` 输出 `visible` store 与 `getTriggerProps`/`scrollToTop`。
- [ ] 滚动监听 `passive` + `rAF` 节流，卸载无泄漏（监听与 rAF 均清理）。
- [ ] 阈值显隐正确，受控 `visible` 优先生效。
- [ ] 平滑回顶可控 `duration`，reduced-motion 退化为瞬时。
- [ ] target 支持 window / 元素 / 选择器字符串，SSR 安全。
- [ ] 默认渲染原生 `<button>`，键盘 Enter/Space 可触发，Space 不滚动页面。
- [ ] `aria-label` 走 i18n，无硬编码可见文案；可选 `announceOnArrive` 播报。
- [ ] 仅消费 Alias/Component token，无写死颜色/尺寸/阴影；RTL 用 `inset-inline-end`。
- [ ] size small/default/large 视觉正确，焦点环对比度达标。
- [ ] `default` / `icon` 插槽可覆盖内容，作用域参数可用。
- [ ] 事件 `on:click` / `on:visibleChange` / `on:scrollEnd` 行为与文档一致。
- [ ] Perf Budget 达标（svelte ≤2.65KB / core ≤1.2KB gzip，滚动每帧 ≤1 次读取）。
- [ ] 提供 `component.meta.ts` 且字段完整。
- [ ] 单元 / 组件 / a11y / 视觉回归 / i18n 测试通过。
