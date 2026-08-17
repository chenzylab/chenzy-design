# SPEC · BackTop
> 分类：other · 阶段：M6
> 对标 Semi：BackTop

## 1. 概述

BackTop（回到顶部）是一个浮于页面右下角的悬浮按钮，当目标滚动容器的滚动距离超过设定阈值时显现，点击后将容器平滑滚动回顶部。它解决长页面/长列表场景下用户快速返回起点的诉求。

核心能力：
- **滚动阈值显隐**：监听目标容器 `scroll`，滚动距离 > `visibilityHeight` 时渲染，反之不渲染（条件渲染，非 opacity 切换）。
- **目标容器可配**：默认监听 `window`，可通过 `target` 指定任意滚动容器（如 Modal 内的滚动区、侧栏 List）。
- **平滑滚动**：内置缓动动画（easeInOutCubic）返回顶部，`duration` 可配（默认 450ms）。
- **自定义内容**：默认渲染 `IconButton(theme="light") + IconChevronUp`，支持通过默认插槽（`children`）完全自定义外观/文案。
- **定位固定**：距右侧 100px、距底部 50px，无 prop 可调（对齐 Semi，覆盖需走 `style`/`class`）。

与 `Affix` 的区别：Affix 是"吸附固定"任意内容；BackTop 是"阈值显隐 + 滚动到顶"的专用行为按钮。BackTop 属轻量交互组件，不涉及焦点陷阱或浮层栈。

## 2. 设计语义

严格对齐 Semi `backtop/index.tsx` + `backtop/foundation.ts`，不引入 Semi 没有的能力（size 档位、进出场过渡、独立视觉 token、播报等均不存在于 Semi，本库亦不实现）。

- **视觉层级**：悬浮于内容之上。BackTop 自身不带任何视觉样式（背景/阴影/圆角一律为 0），圆形按钮观感完全来自内部复用的 `IconButton(theme="light")`；自定义 `children` 时外观由调用方 `style` 决定。
- **显隐**：条件渲染（`{#if visible}`），不可见时整个节点不在 DOM，无进出场过渡动画。
- **尺寸**：无内置档位，跟随 `IconButton` 默认尺寸；自定义 `children` 时尺寸由调用方决定。
- **状态**：default / hover / active / focus-visible 均由内部 `IconButton` 承担，BackTop 自身不定义状态样式。
- **定位语义**：`position: fixed`，`inset-inline-end: 100px`（RTL 下镜像为 `inset-inline-start`）、`inset-block-end: 50px`，`z-index` 同 Affix（`--cd-z-affix`，值 10）。
- **裁剪**：根节点 `overflow: hidden` + `box-sizing: border-box` + `text-align: center`（对齐 Semi scss 逐条）。

## 3. 分层实现

BackTop 逻辑简单（无浮层栈、无焦点陷阱），core 层只下沉纯函数，滚动监听与 DOM 读写留在 svelte 层命令式处理——不做成响应式状态机，避免为单一按钮引入不必要的抽象。

**@chenzy-design/core · `back-top.ts`（纯函数，非 headless 状态机）**
- `easeInOutCubic(t)`：缓动曲线，对齐 Semi `@douyinfe/semi-animation` 的 `easeInOutCubic`。
- `isAboveThreshold(scrollTop, visibilityHeight)`：`scrollTop > visibilityHeight`（严格大于，对齐 Semi foundation）。
- `scrollPositionAt(from, elapsed, duration)`：缓动插值，返回某一帧应设置的 `scrollTop`。
- 不提供 store、adapter、`getTriggerProps()`；不复用 `useId`/`useLiveAnnouncer`/`useFocusTrap` 等 core 原语（Semi 无对应能力）。

**@chenzy-design/svelte · `BackTop.svelte`（渲染 + 交互）**
- `$effect` 内命令式 `addEventListener('scroll', ..., {passive:true})` + `rAF` 节流读取 `scrollTop`，写入本地 `$state visible`；cleanup 时 `removeEventListener` + `cancelAnimationFrame`。不监听 `resize`（Semi 无此监听）。
- `visible` 为 `false` 时整个节点条件渲染为空（不在 DOM），无进出场过渡（Semi 无 transition）。
- 点击：`onClick?.(e)` → 命令式 `rAF` 循环按 `scrollPositionAt` 逐帧写 `scrollTop`/`scrollTo`；`duration<=0` 或 `prefers-reduced-motion` 时瞬时跳转。
- 默认内容 `IconButton(theme="light") + IconChevronUp`；`children` 提供时替换默认内容，外层容器不变。
- SSR 安全：滚动监听绑定于 `$effect`（仅 client 运行），模块顶层不访问 `window`。

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

| Slot | 说明 |
|---|---|
| `children`（默认插槽/snippet） | 完全自定义按钮内容；提供时替换内置 `IconButton + IconChevronUp` |

## 5. 主题 / Token

组件本身仅消费定位/层级相关的 Component token（对齐 Semi `semi-foundation/backtop/variables.scss` 仅 3 个变量）；圆形按钮的背景/颜色/圆角/阴影等视觉一律由内部复用的 `IconButton(theme="light")` 提供，BackTop 自身不定义、不消费视觉 token。

| Component Token | 值 | 用途 |
|---|---|---|
| `--cd-backtop-z` | `var(--cd-z-affix)`（10） | 按钮 `z-index`（对齐 Semi `$z-backtop: 10`，同层 Affix） |
| `--cd-backtop-right` | `100px` | 距 `inset-inline-end` 偏移（对齐 Semi `$spacing-backtop-right: 100px`） |
| `--cd-backtop-bottom` | `50px` | 距 `inset-block-end` 偏移（对齐 Semi `$spacing-backtop-bottom: 50px`） |

类名结构：根节点单一类 `cd-back-top`（对齐 Semi `semi-backtop`），无修饰符、无尺寸档位、无独立图标类；显隐由 `{#if visible}` 条件渲染而非类名切换。

## 6. 无障碍（WCAG 2.1 AA）

对齐 Semi：外层 `<div class="semi-backtop" onClick>` 本身无 `role`/`tabindex`，只是可点击容器；真实按钮语义（role、键盘 Enter/Space、可访问名）由内部 `IconButton(theme="light")` 承担，避免 `div[role=button]` 再套 `button` 的嵌套交互问题。

- **role / 语义**：根节点 `div.cd-back-top` 无 `role`/`tabindex`；默认内容是原生 `<button>`（经 IconButton），自动获得 button role 与键盘行为。自定义 `children` 时按钮语义由调用方内容自行提供。
- **aria**：默认 `IconButton` 的 `aria-label` 取 i18n `BackTop.ariaLabel`（"回到顶部"）。不可见时节点整体不在 DOM，天然不可聚焦、不进入 a11y 树。
- **键盘交互**：默认内容为原生 `<button>`，自带 Enter / Space 触发；无自定义 `keydown` 处理（无需要，原生行为已足够）。
- **焦点管理**：点击回顶后焦点保留在按钮，不强制移动焦点。无到顶播报（Semi 无对应能力，本库亦不实现）。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时回顶跳过缓动动画，直接瞬时 `scrollTo`/`scrollTop = 0`。
- **RTL**：`inset-inline-end`/`inset-block-end` 物理属性定位，RTL 下镜像到左侧；图标方向不受影响（始终向上）。

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
- **危险操作文案**：本组件不含任何破坏性/不可逆操作，无危险文案项。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 目标 | 说明 |
|---|---|---|
| 滚动监听开销 | 每帧 ≤ 1 次 `scrollTop` 读取 | `passive` 监听 + `rAF` 节流，避免 layout thrash |
| 回顶动画 | 单 rAF 循环 | easeInOutCubic 插值，结束即取消 rAF |
| 监听器数量 | 每实例 1（scroll） | 无 resize 监听（对齐 Semi，Semi 无 resize） |

- **虚拟化**：不适用（单元素）。
- **DOM 成本**：不可见时节点整体不渲染（对齐 Semi `render()` 返回 `null`），无隐藏态 DOM 常驻开销。
- **SSR**：服务端渲染初始不渲染（`visible` 默认 `false`），`scroll` 监听仅 `$effect`（client-only）绑定。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'BackTop'`、`category: 'navigation'`、`semiEquivalent: 'BackTop'`。
- `props` / `events` / `slots` 的机器可读 schema（类型、默认值、说明）。
- `a11y`: 外层容器无 role/tabindex，真实按钮语义由内部 `IconButton` 承担；不可见时不在 DOM。
- `tokens`: `--cd-backtop-z` / `--cd-backtop-right` / `--cd-backtop-bottom`。
- `i18nKeys: ['BackTop.ariaLabel']`。

## 11. 测试

- **单元（core `back-top.ts` 纯函数）**：
  - `isAboveThreshold`：`scrollTop === visibilityHeight` 时为 `false`，`scrollTop === visibilityHeight + 1` 时为 `true`（严格大于）。
  - `scrollPositionAt`：`duration<=0` 返回 0；`elapsed>=duration` 收敛到目标值；缓动曲线单调。
- **组件（svelte）**：
  - 滚动阈值前后 DOM 挂载/卸载正确（非 opacity 切换）。
  - 点击触发 `onClick` 回调与滚动动画，`duration=0`/`prefers-reduced-motion` 时瞬时跳转。
  - `target` 支持 window / 自定义元素；卸载时监听器与未完成 rAF 均清理。
  - `children` 提供时替换默认 `IconButton + IconChevronUp`。
- **a11y（axe / 手测）**：默认内容键盘 Enter/Space 可触发、`aria-label` 来自 i18n、隐藏态不可聚焦。
- **i18n**：locale 切换后 `aria-label` 文案更新。

## 12. 验收标准 checklist

- [x] core 提供纯函数（`easeInOutCubic`/`isAboveThreshold`/`scrollPositionAt`），滚动监听与 DOM 读写在 svelte 层命令式完成。
- [x] 滚动监听 `passive` + `rAF` 节流，卸载无泄漏（监听与 rAF 均清理）。
- [x] 阈值显隐正确（严格大于），不可见时节点不在 DOM。
- [x] 平滑回顶可控 `duration`，reduced-motion 退化为瞬时。
- [x] `target` 支持 window / 元素，SSR 安全。
- [x] 默认内容为可键盘操作的 `IconButton`，外层容器无冗余 role。
- [x] `aria-label` 走 i18n，无硬编码可见文案。
- [x] 仅消费 3 个定位/层级 Component token（z/right/bottom），无视觉 token；RTL 用 `inset-inline-end`/`inset-block-end`。
- [x] `children` 插槽可完全覆盖默认内容。
- [x] 提供 `component.meta.ts` 且字段与实现同步。
- [x] 单元 / 组件 / a11y 测试通过。
