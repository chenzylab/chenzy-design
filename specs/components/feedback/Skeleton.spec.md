# SPEC · Skeleton
> 分类：feedback · 阶段：M5
> 对标 Semi：Skeleton

## 1. 概述

Skeleton（骨架屏）是在内容加载完成前，以占位灰块预渲染页面结构的反馈组件。它通过预留与真实内容布局一致的几何形状，降低用户在等待数据返回时的感知延迟与布局抖动（CLS），避免空白屏或纯 Spinner 带来的焦虑感。

核心用途：
- 首屏 / 卡片 / 列表 / 详情页数据加载占位。
- 替代或补充 Spinner，用于内容结构已知、且加载耗时较长（> 300ms）的场景。
- 通过 `loading` 切换占位态与真实内容态（`loading=true` 显示骨架，`false` 渲染默认 slot）。

组成：
- `Skeleton`：容器，控制 `loading`、动画 `active`、占位内容（`placeholder` slot）与真实内容（默认 slot）。
- `Skeleton.Title` / `Skeleton.Paragraph` / `Skeleton.Avatar` / `Skeleton.Image` / `Skeleton.Button`：原子占位形状，可自由组合成任意占位模板。

非目标：不负责数据请求、不负责错误态（错误态由 `Empty` / 业务页处理）、不是 Spinner（连续旋转指示器）的替代品而是互补品。

## 2. 设计语义

- **占位即结构**：骨架形状应与真实内容的尺寸、行数、圆角、间距尽量 1:1 对应，使内容到达时无可感知跳变。
- **低视觉权重**：占位块使用 `--cd-color-fill-0`（弱填充）而非边框或强色，传达"内容尚未就绪"而非"可交互元素"。
- **动画语义**：`active=true` 时叠加从左到右的高光扫过（shimmer）渐变，表达"正在加载、请稍候"；静态骨架（`active=false`）表达"占位但无活跃加载"。
- **形状词汇**：
  - Title：单行粗块，默认 `width` 较宽，圆角 `--cd-skeleton-radius`。
  - Paragraph：多行细块，末行默认收窄（`width` 数组或 `61%` 末行）模拟自然段落。
  - Avatar：圆形 / 方形头像占位，`shape: circle | square`。
  - Image：大矩形占位，可含中心图标暗示。
  - Button：胶囊 / 矩形，匹配 Button 尺寸。
- **尺寸体系**：原子形状高度跟随排版基线（Title 16px、Paragraph 行 14px、行距 `--cd-skeleton-gap`），与正文字号保持节奏一致。
- **降级**：`prefers-reduced-motion: reduce` 下关闭 shimmer，仅保留静态灰块（见 §6）。

## 3. 分层实现

Skeleton 以**纯展示**为主，无键盘交互、无焦点管理，**不需要 `create<Name>` headless 逻辑**，渲染与样式完全在 `@chenzy-design/svelte` 实现。仅在以下两处复用 core 原语：

- **`useId`**（@chenzy-design/core）：当 `loading=true` 时为占位容器生成稳定 id，供 `aria-busy` 区域与外部 `aria-describedby` 关联（可选）。
- **`useLiveAnnouncer`**（@chenzy-design/core，可选）：当 `announce` 开启时，在 `loading` 由 `true → false` 切换瞬间向 polite live region 播报"内容已加载"（i18n key `Skeleton.loaded`），帮助屏幕阅读器用户感知加载完成。默认关闭以避免噪音。

分层结论：
- `@chenzy-design/core`：**不新增 `createSkeleton`**；仅依赖既有 `useId` / `useLiveAnnouncer`。
- `@chenzy-design/svelte`：`Skeleton.svelte`（容器）+ 子组件 `SkeletonTitle/Paragraph/Avatar/Image/Button.svelte`，全部为受控展示组件，通过 props 驱动渲染，动画用纯 CSS（不进 JS 主线程）。
- 渲染策略：`loading=true` 时渲染 `placeholder` slot（或子组件默认模板）；`false` 时渲染默认 slot。提供 `unmountPlaceholder`（默认 true）在加载完成后从 DOM 移除占位节点，避免冗余 DOM。

## 4. API

### Props

容器 `Skeleton`：

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `loading` | `boolean` | `true` | 是否处于加载占位态。`true` 渲染占位，`false` 渲染默认 slot 内容 |
| `active` | `boolean` | `false` | 是否启用 shimmer 加载动画 |
| `placeholder` | `Snippet` | — | 占位模板（也可用 `placeholder` slot），缺省时渲染子组件组合 |
| `unmountPlaceholder` | `boolean` | `true` | `loading=false` 后是否从 DOM 卸载占位节点 |
| `announce` | `boolean` | `false` | 加载完成时是否向 live region 播报 |
| `class` | `string` | — | 自定义根类名 |
| `style` | `string` | — | 自定义内联样式（仅消费 token，不写死颜色） |

原子子组件公共 props（`Title` / `Paragraph` / `Avatar` / `Image` / `Button`）：

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `width` | `string \| number` | 形状相关 | 占位宽度，数字按 px |
| `height` | `string \| number` | 形状相关 | 占位高度 |
| `style` | `string` | — | 内联样式 |
| `class` | `string` | — | 自定义类名 |

`Skeleton.Paragraph` 专属：

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `rows` | `number` | `3` | 段落行数 |
| `width` | `string\|number \| Array<string\|number>` | 末行 `61%` | 单值统一宽度；数组按行指定宽度 |

`Skeleton.Avatar` 专属：

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `shape` | `'circle' \| 'square'` | `'circle'` | 头像形状 |
| `size` | `'small' \| 'default' \| 'large' \| number` | `'default'` | 头像尺寸（small 24 / default 32 / large 40） |

`Skeleton.Image` 专属：

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `showIcon` | `boolean` | `true` | 是否在占位中心显示图片图标 |

`Skeleton.Button` 专属：

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 与 Button 尺寸对齐 |
| `block` | `boolean` | `false` | 是否撑满容器宽度 |
| `pill` | `boolean` | `false` | 是否胶囊圆角 |

### Events

| 事件 | 载荷 | 说明 |
|---|---|---|
| `on:loadingChange` | `{ loading: boolean }` | `loading` 受控值变化时触发（便于外部同步状态/埋点） |
| `on:contentReady` | `void` | `loading` 由 `true → false`、真实内容首次挂载后触发 |

> 说明：Skeleton 无内部交互，不产生 `value/change` 或 `open/openChange`；事件仅用于状态同步与监控，非必需。

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| `default` | — | 真实内容，`loading=false` 时渲染 |
| `placeholder` | — | 自定义占位模板，`loading=true` 时渲染；缺省渲染默认子组件组合 |

## 5. 主题 / Token 表

组件仅消费 Alias 与 Component 级 token，禁止写死。

| Component Token | 引用 Alias | 用途 |
|---|---|---|
| `--cd-skeleton-color-bg` | `--cd-color-fill-0` | 占位块基础底色 |
| `--cd-skeleton-color-highlight` | `--cd-color-fill-1` | shimmer 高光峰值色 |
| `--cd-skeleton-radius` | `--cd-radius` | 形状默认圆角 |
| `--cd-skeleton-radius-pill` | `--cd-radius-full` | Button pill / Avatar circle 圆角 |
| `--cd-skeleton-gap` | `--cd-spacing-3` | Paragraph 行间距 / 元素间距 |
| `--cd-skeleton-title-height` | `--cd-font-size-4` | Title 高度（≈16px） |
| `--cd-skeleton-paragraph-height` | `--cd-font-size-3` | Paragraph 行高度（≈14px） |
| `--cd-skeleton-anim-duration` | `--cd-motion-duration-slow` | shimmer 周期（≈1.4s） |
| `--cd-skeleton-anim-timing` | `--cd-motion-easing-standard` | shimmer 缓动 |

主题适配：
- 暗色模式自动随 `--cd-color-fill-0/1` 切换，无需组件特判。
- shimmer 高光通过 `linear-gradient(90deg, bg 0%, highlight 50%, bg 100%)` + `background-position` 动画实现，颜色全部来自 token。
- 对比度：占位块为非信息性装饰，不承载文本，不要求 4.5:1；但 `bg` 与 `highlight` 差值需可感知（建议亮度差 ≥ 4%）以保证 shimmer 可见，同时不刺眼。

## 6. 无障碍

Skeleton 为加载状态指示，遵循 WAI-ARIA 加载/忙碌语义。

- **role / aria**：
  - 占位根节点设 `aria-busy="true"`、`aria-live="polite"`（或将 `aria-busy` 设在被替换的内容区域容器上，推荐由使用方包裹）。
  - 占位形状本身为装饰，设 `aria-hidden="true"`，不向辅助技术暴露无意义的"图片/块"。
  - 提供 `aria-label`（i18n `Skeleton.loading`，默认"内容加载中"）于根节点，供屏幕阅读器播报当前为加载态。
  - `loading=false` 后移除 `aria-busy`；若 `announce=true`，经 `useLiveAnnouncer` 播报 `Skeleton.loaded`（"内容已加载"）。
- **键盘 / 焦点**：占位无可聚焦元素，不进入 Tab 序；不可在占位上设置 `tabindex`。加载完成后焦点不主动移动，避免打断用户。
- **reduced-motion**：`@media (prefers-reduced-motion: reduce)` 下，关闭 shimmer 动画（`animation: none`），保留静态灰块；不得用闪烁替代。
- **对比度**：占位为装饰元素，免除文本对比度要求；但需避免与背景完全同色导致"无占位感"。
- **RTL**：`dir="rtl"` 下 shimmer 扫过方向镜像（从右到左），通过 `[dir="rtl"]` 选择器反转 `background-position` 关键帧；Paragraph 末行收窄方向同步镜像。
- **避免空 region 噪音**：未启用 `announce` 时不创建额外 live region；占位/真实内容切换默认不打断阅读流。

## 7. 国际化

用户可见文案零硬编码，均走 i18n。

| i18n key | 默认（zh-CN） | 默认（en） | 用途 |
|---|---|---|---|
| `Skeleton.loading` | 内容加载中 | Loading content | 根节点 `aria-label` |
| `Skeleton.loaded` | 内容已加载 | Content loaded | `announce=true` 时播报 |
| `Skeleton.imageAlt` | 图片占位 | Image placeholder | Image 占位图标 `aria-label`（仅当未 `aria-hidden`） |

- 无日期 / 数字格式化需求；如使用方在占位内展示进度，建议用 `Intl.NumberFormat` 自行格式化（不在本组件职责内）。
- RTL 语言下文案方向跟随容器 `dir`，shimmer 方向见 §6。

## 8. 文案

- 本组件几乎无可见文本，文案集中在辅助技术播报，遵循 content-guidelines：简短、陈述事实、不使用感叹号。
  - 加载态：`内容加载中`（避免"请稍等""马上好"等口语化或承诺性表述）。
  - 完成态：`内容已加载`（中性陈述，不用"成功！"等情绪词）。
- **危险操作文案**：本组件不涉及任何危险 / 破坏性操作，无需危险文案。
- 自定义占位内不应嵌入真实可读文案（应保持为灰块），以免被误读为真实内容。

## 9. 性能（Perf Budget）

| 项 | 预算 / 目标 | 说明 |
|---|---|---|
| gzip 体积（容器 + 5 原子） | ≤ 3.5 KB | 纯展示 + CSS，无 core headless |
| gzip 体积（仅容器） | ≤ 1.2 KB | 单独 tree-shake 引入 |
| 首次渲染（单卡片骨架） | < 1ms | 静态 DOM，无计算 |
| 动画开销 | 0 JS 主线程 | shimmer 纯 CSS `background-position`，建议 `will-change: background-position` 仅在 `active` 时启用 |
| 列表占位（100 行） | 建议虚拟化 | 超过约 50 个重复骨架行时，应仅渲染视口内占位，避免一次性大量 DOM |
| DOM 清理 | `unmountPlaceholder=true` | 加载完成后卸载占位节点，回收 DOM |

- **惰性 / 卸载**：默认 `unmountPlaceholder=true`，`loading=false` 即移除占位，等价于 `destroyOnClose` 语义。
- **虚拟化**：组件自身不内置虚拟列表；长列表占位由使用方配合 `VirtualList` 控制渲染数量（在 §1 非目标内说明，文档给出推荐用法）。
- **动画节流**：多个 `active` 骨架共用同一 `@keyframes`，浏览器可合并合成层；避免每实例独立 timeline。

## 10. AI 元数据

提供 `component.meta.ts`（`@chenzy-design/svelte/skeleton/component.meta.ts`），供 AI / 文档 / 低代码消费：

- `name: 'Skeleton'`、`category: 'feedback'`、`stage: 'M5'`、`semiEquivalent: 'Skeleton'`。
- `subComponents: ['Skeleton.Title','Skeleton.Paragraph','Skeleton.Avatar','Skeleton.Image','Skeleton.Button']`。
- `props` / `events` / `slots`：与 §4 表一一对应的结构化描述（类型、默认值、枚举值、说明）。
- `tokens`：§5 全部 component token 及其 alias 引用。
- `a11y`：`{ pattern: 'busy-indicator', roles: ['aria-busy'], reducedMotion: true, rtl: true }`。
- `usageHints`：["内容结构已知且加载 > 300ms 时使用","错误态请用 Empty","长列表请配合 VirtualList","loading 受控，由数据状态驱动"]。
- `antiPatterns`：["不要用作 Spinner 替代连续加载指示","占位内不要放真实文案","不要给占位块设置 tabindex"]。
- `i18nKeys`：§7 全部 key。

## 11. 测试

- **单元（vitest）**：
  - `loading=true` 渲染占位、`false` 渲染默认 slot；切换正确。
  - `unmountPlaceholder=true/false` 下占位节点的挂载 / 卸载行为。
  - `Paragraph.rows` 数量、`width` 数组按行映射、末行默认收窄。
  - `Avatar.shape/size`、`Button.size/block/pill`、`Image.showIcon` 渲染正确类名。
  - token 消费：渲染结果使用 `--cd-skeleton-*` 变量，无写死颜色（断言 class，不断言计算色值）。
- **a11y（@axe-core/playwright + jest-axe）**：
  - 占位态根节点 `aria-busy="true"`、`aria-label` 来自 i18n；axe 无 violation。
  - 占位形状 `aria-hidden="true"`、不可聚焦（Tab 不停留）。
  - `announce=true` 时切换后 live region 文本 = `Skeleton.loaded`。
- **视觉回归（Playwright 截图）**：
  - 各原子形状基线；卡片 / 列表组合模板。
  - 亮 / 暗主题、LTR / RTL 两套快照。
  - `prefers-reduced-motion: reduce` 下动画关闭快照（验证无 shimmer）。
- **动画**：通过强制 `prefers-reduced-motion` 与 emulate media 断言 `animation-name` 在 reduce 下为 `none`。
- **i18n**：切换 locale，断言 `aria-label` / 播报文案随之变化，无硬编码字符串。

## 12. 验收标准 Checklist

- [ ] 包名 `@chenzy-design/svelte`，导出 `Skeleton` 及 5 个子组件，支持按需 tree-shake。
- [ ] 类名遵循 `cd-` BEM：`cd-skeleton`、`cd-skeleton__title`、`cd-skeleton--active` 等。
- [ ] 全部颜色 / 圆角 / 间距 / 动画时长经 `--cd-skeleton-*` token，且仅引用 Alias，无写死值。
- [ ] API 遵循约定：受控 `loading`、尺寸 `small|default|large`（Avatar/Button）；无需 status（纯展示）。
- [ ] `loading` 切换正确渲染占位 / 内容；`unmountPlaceholder` 行为符合预期。
- [ ] `active` shimmer 为纯 CSS，0 JS 主线程开销，多实例共用 keyframes。
- [ ] a11y：`aria-busy` / `aria-label` / 占位 `aria-hidden`，axe 无 violation，占位不可聚焦。
- [ ] `prefers-reduced-motion: reduce` 关闭动画并保留静态灰块。
- [ ] RTL 下 shimmer 方向与段落末行收窄镜像正确。
- [ ] 用户可见文案零硬编码，覆盖 `Skeleton.loading/loaded/imageAlt` 三个 key。
- [ ] 危险操作文案：不适用（组件无危险操作），已在 §8 明确。
- [ ] 性能达标：容器 + 5 原子 gzip ≤ 3.5KB；提供 `unmountPlaceholder` 卸载；文档给出长列表虚拟化指引。
- [ ] 提供 `component.meta.ts`，含 props/events/slots/tokens/a11y/i18nKeys/usageHints/antiPatterns。
- [ ] 单元 / a11y / 视觉回归（亮暗 + RTL + reduced-motion）测试齐全且通过。
- [ ] 分层正确：无多余 `createSkeleton`，仅按需复用 `useId` / `useLiveAnnouncer`。
