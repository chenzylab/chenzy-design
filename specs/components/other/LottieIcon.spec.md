# SPEC · LottieIcon
> 分类：other · 阶段：M6
> 对标 Semi：LottieIcon（Semi Icons 体系下的 Lottie 动画图标扩展，对齐 `@douyinfe/semi-icons-lab` 的动态图标用法）

## 1. 概述

`LottieIcon` 用于在界面中渲染基于 Lottie（Bodymovin JSON）的矢量动画图标，典型场景为：导航菜单 hover/active 时的微动效、加载/成功/失败状态反馈、空状态插画级图标、引导高亮。它是 `Icon` 的动态扩展：静态图标用 `Icon`，需要播放/暂停/循环/方向控制的图标用 `LottieIcon`。

核心能力：
- 接受 Lottie JSON 数据（`data`）或远程地址（`src`，惰性 fetch + 缓存）。
- 播放控制：`autoplay` / `loop` / `speed` / `direction`，命令式 `play()/pause()/stop()/seek()`。
- 触发模式 `trigger`：`auto`（挂载即按 autoplay）、`hover`、`click`、`visible`（进入视口播放）、`manual`（仅命令式）。
- 段播放 `segments`（指定帧区间），用于把"待机/激活/退出"塞进同一份 JSON。
- 尺寸与色彩：`size` 映射到字号体系；`color` 通过 CSS 变量注入到可着色图层。
- 关键降级：尊重 `prefers-reduced-motion: reduce` 时不播放动画，渲染首帧或指定的 `staticFrame` 静态画面；同时支持运行时 `reducedMotion` 强制开关。
- 渲染器在 SVG / Canvas 间可选（`renderer`），默认 SVG 以获得最佳清晰度与可着色性。

不在范围内：通用 SVG 图标集（用 `Icon`）、视频/GIF 播放（用 `Image`/媒体组件）、复杂时间线编排（交由业务层用命令式 API 自行编排）。

## 2. 设计语义

- 尺寸 `size`：`small=16px` / `default=20px` / `large=24px`，并接受具体数值（px）。图标盒子为正方形，`width=height=size`，`--cd-lottieicon-size` 控制。
- 色彩：仅对"单色/可着色"Lottie 生效，通过 `--cd-lottieicon-color` 写入并由 JSON 中绑定到 `currentColor` 的图层消费；多色插画型 Lottie 忽略 `color`。默认 `--cd-color-text-0`。
- 状态语义：装饰性图标（`decorative=true`，默认）不承载语义，`aria-hidden`；功能性图标（`decorative=false`）必须给 `label`，对比度遵循非文本对比 ≥ 3:1。
- 动效语义：动画为"强化反馈"而非"承载信息"——任何由动画传达的状态必须有非动画的等价表达（文本/静态图标/颜色），保证 reduced-motion 下信息不丢失。
- 留白与对齐：图标基线与相邻文本视觉居中对齐（`vertical-align: -0.125em` 量级，通过 token 调），不引入额外外边距。
- RTL：方向性图标（箭头、返回）在 RTL 下应水平镜像，由 `flipRtl` 控制；非方向性图标不镜像。

## 3. 分层实现

存在交互（hover/click/visible 触发）、生命周期管理（加载、播放器实例销毁）与 a11y/降级逻辑，因此采用 core + svelte 分层。

`@chenzy-design/core` → `createLottieIcon(options)`（headless，框架无关）：
- 管理播放器抽象 `LottiePlayerAdapter`（默认适配 `lottie-web`，懒加载，运行时 `import()`），暴露 `load/play/pause/stop/seek/setSpeed/setDirection/setSegments/destroy`。
- 触发状态机：依据 `trigger` 决定何时 play/pause；`visible` 借助 `IntersectionObserver`（封装为 `useVisible` 原语，无则降级为 auto）。
- reduced-motion 决策：合并 `prefers-reduced-motion`（`matchMedia`，监听变化）与传入 `reducedMotion`，产出 `effectiveAnimated` 与 `targetFrame`（reduced 时定位 `staticFrame`/首帧并 `pause`）。
- 资源：`src` 经内置 LRU 缓存避免重复 fetch；并发去重（同 URL 共享 in-flight Promise）。
- 复用原语：`useId`（生成 `aria-labelledby` 关联 id）、`useLiveAnnouncer`（功能性状态图标可选播报）。不需要 FocusTrap/RovingTabindex/ScrollLock（非浮层、非焦点容器）。

`@chenzy-design/svelte` → `<LottieIcon>`：
- 渲染 `<i class="cd-lottieicon">` 容器 + 内部挂载点；将 core 的状态/命令绑定到 DOM 与 `lottie-web` 实例。
- 把 props 透传给 `createLottieIcon`，订阅 store 输出 `effectiveAnimated`、`status`、`isPlaying`。
- 暴露命令式实例方法（通过 `bind:this` 或 `getInstance()`）：`play/pause/stop/seek`。
- `onDestroy` 调用 `destroy()` 释放 player；`destroyOnHide`（配合 `visible` trigger）可在离开视口时销毁实例省内存。
- SSR：服务端只渲染静态占位（首帧 SVG 或骨架方块），player 仅在 `onMount` 客户端初始化。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `data` | `object` | — | 内联 Lottie JSON 数据；与 `src` 二选一，`data` 优先 |
| `src` | `string` | — | 远程 Lottie JSON 地址（惰性 fetch + 缓存） |
| `size` | `'small' \| 'default' \| 'large' \| number` | `'default'` | 尺寸，数值为 px |
| `color` | `string` | — | 可着色图层颜色，默认继承 `--cd-color-text-0` |
| `trigger` | `'auto' \| 'hover' \| 'click' \| 'visible' \| 'manual'` | `'auto'` | 播放触发方式 |
| `autoplay` | `boolean` | `true` | `trigger='auto'` 时是否挂载即播 |
| `loop` | `boolean \| number` | `true` | 是否循环；数值表示循环次数 |
| `speed` | `number` | `1` | 播放速度倍率 |
| `direction` | `1 \| -1` | `1` | 播放方向，`-1` 反向 |
| `segments` | `[number, number] \| Array<[number, number]>` | — | 播放帧区间 |
| `renderer` | `'svg' \| 'canvas'` | `'svg'` | 渲染器 |
| `staticFrame` | `number` | `0` | reduced-motion/暂停时定位的帧 |
| `reducedMotion` | `boolean` | — | 强制开关；未设时跟随系统 `prefers-reduced-motion` |
| `decorative` | `boolean` | `true` | 是否为装饰性（决定 `aria-hidden`） |
| `label` | `string` | — | 功能性图标的无障碍名称（`decorative=false` 必填） |
| `flipRtl` | `boolean` | `false` | RTL 下水平镜像 |
| `destroyOnHide` | `boolean` | `false` | 配合 `trigger='visible'`，离开视口销毁 player |
| `lazyVisible` | `boolean` | `true` | 仅 `trigger='visible'` 时进入视口才加载/初始化 |
| `class` | `string` | — | 透传根节点类名 |
| `style` | `string` | — | 透传根节点内联样式 |

### Events

| 名称 | 载荷 (`event.detail`) | 触发时机 |
|---|---|---|
| `on:load` | `{ totalFrames: number }` | Lottie 数据加载并初始化完成 |
| `on:loadError` | `{ error: Error }` | `src` fetch 或 JSON 解析失败 |
| `on:play` | `void` | 开始播放 |
| `on:pause` | `void` | 暂停 |
| `on:stop` | `void` | 停止并归位 |
| `on:complete` | `void` | 非循环播放结束（或 loop 次数用尽） |
| `on:loopComplete` | `{ count: number }` | 每完成一次循环 |
| `on:reducedMotionChange` | `{ animated: boolean }` | 有效降级状态变化（系统或 props 触发） |

### Slots

| 名称 | 作用域参数 | 说明 |
|---|---|---|
| `fallback` | `{ status: 'loading' \| 'error' }` | 加载中/失败时的占位内容（默认：loading 显示骨架方块，error 显示静态降级图标） |
| `reducedStatic` | — | reduced-motion 下替代渲染的静态内容（覆盖默认首帧/`staticFrame`） |

注：组件无默认 children slot（内容由 Lottie 数据决定）。命令式 API（`play/pause/stop/seek/getInstance`）通过组件实例暴露，非 slot/prop。

## 5. 主题 / Token 表

组件仅消费 Alias 与 Component 级 token，禁止写死值。

| Component Token | 回退 / 引用 | 用途 |
|---|---|---|
| `--cd-lottieicon-size` | `20px`（default，由 `size` 映射 small=16/large=24） | 图标盒子宽高 |
| `--cd-lottieicon-color` | `var(--cd-color-text-0)` | 可着色图层颜色（注入为 `currentColor`） |
| `--cd-lottieicon-color-hover` | `var(--cd-color-primary)` | `trigger='hover'` 时的着色（可选） |
| `--cd-lottieicon-bg-skeleton` | `var(--cd-color-bg-1)` | loading 占位骨架背景 |
| `--cd-lottieicon-radius` | `var(--cd-radius-small)` | 占位/容器圆角 |
| `--cd-lottieicon-error-color` | `var(--cd-color-danger)` | error 降级图标颜色 |
| `--cd-lottieicon-valign` | `-0.125em` | 与文本基线对齐偏移 |

说明：色彩链路 Global → Alias（`--cd-color-text-0` / `--cd-color-primary` / `--cd-color-danger` / `--cd-color-bg-1`）→ Component（`--cd-lottieicon-*`）。深色主题无需组件改动，随 Alias 切换。

## 6. 无障碍（WCAG 2.1 AA）

- 角色与命名：
  - `decorative=true`（默认）：根节点 `aria-hidden="true"`，对 AT 完全隐藏，不暴露 player 内部 SVG。
  - `decorative=false`：根节点 `role="img"` + `aria-label`（或 `aria-labelledby` 关联由 `useId` 生成的隐藏文本节点，文案来自 `label`）。
- 动画与 reduced-motion（关键）：尊重 `prefers-reduced-motion: reduce` → 不自动播放、不循环；渲染 `staticFrame`/`reducedStatic`。系统设置变化经 `matchMedia` 监听实时生效，并发 `on:reducedMotionChange`。即使非降级场景，自动循环动画也不应有强闪烁（≤ 3 次/秒，规避光敏性 2.3.1）。
- 非文本对比（1.4.11）：功能性图标关键轮廓与背景对比 ≥ 3:1。
- 焦点：组件自身不可聚焦（非交互控件）；`trigger='hover'/'click'` 仅为视觉强化，真正的可点击行为应由外层 `Button`/链接承担并提供键盘可达性——本组件不抢占 tab 序，不绑定 `tabindex`。
- 状态等价：动画承载的状态（如"成功"）须由 `label`/外部文本同时表达，AT 用户不依赖动画。
- 键盘交互：无（非焦点目标）。若业务把它放进可点击容器，键盘语义由容器负责。
- RTL：`flipRtl=true` 时对方向性图标做 `transform: scaleX(-1)`，对应 `dir="rtl"`。

## 7. 国际化

- 用户可见文案零硬编码，经 i18n 注入。i18n key：

| key | 用途 | 默认（en / zh） |
|---|---|---|
| `LottieIcon.loading` | loading 占位的 `aria-label`/SR 文本 | `Loading animation` / `动画加载中` |
| `LottieIcon.loadError` | error 降级的 SR 文本 | `Failed to load animation` / `动画加载失败` |
| `LottieIcon.label` | 功能性图标默认名称回退（建议业务覆盖） | `Icon` / `图标` |

- `label` prop 由业务传入并应已本地化；组件不翻译 `label` 内容，仅在缺省时回退到 `LottieIcon.label`。
- 无日期/数字格式化需求；如未来暴露循环计数等可见数字，使用 `Intl.NumberFormat`。

## 8. 文案

- 遵循 content-guidelines：占位与错误文案简短、客观、不指责。
- loading：用现在进行式描述对象（"动画加载中"），不加省略号堆叠。
- error：陈述结果而非内部细节（"动画加载失败"），不暴露 URL/堆栈给最终用户。
- `label`：用名词短语描述图标语义（"成功""收藏"），动效相关词（"播放中"）不进入无障碍名称，避免冗余播报。
- 危险操作文案：本组件无危险操作（纯展示/反馈），不涉及确认/删除类文案。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 策略 |
|---|---|
| 组件自身 gzip | ≤ 2.5KB（svelte 渲染层 + core 状态机，不含 player） |
| `lottie-web` | 不打入主包；运行时 `import()` 懒加载，首个 LottieIcon 挂载时才拉取（~ 60KB gzip，由消费方知晓并可替换 adapter） |
| `src` 数据 | 惰性 fetch + LRU 缓存 + 同 URL 并发去重；建议单文件 < 50KB |
| 初始化 | `trigger='visible'` + `lazyVisible` 默认避免首屏初始化离屏图标 |
| 渲染器 | 默认 SVG；大量同屏实例或复杂路径时建议 `canvas` 降低 DOM 节点与重排 |
| 内存 | `destroyOnHide` 在长列表中离屏销毁 player；`onDestroy` 必释放，杜绝泄漏 |
| reduced-motion | 降级时不创建/不运行 RAF 循环，仅渲染静态帧，CPU≈0 |
| 列表场景 | 同屏 > 20 个动态图标建议虚拟化外层列表，并优先 `trigger='hover'/'visible'` 避免全部自动播放 |

虚拟化/惰性：列表交由外层虚拟化；组件内置 `lazyVisible`（惰性初始化）与 `destroyOnHide`（等价 destroyOnClose）。

## 10. AI 元数据

提供 `component.meta.ts`，导出 `LottieIconMeta`，包含：
- `name: 'LottieIcon'`、`category: 'other'`、`stage: 'M6'`、`semiEquivalent: 'LottieIcon'`。
- `tags: ['icon','animation','lottie','reduced-motion','feedback']`。
- `props` schema（类型、默认、枚举、必填规则：`data|src` 至少其一、`decorative=false` 时 `label` 必填）。
- `events`/`slots`/`imperativeMethods`（`play/pause/stop/seek/getInstance`）描述。
- `a11y`: `{ reducedMotion: true, role: 'img|none', requiresLabelWhenInteractive: false }`。
- `whenToUse` / `whenNotToUse`（vs `Icon` / `Image`）、`examples`（auto、hover、visible+lazy、reduced-motion 降级、功能性带 label）。
- `tokens`: 上述 `--cd-lottieicon-*` 列表，供主题 AI 推断。

## 11. 测试

- 单元（core）：触发状态机（auto/hover/click/visible/manual 各自的 play/pause 时序）；reduced-motion 决策合并（系统 reduce × props × 变化事件）；LRU 缓存命中与并发去重；`segments`/`direction`/`speed` 透传到 adapter（mock player）。
- 组件（svelte）：props → DOM/实例绑定；`decorative` 切换 `aria-hidden` vs `role=img`+label；`fallback`/`reducedStatic` slot 渲染；命令式 `play/pause/stop/seek` 生效；`onDestroy` 调用 `destroy()`（无泄漏）。
- a11y：jest-axe 在 decorative 与 functional 两态零违规；模拟 `matchMedia(reduce)` 断言不播放且渲染静态帧并触发 `on:reducedMotionChange`。
- 集成：`src` 加载成功/失败（`on:load`/`on:loadError`）；`trigger='visible'` 用 IntersectionObserver mock 验证进入视口才播放/加载；`destroyOnHide` 离屏销毁。
- 视觉回归：small/default/large × svg/canvas × 首帧/降级静态帧快照；RTL `flipRtl` 镜像。
- SSR：服务端渲染仅出静态占位、无 player 初始化、hydrate 后正常播放。

## 12. 验收标准 checklist

- [ ] `data` 与 `src` 二选一可用，`data` 优先；`src` 惰性 fetch + LRU 缓存 + 并发去重。
- [ ] 五种 `trigger`（auto/hover/click/visible/manual）行为正确，`visible` 缺 IO 时降级 auto。
- [ ] `prefers-reduced-motion: reduce` 下不自动播放/不循环，渲染 `staticFrame`/`reducedStatic`，系统变化实时生效并发 `on:reducedMotionChange`。
- [ ] `reducedMotion` props 可覆盖系统设置。
- [ ] `decorative=true` → `aria-hidden`；`decorative=false` 必填 `label` 并暴露 `role="img"`+可访问名（`useId` 关联）。
- [ ] `size` 三档 + 数值生效；`color` 仅对可着色图层生效且经 `--cd-lottieicon-color`。
- [ ] 命令式 `play/pause/stop/seek/getInstance` 可用；`onDestroy`/`destroyOnHide` 释放 player 无内存泄漏。
- [ ] 仅消费 Alias/Component token，无写死颜色/尺寸；深色主题随 Alias 切换。
- [ ] `lottie-web` 运行时懒加载、不进主包；组件自身 gzip ≤ 2.5KB。
- [ ] 用户可见文案全部经 i18n（`LottieIcon.loading/loadError/label`），`label` 不被二次翻译。
- [ ] `flipRtl` 在 RTL 下正确镜像方向性图标。
- [ ] 提供 `component.meta.ts`（`LottieIconMeta`），含 props/events/slots/imperativeMethods/a11y/tokens。
- [ ] 测试覆盖：core 状态机、a11y(jest-axe)、reduced-motion、加载成功/失败、SSR、视觉回归全部通过。
