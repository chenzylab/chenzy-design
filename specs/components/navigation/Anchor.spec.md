# SPEC · Anchor
> 分类：navigation · 阶段：M3
> 对标 Semi：Anchor

## 1. 概述

Anchor（锚点导航）用于在长页面内提供章节级目录与快速跳转能力，并在滚动时自动高亮当前可视区域对应的锚点项。典型场景：长文档/详情页右侧目录、Setting 页分组导航、API 文档侧栏。

核心能力：
- 多级锚点（嵌套 `AnchorLink`），点击平滑滚动到目标节点。
- 滚动联动高亮（scroll-spy）：基于 IntersectionObserver 监听目标元素，计算「当前激活项」并高亮。
- 跟随滑块（rail/ink bar）随激活项移动。
- 支持自定义滚动容器（默认 `window`）、滚动偏移 `offsetTop`（避开固定头部）、`bounds`（边界阈值）。
- 受控/非受控当前激活项（`value` + `on:change`）。
- 可选锚点变更同步到地址栏 hash。

与原生 `<a href="#id">` 的差异：Anchor 接管滚动行为（平滑 + 偏移）、提供受控高亮、跨容器联动，并保证键盘与读屏可用。

边界说明：Anchor 只负责「页面内导航」，不负责路由级导航（那是 Menu/Breadcrumb 的职责）；不渲染目标内容本身。

## 2. 设计语义

- **结构**：根容器 `cd-anchor` + 滑轨 `cd-anchor__rail`（含跟随滑块 `cd-anchor__ink`）+ 链接列表 `cd-anchor__list` > 链接项 `cd-anchor__link`（激活态 `cd-anchor__link--active`，嵌套层级 `cd-anchor__link--level-{n}`）。
- **视觉态**：default / hover / active（当前章节）/ focus-visible / disabled。active 项左侧滑块对齐文本基线，使用 `--cd-color-primary`。
- **方位语义**：`position: sticky`（默认）使 Anchor 在滚动中固定；`affix` 控制是否启用 sticky。`direction: vertical | horizontal`，水平模式滑块改为底部下划线。
- **层级缩进**：每级缩进步进由 `--cd-anchor-indent` 控制，保证嵌套可读。
- **滑块动效**：滑块位移使用 transform 过渡（≤ 200ms，ease-out）；`prefers-reduced-motion` 下取消位移过渡与平滑滚动，改为瞬时跳转。
- **尺寸**：`size: small | default | large` 影响行高、字号、内边距，不影响逻辑。

## 3. 分层实现

属于「有交互/键盘/a11y/滚动监听逻辑」的组件，采用 headless 分层。

- **@chenzy-design/core · `createAnchor`**：
  - 维护链接注册表（link id → target selector/element、level、disabled）。
  - scroll-spy 引擎：用 `IntersectionObserver` 观察所有 target；在多个相交时按「距容器顶部 + offsetTop 最近且 ≥ 阈值」决策唯一 active，避免抖动；提供 `bounds` 容差。
  - 滚动调度：`scrollTo(id)` 计算目标 top - offsetTop，按 `prefers-reduced-motion` 选择 `behavior: smooth | auto`，写入 hash（可选）。
  - 受控协调：合并外部 `value` 与内部 spy 结果，发 `change`。
  - 复用 core 原语：`useId`（生成 link/region 关联 id）、`useRovingTabindex`（链接列表方向键移动焦点）、`useLiveAnnouncer`（可选播报当前章节，默认关闭）。
  - 不依赖 DOM 渲染，暴露 `getLinkProps/getRootProps/getInkStyle/registerLink/scrollTo` 与 store（`activeId`、`inkRect`）。
- **@chenzy-design/svelte · `Anchor` / `AnchorLink`**：
  - 消费 `createAnchor` store，渲染 DOM、绑定事件、计算滑块 `transform`。
  - `AnchorLink` 通过 context 向上注册自身（`href`/`title`/`disabled`），支持插槽嵌套实现多级。
  - 处理 `affix`（sticky）与自定义 `getContainer`。
- 复用：`useScrollLock`/`useFocusTrap`/`useDismiss` 不适用（无浮层），不引入。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string` | — | 受控的当前激活 link key（href/id）。配合 `on:change`。 |
| `defaultValue` | `string` | — | 非受控初始激活项。 |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | 排列方向；水平模式滑块为下划线。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸。 |
| `affix` | `boolean \| { offsetTop?: number; offsetBottom?: number }` | `true` | 是否 sticky 固定及偏移。 |
| `offsetTop` | `number` | `0` | 滚动/高亮计算的顶部偏移（避开固定头部），单位 px。 |
| `bounds` | `number` | `5` | scroll-spy 触发的边界容差（px）。 |
| `targetOffset` | `number` | `offsetTop` | 点击滚动时的额外目标偏移，缺省继承 `offsetTop`。 |
| `getContainer` | `() => HTMLElement \| Window` | `() => window` | 自定义滚动监听/滚动容器。 |
| `showInk` | `boolean` | `true` | 是否显示跟随滑块。 |
| `scrollMotion` | `boolean` | `true` | 点击是否平滑滚动（reduced-motion 下强制 false）。 |
| `updateHash` | `boolean` | `true` | 激活变更时是否同步 location.hash（不触发跳转）。 |
| `class` | `string` | — | 根节点附加类名。 |

#### AnchorLink Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `href` | `string` | 必填 | 目标锚点，如 `#section-1`，作为 link key。 |
| `title` | `string` | — | 链接显示文本（也可用默认插槽）。 |
| `disabled` | `boolean` | `false` | 禁用该链接（不可点击/不参与高亮）。 |
| `target` | `string \| HTMLElement` | 由 `href` 解析 | 显式指定滚动目标，覆盖按 href 查找。 |

### Events

| Event | Payload | 说明 |
|---|---|---|
| `on:change` | `{ value: string; prevValue?: string }` | 激活项变更（点击或 scroll-spy 触发）。 |
| `on:click` | `{ value: string; href: string; event: MouseEvent }` | 用户点击某 link（可 `preventDefault` 阻止默认滚动）。 |
| `on:scrollEnd` | `{ value: string }` | 平滑滚动到目标完成。 |

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| `default`（Anchor） | — | 放置 `AnchorLink` 列表（支持嵌套）。 |
| `default`（AnchorLink） | `{ active: boolean }` | 链接内容；嵌套子 `AnchorLink` 形成多级。 |
| `ink`（Anchor） | `{ rect: { top: number; height: number } }` | 自定义滑块渲染。 |

## 5. 主题 / Token

组件仅消费 Alias / Component 级 Token，禁止写死值。

| Component Token | 回退（Alias） | 用途 |
|---|---|---|
| `--cd-anchor-color-text` | `--cd-color-text-1` | 链接默认文本色。 |
| `--cd-anchor-color-text-hover` | `--cd-color-text-0` | hover 文本色。 |
| `--cd-anchor-color-active` | `--cd-color-primary` | 激活文本与滑块色。 |
| `--cd-anchor-color-disabled` | `--cd-color-text-2` | 禁用链接色。 |
| `--cd-anchor-rail-color` | `--cd-color-border` | 滑轨底色。 |
| `--cd-anchor-ink-width` | `2px` (Global) | 滑块（下划线/竖条）粗细。 |
| `--cd-anchor-indent` | `16px` (Global) | 每级缩进步进。 |
| `--cd-anchor-link-padding-y` | `4px / 6px / 8px` (按 size) | 链接纵向内边距。 |
| `--cd-anchor-font-size` | `--cd-font-size-小/中/大` | 链接字号。 |
| `--cd-anchor-focus-ring` | `--cd-color-primary` | focus-visible 描边色。 |

- 对比度：active（primary）与背景、default 文本（text-1）对背景均需 ≥ 4.5:1（AA）。
- reduced-motion：滑块 transform 过渡与平滑滚动关闭。
- RTL：竖直滑块靠 inset-inline-start，缩进用 padding-inline-start；水平模式顺序随 `dir` 翻转。

## 6. 无障碍

遵循 WAI-ARIA APG（导航 + 链接组合）。

- **role / 结构**：根 `<nav aria-label="...">`（`Anchor.ariaLabel`）。链接列表用 `<ul>/<li>`，链接为原生 `<a href="#id">`（保留浏览器语义与右键能力）。激活项加 `aria-current="location"`。
- **键盘**：
  - `Tab` 进入链接列表（roving tabindex：列表整体一个 Tab stop，方向键移动）。
  - `↑/↓`（vertical）或 `←/→`（horizontal）在链接间移动焦点（`useRovingTabindex`）。
  - `Home/End` 跳到首/末链接。
  - `Enter/Space` 激活当前焦点链接并滚动。
- **焦点管理**：点击/键盘激活后焦点保留在链接上（不抢焦点到目标区）；可选 `focusTarget` 行为下将焦点移至目标容器（需 `tabindex="-1"`）以便读屏继续阅读。
- **滚动联动播报**：默认不打扰；开启 `announce` 时用 `useLiveAnnouncer`（polite）播报「当前：<章节名>」，节流避免刷屏。
- **对比度 / reduced-motion / RTL**：见第 5 节；focus-visible 必须有可见描边，不依赖颜色单一区分。
- disabled 链接：`aria-disabled="true"` 且从 roving 序列移除。

## 7. 国际化

- 用户可见文案零硬编码，经 i18n provider 注入。
- i18n key：
  - `Anchor.ariaLabel`（默认 "页面导航" / "Page navigation"，根 nav 标签）。
  - `Anchor.currentAnnounce`（播报模板，含 `{title}` 占位）。
- 链接 `title` 由业务传入，不属于库内置文案。
- 数字/偏移为像素值，无需 Intl；若未来展示「第 N 节」序号，用 `Intl.NumberFormat` 本地化。
- RTL：方向键语义与滑块定位随 `dir` 自适应（见第 6/5 节）。

## 8. 文案

- 遵循 content-guidelines：链接文本用名词短语、简洁、与目标标题一致，建议 ≤ 20 字符，避免「点击这里」。
- nav `aria-label` 简洁描述用途（"页面导航"），不重复页面标题。
- 播报文案保持「当前：<章节>」一致句式。
- **危险操作文案**：Anchor 为纯导航组件，不涉及任何破坏性/不可逆操作，无危险文案。

## 9. 性能

| 维度 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte） | ≤ 4.5 KB（双 API + railTheme/size/disabled + showTooltip 承载 Tooltip/Popover + autoCollapse 后按实测校准） |
| gzip 体积（core `createAnchor`） | ≤ 2.5 KB |
| scroll-spy 机制 | `IntersectionObserver`（非 scroll 事件轮询），O(可见项) 计算。 |
| scroll 兜底 | 仅在需要滑块位置更新时监听 scroll，`requestAnimationFrame` 节流；passive listener。 |
| resize | `ResizeObserver` 监听容器/目标，rAF 重算滑块矩形。 |
| 大量链接 | 锚点通常 < 50 项，不需虚拟化；> 200 项时建议业务分组。 |
| 惰性 | Observer 仅在挂载且目标存在时创建；卸载时 `disconnect`。 |
| destroyOnClose | 不适用（无浮层显隐）。 |

关键运行时场景：连续滚动时单帧内最多一次 active 重算 + 一次滑块 transform 写入，无强制同步布局抖动（读写分离，rAF 内批量读取 rect）。

## 10. AI 元数据

提供 `component.meta.ts`，内容包括：
- `name: 'Anchor'`、`category: 'navigation'`、`stage: 'M3'`、`semiEquivalent: 'Anchor'`。
- `subComponents: ['AnchorLink']`。
- `props`/`events`/`slots` 的机器可读 schema（类型、默认值、枚举、必填）。
- `apiConventions: { controlled: 'value+on:change', size: ['small','default','large'] }`。
- `a11y: { roles: ['navigation','link'], ariaCurrent: 'location', keyboard: ['Arrow','Home','End','Enter','Space'], apg: 'navigation' }`。
- `tokens`：第 5 节 Token 清单。
- `whenToUse` / `whenNotToUse`（vs Menu/Breadcrumb）。
- `examples`：基础目录、自定义容器、水平锚点、受控高亮。

## 11. 测试

- **单元（core）**：scroll-spy 决策（多目标相交时唯一 active）、`offsetTop`/`bounds` 边界、受控 vs 非受控合并、`scrollTo` 偏移计算、hash 同步、disabled 链接排除。
- **组件（svelte）**：渲染嵌套层级缩进、active class、滑块 transform、affix sticky、自定义 `getContainer`、`ink` 插槽。
- **交互**：点击滚动并触发 `change`/`scrollEnd`；`on:click` `preventDefault` 阻止默认滚动。
- **a11y**：axe 零违规；`aria-current` 跟随；roving tabindex 焦点序列；reduced-motion 下无平滑滚动（mock matchMedia）。
- **i18n**：缺省/覆盖 `ariaLabel`、播报模板插值。
- **快照/视觉回归**：三尺寸、vertical/horizontal、RTL、active/hover/focus 态。
- IntersectionObserver / ResizeObserver / scrollTo 用 mock，确保 jsdom 可跑。

## 12. 验收标准

- [ ] 滚动页面时正确高亮当前可视章节，多目标相交无抖动。
- [ ] 点击/键盘激活平滑滚动到目标并应用 `offsetTop` 偏移；reduced-motion 下瞬时跳转。
- [ ] `value`/`defaultValue` 受控与非受控均生效，`on:change` 正确携带 `prevValue`。
- [ ] 多级嵌套 `AnchorLink` 缩进与高亮正确。
- [ ] 滑块（ink）跟随激活项平滑移动；`showInk=false` 时隐藏；`ink` 插槽可自定义。
- [ ] `affix` sticky 与自定义 `getContainer` 正常工作。
- [ ] `aria-label`/`aria-current="location"` 正确；axe 无障碍零违规。
- [ ] 键盘：方向键/Home/End/Enter/Space 全部可用，roving tabindex 单 Tab stop。
- [ ] disabled 链接不可点击、不参与高亮、移出焦点序列。
- [ ] 所有用户可见文案走 i18n，无硬编码。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸。
- [ ] gzip 体积满足 Perf Budget；提供 `component.meta.ts`。
- [ ] 单元/组件/a11y/视觉测试通过。
