# SPEC · Spin
> 分类：feedback · 阶段：M5
> 对标 Semi：Spin

## 1. 概述

Spin（加载指示器）用于在数据请求、异步操作或区块刷新期间向用户传达"系统正在处理"的状态，避免用户在等待时产生卡死错觉或重复操作。它是 chenzy-design 反馈层最高频的"过程态"组件，与 Skeleton（结构占位）形成互补：Skeleton 用于首屏/结构尚未确定的占位，Spin 用于已有结构之上的短时阻塞或长时进行态。

三种核心形态：
- 独立态（inline）：仅渲染一个旋转指示器，由调用方自由摆放。
- 包裹态（wrapper）：通过默认插槽包裹一段已有内容，加载时在其上覆盖半透明遮罩 + 居中指示器，并阻断遮罩下内容的指针事件（内容仍占位、不抖动）。
- 全屏态（fullscreen）：固定覆盖整个视口，用于全局阻塞型加载（如路由切换、首次鉴权）。

Spin 是纯反馈组件，无任何用户输入语义，但需要正确的 aria-busy / aria-live 处理以服务读屏用户，并需正确处理 reduced-motion。它本身不含可聚焦元素，全屏遮罩态不做焦点捕获（区别于 Modal），但需阻断背景滚动可选。

不做的事：进度百分比（用 Progress）、骨架占位（用 Skeleton）、按钮内联 loading（由 Button.loading 自带，但可复用 Spin 的指示器图元）。

## 2. 设计语义

- 视觉：默认指示器为圆环旋转（conic/stroke circle），尺寸随 size 联动（small 14px / default 20px / large 32px），描边宽度 = 直径 / 10，向上取整到 0.5px。颜色取 `--cd-color-primary`，轨道色取 `--cd-color-fill-1`。
- 节奏：单圈旋转周期 `--cd-spin-duration`（默认 1s linear infinite）。reduced-motion 下退化为透明度脉冲（opacity 呼吸，1.5s ease-in-out），不旋转。
- 包裹遮罩：背景 `--cd-color-bg-0` + 透明度（`--cd-spin-mask-bg`，默认 rgba 形态由 token 给出，约 80% 不透明），指示器与可选文案垂直居中堆叠，间距 `--cd-spin-tip-gap`。
- 文案（tip）：位于指示器下方，颜色 `--cd-color-text-1`，字号随 size。
- 层级：包裹遮罩 z-index = `--cd-spin-z`（局部，默认与 popup 基线对齐，wrapper 内绝对定位故无需高 z）；全屏 z = `--cd-z-spin-fullscreen`（高于内容、低于 Modal/Toast）。
- 状态可见性：仅由 `spinning` 控制显隐；显隐使用 `--cd-motion-duration-fast` 的 fade（reduced-motion 下瞬时）。
- 对比度：指示器 primary 对遮罩背景需 ≥ 3:1（非文本图形对比，WCAG 1.4.11）；tip 文本对遮罩 ≥ 4.5:1。
- RTL：组件居中布局，无方向性；tip 文本继承 `dir`，旋转方向不随 RTL 镜像（旋转无语义方向）。

## 3. 分层实现

Spin 交互极轻（无键盘、无焦点逻辑），但仍存在需要平台无关复用的逻辑：延迟显示去抖、最短显示时长、aria-live 公告。因此提供轻量 core，渲染在 svelte。

**@chenzy-design/core · `createSpin`**
- 职责：管理 `spinning` 的"有效显示态" effectiveSpinning，处理：
  - `delay`：开始加载后延迟 N ms 才显示，避免瞬时请求闪烁。
  - `minShowTime`（可选扩展）：一旦显示，至少保持 M ms，避免一闪而过。
  - 派生 `aria-busy` 值与公告文案。
- 复用原语：
  - `useId`：为 tip 文案与被包裹内容建立 `aria-describedby` 关联用的 id。
  - `useLiveAnnouncer`：加载开始/结束时向 polite live region 公告（如 "加载中" / "加载完成"），文案由 i18n 注入。
  - `useScrollLock`：仅 `fullscreen` 模式按需启用，锁定 body 滚动（默认开启，可关）。
- 不使用：useFocusTrap / useRovingTabindex / useDismiss（无聚焦、无关闭交互）。
- 输出：`{ effectiveSpinning, ariaBusy, descriptionId, announce(start|end) }`，框架无关，纯函数 + 定时器，SSR 安全（定时器仅在 client effect 内启动）。

**@chenzy-design/svelte · `Spin.svelte`**
- 消费 createSpin，负责三种形态 DOM 结构与 CSS、过渡、indicator 插槽。
- inline：`<span class="cd-spin" role="status" aria-live="polite">`。
- wrapper：外层 `cd-spin-wrapper` 相对定位，children 容器 `cd-spin__content`（spinning 时 `aria-busy="true"` + `inert`/pointer-events:none），覆盖层 `cd-spin__overlay`。
- fullscreen：`position: fixed` 覆盖层，挂载点可经 `getPopupContainer` 重定向（默认 body）。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| spinning | `boolean` | `true` | 是否处于加载态。包裹/全屏由此控制显隐 |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 指示器尺寸 |
| tip | `string` | `''` | 指示器下方提示文案；为空则不渲染文案区 |
| delay | `number` | `0` | 延迟显示毫秒数，去抖瞬时加载闪烁 |
| minShowTime | `number` | `0` | 一旦显示后的最短持续毫秒数，避免闪现 |
| wrapperClassName | `string` | `''` | 包裹容器自定义类名（wrapper 模式） |
| fullscreen | `boolean` | `false` | 全屏覆盖模式 |
| lockScroll | `boolean` | `true` | 仅 fullscreen：是否锁定 body 滚动 |
| getPopupContainer | `() => HTMLElement` | `() => document.body` | fullscreen 挂载容器 |
| spinIcon​n / indicator | `Snippet` | — | 自定义指示器（优先级高于内置） |
| childStyle | `string` | `''` | wrapper 模式下内容容器附加样式 |
| ariaLabel | `string` | i18n `Spin.loading` | 指示器无障碍标签（无 tip 时使用） |
| announceOnChange | `boolean` | `true` | spinning 变更时是否经 live region 公告 |
| zIndex | `number` | token 默认 | 覆盖层 z-index 覆写 |

说明：本组件无受控输入语义，故不涉及 value/on:change；无浮层显隐语义的 open/openChange（其显隐即 spinning，语义不同于"用户可关闭浮层"）。status 校验态不适用。

### Events

| 事件 | 载荷 | 触发时机 |
|---|---|---|
| on:show | `void` | effectiveSpinning 由 false→true（含 delay 后真正显示） |
| on:hide | `void` | effectiveSpinning 由 true→false（含 minShowTime 满足后） |

说明：Spin 无用户交互，事件仅反映"有效显示态"生命周期，便于宿主埋点或衔接动画。

### Slots（Svelte 5 Snippets）

| 名称 | 参数 | 说明 |
|---|---|---|
| default | — | 被包裹的内容（提供则进入 wrapper 模式；fullscreen 时忽略） |
| indicator | `{ size }` | 自定义旋转指示器 |
| tip | — | 自定义提示文案区（覆盖 `tip` prop 渲染） |

## 5. 主题 / Token

组件仅消费 Alias / Component 级 token，禁止写死。

| Component Token | 退化引用（Alias/Global） | 用途 |
|---|---|---|
| `--cd-spin-color` | `--cd-color-primary` | 指示器主色 |
| `--cd-spin-track-color` | `--cd-color-fill-1` | 指示器轨道色 |
| `--cd-spin-size-small` | `14px`（Global 尺度） | small 直径 |
| `--cd-spin-size-default` | `20px` | default 直径 |
| `--cd-spin-size-large` | `32px` | large 直径 |
| `--cd-spin-stroke-width` | `calc(var(--cd-spin-size) / 10)` | 描边宽度 |
| `--cd-spin-duration` | `1s` | 旋转周期 |
| `--cd-spin-duration-reduced` | `1.5s` | reduced-motion 呼吸周期 |
| `--cd-spin-tip-gap` | `--cd-spacing-2` | 指示器与 tip 间距 |
| `--cd-spin-tip-color` | `--cd-color-text-1` | tip 文本色 |
| `--cd-spin-mask-bg` | `--cd-color-bg-0` + 80% alpha | 遮罩背景 |
| `--cd-spin-mask-blur` | `0px` | 遮罩可选模糊（默认关） |
| `--cd-spin-z` | `--cd-z-overlay-local`（默认值） | wrapper 覆盖层层级 |
| `--cd-z-spin-fullscreen` | `--cd-z-popup`（高于内容低于 Modal） | 全屏层级 |
| `--cd-spin-fade-duration` | `--cd-motion-duration-fast` | 显隐淡入淡出 |

对比度约束：`--cd-spin-color` 对 `--cd-spin-mask-bg` 实际叠加后背景 ≥ 3:1；`--cd-spin-tip-color` 对遮罩 ≥ 4.5:1。暗色主题由 Alias 自动切换，无需组件改写。

## 6. 无障碍（WCAG 2.1 AA）

- **role / aria**：
  - 指示器根节点 `role="status"`（隐式 `aria-live="polite"`、`aria-atomic="true"`），保证状态文本变化被读屏宣告。
  - wrapper 模式：被包裹内容容器在 spinning 时设 `aria-busy="true"`，加载结束置 `false`，提示辅助技术该区域正在更新。
  - tip 存在时，指示器 `aria-label` 不重复设置，由可见 tip 文本作为可访问名；无 tip 时使用 `ariaLabel`（i18n `Spin.loading`）。
  - 纯装饰的内置 SVG/圆环加 `aria-hidden="true"`，无障碍名仅来自 status 容器文本/label。
- **焦点管理**：组件无可聚焦元素，不抢占焦点。wrapper 内容在 spinning 时通过 `inert`（或 `pointer-events:none` + `tabindex` 移除回退）阻止与不可用内容交互，避免键盘 Tab 进入被遮罩的失效区域。fullscreen 不做焦点捕获（非模态对话），但若 `lockScroll`，恢复时不移动焦点。
- **键盘交互**：无（无交互元素）。fullscreen 不拦截 Esc（无关闭语义）。
- **公告时序**：start 公告延迟到 effectiveSpinning 真正为 true 时发出（与 delay 一致），end 在隐藏时发出 "加载完成"，避免对极短加载产生噪音公告（minShowTime 也抑制）。
- **对比度**：见第 5 节图形 ≥ 3:1、文本 ≥ 4.5:1。
- **reduced-motion**：`@media (prefers-reduced-motion: reduce)` 下旋转动画替换为低频透明度呼吸；显隐 fade 改为瞬时。
- **RTL**：布局居中无镜像需求，tip 随 `dir` 自然换行对齐；旋转方向保持不变（无方向语义）。

## 7. 国际化

- 用户可见文案零硬编码，全部经 i18n provider 注入；日期/数字本组件不涉及（无 Intl 需求）。
- i18n keys：

| key | 默认（zh-CN） | 用途 |
|---|---|---|
| `Spin.loading` | 加载中 | 无 tip 时的 aria-label / 公告起始文案 |
| `Spin.loaded` | 加载完成 | 公告结束文案 |

- `tip` prop 由调用方自行国际化（属业务文案），组件不代管，但 `ariaLabel` 缺省回退到 `Spin.loading`。
- 公告文案取自 i18n，随 locale 切换；RTL locale 文本方向由容器 `dir` 决定。

## 8. 文案

- 遵循 content-guidelines：加载文案使用简短进行时，首字大写（en）/无句末标点。示例 tip："加载中"/"Loading"，避免"请稍候，正在拼命加载…"等冗长口语。
- 默认 aria 文案 `Spin.loading` = "加载中"；结束 `Spin.loaded` = "加载完成"，简洁、客观、无情绪化措辞。
- 危险操作文案：**不适用**。Spin 为只读过程态，不触发任何破坏性动作，无需危险确认文案。
- 长时加载建议宿主在 tip 中提供具体上下文（如"正在导入数据"），但应避免承诺时间。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| svelte 组件 gzip | ≤ 2.6 KB | 含三形态 DOM + CSS-in-token |
| core `createSpin` gzip | ≤ 0.6 KB | 仅定时器/派生逻辑 |
| 首次渲染（inline） | < 1 帧 | 纯 CSS 动画，无 JS 逐帧 |
| 旋转动画成本 | 0 主线程 | 用 CSS `transform: rotate` + GPU 合成层，无 requestAnimationFrame |
| spinning 切换 | < 4ms | 仅切换 class/属性，无重排（wrapper 用 overlay 不改 content 布局） |
| 全屏挂载 | 一次 portal append | getPopupContainer 复用，卸载即移除节点 |

- 不需要虚拟化（无列表）。
- 惰性渲染：wrapper 的 overlay 在 `effectiveSpinning=false` 时不渲染 DOM（`destroyOnClose` 语义默认开启），仅保留 content；fullscreen 节点在隐藏时从 portal 卸载，避免遗留固定层拦截事件。
- delay/minShowTime 用于减少高频请求场景下的 DOM 抖动与公告噪音。
- 动画使用 `will-change: transform` 谨慎施加，仅在 spinning 期间，结束移除以释放合成层。

## 10. AI 元数据

提供 `component.meta.ts`，导出标准元数据供 AI/文档/低代码消费：
- `name: 'Spin'`、`category: 'feedback'`、`stage: 'M5'`、`semiEquivalent: 'Spin'`。
- `capabilities: ['inline','wrapper','fullscreen','delay','reduced-motion','aria-busy']`。
- `props` schema（类型、默认、枚举、是否受控——本组件 none）、`events`、`slots` 镜像第 4 节。
- `a11y: { role: 'status', live: 'polite', busy: 'aria-busy on wrapped content', focusTrap: false }`。
- `tokens`: 第 5 节 token 列表（含退化引用），供主题工具校验。
- `i18nKeys: ['Spin.loading','Spin.loaded']`。
- `antiPatterns`: ['用 Spin 表达进度百分比（改用 Progress）','首屏结构占位（改用 Skeleton）','在 Spin 内放可聚焦交互元素']。
- `examples`: inline / wrapper-over-card / fullscreen-route 三段最小用法。

## 11. 测试

- **单元（core）**：
  - delay：spinning=true 后 < delay 不显示，≥ delay 显示。
  - minShowTime：显示后立即 spinning=false，仍保持至 minShowTime。
  - delay + 快速取消：在 delay 内取消则从不显示、不公告。
  - ariaBusy 派生、descriptionId 稳定（SSR/CSR 一致）。
  - announce(start/end) 在 announceOnChange=false 时不调用 announcer。
- **组件（svelte）**：
  - 三形态快照（inline/wrapper/fullscreen）。
  - wrapper：spinning 时 content `aria-busy="true"` 且 `inert`/pointer-events 阻断；结束恢复。
  - fullscreen：挂载到 getPopupContainer，卸载后无残留节点；lockScroll 切换 body overflow。
  - 自定义 indicator / tip snippet 覆盖内置。
- **a11y**：axe 无违规；role=status + live region 文本变更被宣告（用 a11y testing-lib 断言）；contrast token 校验（图形 3:1 / 文本 4.5:1）。
- **视觉回归**：default/暗色 × small/default/large × inline/wrapper 截图。
- **reduced-motion**：媒体查询模拟下断言无 rotate 关键帧、改用 opacity 动画。
- **SSR**：服务端渲染无 window 访问；hydration 不警告；定时器仅 client 启动。

## 12. 验收标准 checklist

- [ ] 三形态（inline / wrapper / fullscreen）均按 spec 渲染且可切换。
- [ ] `spinning` 控制显隐；`delay` 与 `minShowTime` 行为符合单测。
- [ ] wrapper 模式：加载时内容不抖动、不可交互（inert / pointer-events）、`aria-busy` 正确切换。
- [ ] fullscreen：portal 挂载/卸载干净，无残留拦截层；`lockScroll` 默认开启且可关。
- [ ] 指示器与文案仅消费 `--cd-spin-*` / Alias token，无写死颜色或尺寸值。
- [ ] role=status + aria-live=polite；无 tip 时 ariaLabel 回退 `Spin.loading`；公告时序符合 delay/minShowTime。
- [ ] reduced-motion 下退化为透明度呼吸，显隐瞬时；RTL 文本方向正确、旋转不镜像。
- [ ] 对比度：指示器对遮罩 ≥ 3:1，tip 文本 ≥ 4.5:1（亮/暗主题均达标）。
- [ ] 用户可见文案零硬编码，`Spin.loading` / `Spin.loaded` 可随 locale 切换。
- [ ] 提供 `component.meta.ts` 且字段与本 SPEC 第 4/5/7 节一致。
- [ ] gzip 预算达标（svelte ≤ 2.6KB，core ≤ 0.6KB）；旋转动画零主线程逐帧成本。
- [ ] headless 逻辑位于 `@chenzy-design/core` 的 `createSpin`，渲染位于 `@chenzy-design/svelte`，复用 useId/useLiveAnnouncer/useScrollLock 原语。
- [ ] 单元 / 组件 / a11y / 视觉回归 / SSR 测试全部通过。
