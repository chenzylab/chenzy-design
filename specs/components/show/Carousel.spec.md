# SPEC · Carousel
> 分类：show · 阶段：M4
> 对标 Semi：Carousel

## 1. 概述

Carousel（走马灯）用于在有限的视觉空间内循环轮播一组内容（图片、卡片、Banner、营销位），通过自动播放与手动切换在同一容器内串联多个等价信息单元。

适用场景：
- 首页/落地页 Banner 轮播。
- 图集/产品图横向滚动展示。
- 卡片式推荐位（一屏多卡）。

不适用场景：
- 信息互不等价、需要并列阅读的内容（应用 Grid/List）。
- 步骤流程引导（应用 Steps）。
- 关键操作或表单（轮播会隐藏内容，违反可发现性）。

核心能力：自动播放（autoplay + 悬停/聚焦暂停）、循环播放、多种切换动效（slide/fade）、指示器（dot/line/columnar）、左右箭头、手势/拖拽切换、reduced-motion 降级、一屏多 slide。

与相近组件区分：Carousel 强调“同一位置自动循环”，Tabs 强调“用户主动切换且不自动”，Image 预览强调“放大查看单图”。

## 2. 设计语义

- 容器：相对定位的视口（viewport），内部为可平移的轨道（track），每个 slide 等宽。默认 16:9 或由内容/`height` 撑开。
- 切换动效：
  - `slide`（默认）：轨道水平位移，时长 `--cd-carousel-transition-duration`（300ms），缓动 `cubic-bezier(0.4, 0, 0.2, 1)`。
  - `fade`：当前/目标 slide 交叉淡入淡出，适合纯图 Banner。
- 指示器（indicator）：
  - 形态 `dot`（圆点，默认）/`line`（短线）/`columnar`（竖条）。
  - 位置 `top|bottom|left|right`，默认 `bottom` 居中。
  - 主题 `light|dark`：覆盖在深色图上用 `light`（白色指示器/箭头），浅色用 `dark`。
- 箭头（arrow）：`always`（常驻）/`hover`（悬停显示，默认）/`never`。左右居中，命中区 ≥ 40×40。
- 状态语义：active slide 完全可见且参与 Tab 序；非 active slide 视觉淡出且 `inert`/`aria-hidden`。
- 间距/尺寸：指示器与边缘间距 `--cd-carousel-indicator-gap`，自动播放进度可选条形进度（line 指示器复用）。
- 动态边界：reduced-motion 时禁用位移/淡入，改为瞬时切换；autoplay 在 reduced-motion 下默认不自动启动（见 §6）。

## 3. 分层实现

属于“有交互/键盘/a11y 逻辑”的复合组件，采用 core + svelte 分层。

**@chenzy-design/core · `createCarousel`**
- 职责（与框架无关的状态机与定时器）：
  - 维护 `activeIndex`、`slideCount`、`direction`（next/prev，用于动效方向）、`isPlaying`、`isTransitioning`。
  - autoplay 定时器：`interval` 调度、暂停/恢复（hover/focus/页面不可见/`isTransitioning`）。基于 `document.visibilitychange` 与 `requestAnimationFrame` 漂移补偿。
  - 循环逻辑：`goTo/next/prev`，处理 loop 边界（克隆首尾或 index 取模）。
  - 手势：指针拖拽阈值（`speed`/`threshold`）判定切换，松手回弹。
  - 键盘交互编排（见 §6）。
  - 复用原语：`useId`（容器/slide/indicator id 关联）、`useLiveAnnouncer`（“第 X 张，共 N 张”播报）、`useDismiss`（不适用，跳过）、`useRovingTabindex`（indicator 为单选 tablist 风格时管理 tab 焦点）。
  - 暴露：`getViewportProps/getTrackProps/getSlideProps(i)/getIndicatorProps(i)/getArrowProps('prev'|'next')`、`play/pause/goTo/next/prev`、订阅 `onChange`。
- 不含 DOM 渲染与样式。respect `prefers-reduced-motion`（通过注入的 matchMedia 查询）。

**@chenzy-design/svelte · `Carousel.svelte` / `Carousel.Item`（slot 渲染）**
- 消费 `createCarousel` 返回的 prop getters，绑定 DOM、transform/opacity 过渡、Svelte transition（reduced-motion 时关闭）。
- 处理 `IntersectionObserver` 惰性挂载（autoplay 仅在视口内运行，省电）。
- 透传 slot 给子项；负责 `destroyOnInactive`（非 active slide 可选卸载，见 §9）。
- 不在 svelte 层重复实现定时/键盘逻辑，仅做绑定。

## 4. API

### Props
| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `number` | `0` | 当前激活索引（受控）。配合 `on:change`。 |
| `defaultActiveIndex` | `number` | `0` | 非受控初始索引。 |
| `autoplay` | `boolean \| { interval?: number; hoverToPause?: boolean }` | `false` | 是否自动播放；对象形式可配间隔/悬停暂停。 |
| `interval` | `number` | `3000` | 自动播放间隔（ms）。`autoplay` 对象优先。 |
| `loop` | `boolean` | `true` | 是否循环（首尾相接）。 |
| `animation` | `'slide' \| 'fade'` | `'slide'` | 切换动效。 |
| `slidesToShow` | `number` | `1` | 一屏展示的 slide 数。 |
| `slidesToScroll` | `number` | `1` | 每次切换滚动的 slide 数。 |
| `speed` | `number` | `300` | 过渡时长（ms）。 |
| `showIndicator` | `boolean` | `true` | 是否显示指示器。 |
| `indicatorType` | `'dot' \| 'line' \| 'columnar'` | `'dot'` | 指示器形态。 |
| `indicatorPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | 指示器位置。 |
| `indicatorSize` | `'small' \| 'default' \| 'large'` | `'default'` | 指示器尺寸。 |
| `trigger` | `'click' \| 'hover'` | `'click'` | 指示器触发切换方式。 |
| `arrowType` | `'always' \| 'hover' \| 'never'` | `'hover'` | 箭头显示策略。 |
| `theme` | `'light' \| 'dark'` | `'dark'` | 指示器/箭头配色主题。 |
| `draggable` | `boolean` | `true`(触摸) / `false`(鼠标) | 是否允许指针拖拽切换。 |
| `height` | `string \| number` | `'auto'` | 视口高度。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 整体尺寸（影响箭头/指示器）。 |
| `destroyOnInactive` | `boolean` | `false` | 非 active slide 是否卸载。 |
| `ariaLabel` | `string` | i18n 默认 | 走马灯整体可访问名称。 |

### Events
| 名称 | 回调签名 | 说明 |
|---|---|---|
| `on:change` | `(e: CustomEvent<{ activeIndex: number; preIndex: number }>)` | 激活项变化（受控同步点）。 |
| `on:beforeChange` | `(e: CustomEvent<{ from: number; to: number }>)` | 切换开始前，可 `preventDefault` 取消。 |
| `on:afterChange` | `(e: CustomEvent<{ activeIndex: number }>)` | 过渡动画结束后。 |
| `on:playStateChange` | `(e: CustomEvent<{ playing: boolean }>)` | autoplay 暂停/恢复时。 |

### Slots
| 名称 | 作用域参数 | 说明 |
|---|---|---|
| `default` | — | 放置 `<Carousel.Item>` 子项集合。 |
| `item` | `{ index: number; active: boolean }` | 单个 slide 内容（数据驱动渲染时）。 |
| `arrow` | `{ direction: 'prev' \| 'next'; disabled: boolean; onClick }` | 自定义箭头。 |
| `indicator` | `{ index: number; active: boolean; total: number; onClick }` | 自定义单个指示器。 |

## 5. 主题 / Token 表

仅消费 Alias，组件级派生 `--cd-carousel-*`，禁止写死。

| Component Token | 取值（引用 Alias） | 用途 |
|---|---|---|
| `--cd-carousel-bg` | `--cd-color-bg-0` | 视口背景（图未加载时）。 |
| `--cd-carousel-radius` | `--cd-radius-medium` | 视口圆角。 |
| `--cd-carousel-transition-duration` | `300ms`(由 `speed`/`--cd-motion-duration-mid` 派生) | slide/fade 过渡时长。 |
| `--cd-carousel-transition-easing` | `--cd-motion-easing-standard` | 过渡缓动。 |
| `--cd-carousel-arrow-bg` | `--cd-color-bg-overlay`（dark 主题） | 箭头背景。 |
| `--cd-carousel-arrow-color` | `--cd-color-text-0` / 反色 | 箭头图标色（随 theme）。 |
| `--cd-carousel-arrow-size` | `32px`(default) | 箭头命中尺寸（≥40 含 padding）。 |
| `--cd-carousel-indicator-color` | `--cd-color-fill-1` | 未激活指示器。 |
| `--cd-carousel-indicator-color-active` | `--cd-color-primary` / `light` 反色 | 激活指示器。 |
| `--cd-carousel-indicator-size` | `8px`(dot/default) | 指示器尺寸。 |
| `--cd-carousel-indicator-gap` | `--cd-spacing-2` | 指示器间距/边距。 |
| `--cd-carousel-focus-ring` | `--cd-color-primary` + `--cd-focus-ring-width` | 焦点环（箭头/指示器/视口）。 |

主题切换：`theme="light"` 时 arrow/indicator 取反色 Alias（`--cd-color-bg-0` 反相），保证覆盖在图片上对比度 ≥ 3:1（非文本图形）。所有 transition 在 reduced-motion 媒体查询下置 `--cd-carousel-transition-duration: 0ms`。

## 6. 无障碍

遵循 WAI-ARIA APG「Carousel」模式（基础轮播，不使用 tabpanel 模式以避免与 Tabs 混淆，采用 group + slide 模式）。

- 角色结构：
  - 视口容器：`role="region"`（或 `group`）+ `aria-roledescription="carousel"` + `aria-label`（i18n）。
  - 轨道内每个 slide：`role="group"` + `aria-roledescription="slide"` + `aria-label="{index} / {total}"`（i18n `Carousel.slideLabel`）。
  - 指示器组：`role="tablist"`（trigger 风格）或一组 `<button>`；每个指示器 `<button>` + `aria-label="Carousel.goToSlide"` + `aria-current="true"`（激活项）。
  - 箭头：`<button>` + `aria-label`（`Carousel.prev`/`Carousel.next`）；loop=false 到边界时 `disabled` + `aria-disabled`。
- 自动播放控制：
  - 提供可见的播放/暂停按钮（`Carousel.pause`/`Carousel.play`），满足 WCAG 2.2.2（移动/自动更新内容须可暂停）。
  - autoplay 容器 `aria-live="off"`（自动播放时）；用户手动切换后切到 `aria-live="polite"` 并经 `useLiveAnnouncer` 播报“第 X 张，共 N 张”。
  - 鼠标 hover、键盘 focus 进入容器时暂停 autoplay；移出恢复。
- 键盘交互：
  | 按键 | 行为 |
  |---|---|
  | `Tab` | 进入容器→暂停 →在“暂停按钮/上一张/下一张/指示器/active slide 内容”间移动。 |
  | `←` / `→` | 焦点在指示器或视口时切到上/下一张。 |
  | `Home` / `End` | 跳到第一/最后一张。 |
  | `Enter` / `Space` | 触发当前焦点按钮（箭头/指示器/暂停）。 |
- 焦点管理：切换后焦点保留在触发控件上（箭头/指示器），不抢焦点到 slide；非 active slide 内容 `inert`（不可 Tab 进入）。
- 对比度：箭头/指示器对底图 ≥ 3:1；激活指示器与未激活区分不仅靠颜色（尺寸/不透明度差异）。
- reduced-motion：`prefers-reduced-motion: reduce` 时——动效降级为瞬时切换；**autoplay 默认不自动启动**（需用户显式播放），符合「不强加动态内容」。
- RTL：`dir="rtl"` 时轨道平移方向、箭头图标、`←/→` 语义整体镜像；指示器顺序保持视觉从右到左。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key；索引/总数用 `Intl.NumberFormat` 格式化。

| i18n key | 默认文案（zh-CN / en） | 用途 |
|---|---|---|
| `Carousel.ariaLabel` | 走马灯 / Carousel | 容器可访问名。 |
| `Carousel.slideLabel` | 第 {index} 张，共 {total} 张 / {index} of {total} | slide 标签 + 播报。 |
| `Carousel.prev` | 上一张 / Previous slide | 左箭头。 |
| `Carousel.next` | 下一张 / Next slide | 右箭头。 |
| `Carousel.play` | 播放 / Start automatic slide show | 播放按钮。 |
| `Carousel.pause` | 暂停 / Pause automatic slide show | 暂停按钮。 |
| `Carousel.goToSlide` | 跳转到第 {index} 张 / Go to slide {index} | 指示器。 |

- `{index}`/`{total}` 经 `Intl.NumberFormat(locale)` 格式化（兼容阿拉伯语等数字系统）。
- RTL 语言由 locale 推断 `dir`，与 §6 镜像联动。
- 文案均允许外部覆盖（`locale` 字典合并）。

## 8. 文案

遵循 content-guidelines：

- 控件标签用动词短语，简洁明确：“上一张/下一张”，而非“左/右”。
- 暂停/播放按钮文案描述结果动作（“暂停” = 暂停自动播放），并随状态切换 label。
- slide 计数文案使用“第 X 张，共 N 张”自然语序，避免“X/N”这种纯符号（屏幕阅读器友好）。
- 指示器 `aria-label` 含序号，便于无障碍定位。

危险操作文案：本组件为纯展示，**无破坏性/危险操作**，故不涉及二次确认或 danger 文案。若 slide 内嵌业务操作（如“立即购买”），其文案与确认由 slide 内容自行遵循各组件规范，Carousel 不代管。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte + 消费 core） | ≤ 5.5 KB；`createCarousel` core ≤ 2.5 KB。 |
| 首屏渲染 | 默认仅渲染 active ± 1 slide（slide 模式），其余惰性挂载。 |
| 大量 slide（>20） | 启用窗口化：仅挂载可视窗口（active 前后 buffer=1），其余占位；指示器超过阈值折叠为计数。 |
| autoplay 运行时 | 用 `IntersectionObserver` 仅在视口内调度定时器；`visibilitychange` 后台暂停，避免无意义重排。 |
| 过渡 | 使用 `transform`/`opacity`（合成层），避免触发 layout；`will-change` 仅在过渡期临时加。 |
| `destroyOnInactive` | 默认 `false`；重内容 slide（视频/iframe/大图）建议开启，切走即卸载释放内存。 |
| 图片 | slide 内图片建议 `loading="lazy"` + 尺寸占位，防止 CLS。 |
| reduced-motion | 0ms 过渡，跳过 rAF 动画循环。 |

需要虚拟化：仅在 slide 数 > 20 或单 slide 重时启用窗口化；常规 Banner（≤ 8 张）全量渲染即可。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'Carousel'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Carousel'`。
- `tags: ['banner', 'slider', 'autoplay', 'gallery', 'show']`。
- `whenToUse` / `whenNotToUse`（同 §1）。
- `props` 元描述（类型、默认、约束、是否受控）与 `events`/`slots` 摘要，供 AI 生成代码补全。
- `a11yNotes`：autoplay 须配暂停按钮、reduced-motion 降级、APG carousel 模式。
- `composes`: `['useId', 'useLiveAnnouncer', 'useRovingTabindex']`。
- `tokens`: §5 列表，供主题工具消费。
- `examples`: 基础 Banner、一屏多卡、fade、自定义指示器、受控四组 minimal snippet。

## 11. 测试

- 单元（core `createCarousel`）：
  - `next/prev/goTo` 索引与 `direction` 计算；loop 边界取模；`slidesToScroll` 步进。
  - autoplay 定时调度（fake timers）、hover/focus/visibility 暂停与恢复、`isTransitioning` 抑制连点。
  - reduced-motion 注入下 autoplay 不自启、duration=0。
- 组件（svelte，Testing Library）：
  - 受控 `value` + `on:change` 同步；`beforeChange` `preventDefault` 阻止切换。
  - 指示器/箭头点击切换；箭头边界 `disabled`（loop=false）。
  - `destroyOnInactive` 卸载断言。
- a11y（axe + 手动）：role/aria-roledescription/aria-current；键盘 ←/→/Home/End/Enter/Space；焦点不被抢；`inert` 非 active slide；播报文案正确。
- 交互：指针拖拽阈值切换与回弹（Playwright 触控模拟）。
- 视觉回归：slide/fade、四种指示器位置、light/dark、RTL 镜像、reduced-motion 截图。
- 性能：>50 slide 窗口化渲染 DOM 节点数断言；后台 tab 定时器停止断言。

## 12. 验收标准 checklist

- [ ] core/svelte 分层落地，`createCarousel` 不含 DOM；svelte 仅绑定。
- [ ] Props/Events/Slots 与 §4 一致，受控 `value`+`on:change`、`open` 类语义 N/A（无浮层）。
- [ ] 一致性 API：`size`(small/default/large)、动效 slide/fade、indicator 三态形态完整。
- [ ] autoplay：interval/hover 暂停/focus 暂停/后台暂停/IntersectionObserver 视口内运行 全部生效。
- [ ] reduced-motion：过渡 0ms 且 autoplay 不自启。
- [ ] a11y：APG carousel role 结构、可见暂停按钮（WCAG 2.2.2）、键盘全交互、焦点不被抢、`inert` 非 active slide、对比度 ≥ 3:1、RTL 镜像。
- [ ] i18n：§7 全部 key 接入，无硬编码；index/total 走 `Intl.NumberFormat`。
- [ ] Token：仅消费 Alias，派生 `--cd-carousel-*`，无写死值；light/dark 反色正确。
- [ ] 性能：达成 gzip 预算、惰性/窗口化、`destroyOnInactive`、合成层过渡、图片 lazy 防 CLS。
- [ ] 提供 `component.meta.ts`（含 props/events/a11y/tokens/examples）。
- [ ] 单元 + 组件 + a11y + 视觉回归 + 性能测试全绿。
- [ ] 文档站示例：基础 Banner、一屏多卡、fade、自定义指示器/箭头、受控、reduced-motion 演示。
