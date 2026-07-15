# SPEC · Spin
> 分类：feedback · 阶段：M5
> 对标 Semi：Spin（严格对齐）

## 1. 概述

Spin（加载指示器）用于告知用户内容正在加载且需要一段不确定的时长。它是 chenzy-design 反馈层最高频的"过程态"组件，与 Skeleton（结构占位）形成互补：Skeleton 用于首屏/结构尚未确定的占位，Spin 用于已有结构之上的短时阻塞或进行态。

严格对齐 Semi Design，采用**单一统一 DOM 结构**（无 inline / wrapper / fullscreen 形态分叉）：

- 根节点 `.cd-spin` 始终渲染 `.cd-spin-children`（承载 children）。
- 有 `children` 时，根节点加 `.cd-spin-block` 变为块级包裹，并通过 `::after` 遮罩解决嵌套穿透；children 半透明（opacity 0.5）不可交互。
- 无 `children` 时，就是一个独立的旋转指示器（`.cd-spin` 尺寸 = 指示器尺寸）。
- loading 时，绝对定位居中的 `.cd-spin-wrapper` 叠加在内容之上，承载指示器（默认渐变 SVG 或 `.cd-spin-animate` 包裹的自定义 indicator）与可选 tip 文案。

不做的事（Semi 亦无）：进度百分比（用 Progress）、骨架占位（用 Skeleton）、全屏遮罩 / 滚动锁定 / minShowTime / 显隐公告事件——这些 chenzy-design 自造能力已在破坏性重写中移除。

## 2. 设计语义

- 视觉：默认指示器为 Semi 的渐变弧 SVG（`linearGradient` + `currentColor`，48×48 viewBox `0 0 36 36`），颜色继承自 `.cd-spin-wrapper` 的 `color: --cd-color-spin-bg`（即 `--cd-color-primary`）。
- 尺寸：small 14px / middle 20px（默认）/ large 32px，由 `--cd-width-spin-*` 提供，同时约束根节点与 wrapper 内 SVG。
- 节奏：默认指示器旋转周期 `--cd-animation-duration-spin-wrapper-spin`（600ms linear infinite）；自定义 indicator（`.cd-spin-animate`）周期 `--cd-animation-duration-spin-custom-children-spin`（1600ms）。reduced-motion 下退化为透明度呼吸，不旋转。
- 包裹内容：`.cd-spin-children` 半透明 `--cd-opacity-spin-children`（0.5）且 `user-select:none`；`.cd-spin-hidden`（!loading）时恢复不透明、可选中。
- RTL：组件居中布局无方向性；旋转方向不随 RTL 镜像（旋转无语义方向）。

## 3. 分层实现

**@chenzy-design/core · `createSpinController`**
- 职责：管理 `spinning` 的有效显示态 effective，处理 `delay`（开始加载后延迟 N ms 才显示，避免瞬时请求闪烁）。对齐 Semi foundation 语义：spinning 变 false 立即隐藏并取消待显示定时器；**无 minShowTime**（Semi 无）。
- 输出：`{ getEffective, subscribe, setSpinning, destroy }`，框架无关，纯定时器，SSR 安全（定时器仅在 client effect 内启动）。
- 不使用：focus-trap / scroll-lock / live-announcer（Semi 均无）。

**@chenzy-design/svelte · `Spin.svelte`**
- 消费 createSpinController，负责统一 DOM 结构与 CSS、indicator 插槽。
- effective 为内部派生显示态，`spinning` 受控只推入不回写。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| spinning | `boolean` | `true` | 是否处于加载中的状态 |
| size | `'small' \| 'middle' \| 'large'` | `'middle'` | 组件大小 |
| indicator | `Snippet` | — | 自定义加载指示符（优先级高于内置） |
| delay | `number` | `0` | 延迟显示加载效果的时间（ms） |
| tip | `string` | `''` | 当 spin 作为包裹元素时的描述文字；为空则不渲染 |
| wrapperClassName | `string` | `''` | 包裹元素的类名 |
| style | `string` | — | 根节点内联样式 |
| childStyle | `string` | — | 内部子元素（`.cd-spin-children`）的样式 |
| children | `Snippet` | — | 被包裹的内容（提供则进入 block 包裹模式） |

其余 `HTMLAttributes<HTMLDivElement>` 透传至根节点（含 `data-*`）。

说明：本组件无受控输入语义，故不涉及 value/onChange；无浮层显隐语义的 open/openChange。Semi 无 events。

### Slots（Svelte 5 Snippets）

| 名称 | 参数 | 说明 |
|---|---|---|
| children | — | 被包裹的内容（提供则进入 block 包裹模式） |
| indicator | — | 自定义指示器（内置渐变 SVG 的替代） |

## 5. 主题 / Token

严格对齐 Semi（`semi-foundation/spin/variables.scss` 5 变量 + `animation.scss` 2 变量），无 chenzy-design 自造中间变量。

| Component Token | 值 / 退化引用 | 用途 |
|---|---|---|
| `--cd-color-spin-bg` | `--cd-color-primary` | 加载图标背景色 |
| `--cd-width-spin-large` | `32px` | 加载图标尺寸 - 大 |
| `--cd-width-spin-middle` | `20px` | 加载图标尺寸 - 中 |
| `--cd-width-spin-small` | `14px` | 加载图标尺寸 - 小 |
| `--cd-opacity-spin-children` | `0.5` | 被包裹内容半透明度 |
| `--cd-animation-duration-spin-wrapper-spin` | `600ms` | 加载图标容器旋转一周时长 |
| `--cd-animation-duration-spin-custom-children-spin` | `1600ms` | 自定义指示器旋转一周时长 |

暗色主题由 Alias（`--cd-color-primary`）自动切换，无需组件改写。

## 6. 无障碍（WCAG 2.1 AA）

- loading 时 `.cd-spin-wrapper` 使用 `role="status"`（隐式 `aria-live="polite"` + `aria-atomic="true"`），状态文本变化被读屏宣告。
- 无 tip 时以 i18n `Spin.loading` 作为 `aria-label`；有 tip 时可见 tip 文本即可访问名。
- 内置渐变 SVG 加 `aria-hidden="true"`，无障碍名仅来自 wrapper 文本/label。
- 组件无可聚焦元素，不进入 Tab 序列，不抢占焦点。
- `@media (prefers-reduced-motion: reduce)` 下旋转动画替换为低频透明度呼吸。
- RTL：布局居中无镜像需求；旋转方向保持不变。

## 7. 国际化

| key | 默认（zh-CN） | 用途 |
|---|---|---|
| `Spin.loading` | 加载中 | 无 tip 时的 aria-label |

`tip` 由调用方自行国际化（业务文案），组件不代管。

## 8. 文案

- 准确说明加载状态，使用 "Loading" / "Submitting" / "Processing" 等词。
- 使用尽量少的词汇描述状态；避免冗长口语。
- 危险操作文案：不适用（Spin 为只读过程态）。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| svelte 组件 gzip | ≤ 2.6 KB | 统一 DOM + CSS |
| core `createSpinController` gzip | ≤ 0.6 KB | 仅定时器/派生逻辑 |
| 旋转动画成本 | 0 主线程 | CSS `transform: rotate` GPU 合成，无 rAF |
| spinning 切换 | < 4ms | 仅切换 class/属性，wrapper 绝对定位不改 content 布局 |

- 惰性渲染：`.cd-spin-wrapper` 在 `effective=false` 时不渲染。
- delay 用于减少高频请求场景下的 DOM 抖动。

## 10. AI 元数据

`meta.ts` 导出：`name: 'Spin'`、`category: 'feedback'`、props/slots 镜像第 4 节、`a11y`（role=status, focusable=false）、`tokens`（第 5 节 7 个）、`examples`（基本 / 尺寸 / 带文字包裹 / 延迟显示）。

## 11. 测试

- **单元（core）**：无 delay 立即显示；delay 内不显示、≥ delay 显示；delay 内取消则从不显示、不通知；spinning 变 false 立即隐藏（无 minShowTime）；订阅变更通知。
- **a11y**：axe 无违规；loading 时 wrapper role=status + aria-live=polite + aria-label（来自 locale）；带 tip 时 tip 文本渲染于 wrapper 内。
- **SSR**：服务端渲染无 window 访问；定时器仅 client 启动。

## 12. 验收标准 checklist

- [ ] 统一 DOM 对齐 Semi（`.cd-spin` > `.cd-spin-wrapper` + `.cd-spin-children`），无形态分叉。
- [ ] `size` = small/middle/large，默认 middle；根节点与 wrapper 内 SVG 尺寸联动。
- [ ] 有 children 时 `.cd-spin-block` 块级包裹 + `::after` 遮罩；children opacity 0.5 不可交互；`.cd-spin-hidden` 恢复。
- [ ] 默认指示器为 Semi 渐变弧 SVG，颜色继承 `--cd-color-spin-bg`。
- [ ] `spinning` 控制显隐；`delay` 行为符合单测；无 minShowTime。
- [ ] 仅消费第 5 节 7 个 token，无自造中间变量、无写死。
- [ ] role=status + aria-live=polite；无 tip 时 aria-label 回退 `Spin.loading`；SVG aria-hidden。
- [ ] reduced-motion 下退化为透明度呼吸。
- [ ] 用户可见文案零硬编码，`Spin.loading` 可随 locale 切换。
- [ ] demos 不少于 Semi（基本 / 尺寸 / 带文字 / 自定义指示符 / 延迟显示）。
- [ ] 单元 / a11y / SSR 测试全部通过；typecheck 根级递归 + build 通过。
