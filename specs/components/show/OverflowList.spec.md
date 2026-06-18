# SPEC · OverflowList
> 分类：show · 阶段：M4
> 对标 Semi：OverflowList

## 1. 概述

OverflowList 是一个「溢出折叠列表」容器：在水平（或垂直）一维空间内尽可能多地渲染子项，当可用空间不足以容纳全部子项时，自动将放不下的子项收纳进一个「更多（overflow）」指示节点（通常是一个 `+N` 标签或下拉触发器）。它解决的是「项数不定 + 容器宽度不定」场景下的视觉溢出问题，常用于：面包屑（Breadcrumb）超长收纳、标签组（Tag group）、工具栏按钮、表格列头操作区、头像组（AvatarGroup 的扩展）等。

与 Semi OverflowList 对齐的两种渲染模式：
- `collapse`（折叠模式，默认）：可见项 + 一个折叠节点，折叠节点由调用方通过 `renderOverflow` 自定义（如渲染成 Dropdown / Popover）。
- `scroll`（滚动模式）：不折叠，溢出时显示首/尾滚动锚点，用于「分页式」滚动定位（暴露 `scrollToIndex` 等命令式方法）。

核心特征：基于 ResizeObserver + IntersectionObserver 的零闪烁测量，避免布局抖动；溢出方向支持 `start` / `end`（从头折叠或从尾折叠）；可选保留首项与尾项（boundary items，如面包屑保留首页与当前页）。

非目标：它不负责子项本身的排版样式，也不是虚拟滚动组件（项数预期为十到数百量级，超大列表请用 VirtualList）。

## 2. 设计语义

- **空间语义**：OverflowList 自身是一个 `inline-flex`/`flex` 容器，主轴方向由 `direction` 决定。可见区由 `overflow: hidden` 裁剪，测量层（measure layer）使用 `visibility: hidden; position: absolute` 离屏测量，绝不参与可视布局。
- **折叠节点语义**：折叠节点是「更多」的语义入口，默认渲染为带 `--cd-color-text-2` 文字的次级标签，hover 态使用 `--cd-color-fill-0`。它必须始终可见且不被裁剪（pinned）。
- **方向语义**：`overflowDirection=end` 时折叠节点固定在尾部（最常见，如工具栏）；`=start` 时固定在头部（如「… / 父级 / 当前」面包屑）。
- **稳定性语义**：测量必须在同一帧内完成可见数量计算，渲染只发生一次最终状态，避免「先全展开再回缩」的闪烁。临界宽度采用滞后阈值（hysteresis）防止在边界宽度反复抖动。
- **尺寸**：`small | default | large` 仅影响折叠节点与内部 gap 的 token，不强加子项尺寸。
- **降级**：无 ResizeObserver 环境（SSR / 老浏览器）下，首屏全部渲染，hydration 后再测量收纳。
- 视觉对比度、reduced-motion、RTL 注意点见第 6 节。

## 3. 分层实现

属于「有交互/键盘/测量逻辑」的组件，采用 core + svelte 分层。

**@chenzy-design/core · `createOverflowList`（headless）**
- 职责：纯测量与收纳算法，框架无关。输入项尺寸缓存 + 容器尺寸，输出 `{ visibleCount, overflowCount, visibleItems, overflowItems, overflowDirection }`。
- 算法：
  - 维护每项的测量宽度（measure layer 上报）+ 折叠节点宽度，二分/累加求最大可见数；含 boundary 保留（`alwaysVisible` 索引集合）。
  - hysteresis：进入折叠与退出折叠使用不同阈值（默认 8px），防抖动。
  - 支持 `minVisibleItems`：低于此数则不再折叠（宁可溢出）。
- 复用 core 原语：
  - `useId`：生成 overflow 触发器与折叠面板的关联 id。
  - `useResizeObserver`（core 内部原语）：观测容器与折叠节点尺寸变化。
  - 当折叠节点本身是可聚焦的下拉触发器时，键盘与显隐交由调用方的 Dropdown（其内部用 `useDismiss`/`useFocusTrap`/`useRovingTabindex`）；OverflowList 自身不持有浮层逻辑。
  - `useLiveAnnouncer`：可选，宣告「已折叠 N 项」。
- 不做：渲染、DOM 创建、样式。

**@chenzy-design/svelte · `OverflowList.svelte`（渲染）**
- 三层结构：可见层（render visible）+ 折叠节点槽（overflow slot）+ 离屏测量层（measure layer，仅用于获取每项真实宽度）。
- 用 `ResizeObserver` 监听 root，`bind:clientWidth` 兜底；用 `requestAnimationFrame` 合批，单帧内完成测量→计算→渲染。
- `scroll` 模式额外渲染首/尾滚动锚点并暴露 `scrollToIndex(i)` / `scrollToStart()` / `scrollToEnd()`。
- 暴露命令式实例方法（`export function`）供父组件调用。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `items` | `T[]` | `[]` | 数据源数组；配合 `renderItem` 渲染。也可直接用默认 slot 传子项（slot 模式下忽略此项）。 |
| `renderMode` | `'collapse' \| 'scroll'` | `'collapse'` | 折叠模式或滚动模式。 |
| `overflowDirection` | `'start' \| 'end'` | `'end'` | 折叠节点固定方向；`start` 从头折叠，`end` 从尾折叠。 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 主轴方向。 |
| `minVisibleItems` | `number` | `0` | 最少始终可见项数；低于则不折叠宁可溢出。 |
| `alwaysVisibleIndexes` | `number[]` | `[]` | 永不折叠的项索引（boundary items，如面包屑首/尾）。 |
| `threshold` | `number` | `8` | 折叠/展开滞后阈值（px），防边界抖动。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 影响折叠节点与 gap 的 token。 |
| `gap` | `number \| string` | `--cd-overflow-list-gap` | 子项间距，覆盖 token。 |
| `collapseFrom` | `'start' \| 'end'` | `'end'` | （别名兼容 Semi）等价 `overflowDirection`，二者取后设者。 |
| `class` | `string` | `''` | 根节点自定义类名。 |
| `style` | `string` | `''` | 根节点内联样式。 |

### Events

| Event | payload | 说明 |
|---|---|---|
| `on:overflowChange` | `{ overflowCount: number; visibleCount: number; overflowItems: T[] }` | 可见/折叠数量发生变化时触发（去重，仅在结果实际变化时）。 |
| `on:visibleChange` | `{ visibleItems: T[] }` | 可见项集合变化时触发。 |
| `on:scroll` | `{ index: number; position: 'start' \| 'end' \| number }` | 仅 `scroll` 模式，滚动定位完成后触发。 |

> 命令式方法（实例 API，非事件）：`recalculate()`、`scrollToIndex(i)`、`scrollToStart()`、`scrollToEnd()`、`getOverflowItems()`。

### Slots

| Slot | props | 说明 |
|---|---|---|
| default | — | 直接传入子项（slot 模式）；OverflowList 自动测量每个直接子元素并收纳。 |
| `item` | `{ item: T; index: number }` | 数据驱动模式下渲染单个可见项（等价 `renderItem`）。 |
| `overflow` | `{ overflowItems: T[]; overflowCount: number; isHorizontal: boolean }` | 渲染折叠节点（如 `+N` 标签 / Dropdown 触发器）；省略时回退默认 `+N` 标签。 |
| `scroll-start` / `scroll-end` | `{ disabled: boolean }` | 仅 `scroll` 模式，自定义首/尾滚动锚点。 |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 token，禁止写死值。

| Component Token | 取值（引用 Alias） | 用途 |
|---|---|---|
| `--cd-overflow-list-gap` | `var(--cd-spacing-tight, 8px)` | 子项主轴间距 |
| `--cd-overflow-list-overflow-color` | `var(--cd-color-text-2)` | 折叠节点（`+N`）文字色 |
| `--cd-overflow-list-overflow-color-hover` | `var(--cd-color-text-0)` | 折叠节点 hover 文字色 |
| `--cd-overflow-list-overflow-bg` | `transparent` | 折叠节点背景 |
| `--cd-overflow-list-overflow-bg-hover` | `var(--cd-color-fill-0)` | 折叠节点 hover 背景 |
| `--cd-overflow-list-overflow-radius` | `var(--cd-radius-default)` | 折叠节点圆角 |
| `--cd-overflow-list-scroll-anchor-color` | `var(--cd-color-text-2)` | 滚动锚点图标色 |
| `--cd-overflow-list-scroll-anchor-color-disabled` | `var(--cd-color-text-3)` | 锚点禁用色 |
| `--cd-overflow-list-focus-ring` | `var(--cd-color-primary)` | 折叠节点 focus 环色 |

尺寸映射（size → token）：

| size | gap | 折叠节点字号 / padding |
|---|---|---|
| small | `var(--cd-spacing-extra-tight, 4px)` | `--cd-font-size-small` / `2px 6px` |
| default | `var(--cd-spacing-tight, 8px)` | `--cd-font-size-default` / `4px 8px` |
| large | `var(--cd-spacing-base, 12px)` | `--cd-font-size-large` / `6px 12px` |

## 6. 无障碍（WCAG 2.1 AA）

- **role / 语义**：OverflowList 本身不强制 role（容器透明），保留子项原有语义。若用于一组操作，建议调用方在 root 上设 `role="toolbar"` 或 `role="list"`（子项 `role="listitem"`）。
- **折叠节点**：默认 `+N` 标签渲染为 `<button>`，含 `aria-label`（i18n，如「显示其余 3 项」）。当折叠节点是 Dropdown 触发器时，遵循 WAI-ARIA APG Menu Button 模式：`aria-haspopup="menu"`、`aria-expanded`、`aria-controls` 指向面板（这些由 Dropdown 提供，OverflowList 通过 `useId` 提供关联 id）。
- **键盘交互**：
  - 折叠节点可 `Tab` 聚焦；`Enter` / `Space` 激活（展开下拉，逻辑在 Dropdown）。
  - `scroll` 模式：滚动锚点为 `<button>`，`Enter`/`Space` 触发；可达边界时锚点 `disabled` 并设 `aria-disabled`。
  - 折叠后被隐藏的项必须从 Tab 序中移除（不渲染或 `display:none`），不能保留不可见但可聚焦的元素。
- **焦点管理**：因宽度变化导致当前聚焦项被折叠时，将焦点移交折叠节点，避免焦点丢失到 body（core 提供 `onItemCollapsed(focusedIndex)` 回调钩子）。
- **测量层**：离屏测量层加 `aria-hidden="true"`，绝不进入辅助技术读取与 Tab 序。
- **LiveAnnouncer**：可选开启 `announceOverflow`，用 `useLiveAnnouncer`（polite）宣告「已折叠 N 项」，频繁变化时节流避免刷屏。
- **对比度**：折叠节点文字 `--cd-color-text-2` 对 `--cd-color-bg-0` 需满足 ≥4.5:1（正文）；禁用锚点 `--cd-color-text-3` 视为非必要装饰可放宽，但需保留可达的等价入口。
- **reduced-motion**：`scroll` 模式的平滑滚动在 `prefers-reduced-motion: reduce` 下降级为瞬时 `behavior: 'auto'`；折叠数变化无动画或仅极短淡入。
- **RTL**：`direction=horizontal` 在 `dir="rtl"` 下，`overflowDirection=end` 折叠节点固定在视觉左侧；使用 logical properties（`margin-inline-start`/`inset-inline-end`）而非 left/right；滚动锚点图标随 RTL 镜像。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key（格式 `OverflowList.field`）。数字用 `Intl.NumberFormat` 本地化（`+N` 的 N）。

| i18n key | 默认（zh-CN） | 默认（en） | 用途 |
|---|---|---|---|
| `OverflowList.moreLabel` | `+{count}` | `+{count}` | 折叠节点默认标签 |
| `OverflowList.moreAriaLabel` | `显示其余 {count} 项` | `Show {count} more items` | 折叠节点 aria-label |
| `OverflowList.collapsedAnnouncement` | `已折叠 {count} 项` | `{count} items collapsed` | LiveAnnouncer 宣告 |
| `OverflowList.scrollStart` | `滚动到开头` | `Scroll to start` | 滚动起始锚点 aria-label |
| `OverflowList.scrollEnd` | `滚动到末尾` | `Scroll to end` | 滚动结束锚点 aria-label |

- `{count}` 经 `Intl.NumberFormat(locale)` 格式化后插值。
- 复数形态（en 的 item/items）通过 ICU MessageFormat `plural` 处理。

## 8. 文案

遵循 content-guidelines：

- 折叠节点保持极简：默认 `+N`，不写「还有 N 个」之类长句；需要语境时由调用方通过 `overflow` slot 自定义。
- aria-label 用完整可读句（「显示其余 N 项」），与视觉简写区分。
- 句末不加标点（标签类）；宣告语为短句不加句号。
- 大小写：英文 sentence case（`Show 3 more items`，非 Title Case）。

危险操作文案：OverflowList 自身不含危险操作（纯展示/收纳，无删除/提交）。若调用方在折叠下拉中放置删除等危险项，危险文案与二次确认由该业务项与 Dropdown/Popconfirm 负责，本组件不代管。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 目标 | 说明 |
|---|---|---|
| gzip 体积（svelte） | ≤ 3.2 KB | 不含 Dropdown 等折叠节点内容 |
| gzip 体积（core `createOverflowList`） | ≤ 1.8 KB | 纯算法，无 DOM |
| 首次测量 | ≤ 1 帧（~16ms）@ 50 项 | rAF 合批，单帧出最终态，零闪烁 |
| resize 重算 | ≤ 4ms @ 100 项 | 复用项宽度缓存，仅二分求 visibleCount |
| 测量次数 | 每项 1 次（缓存命中后 0） | 项内容不变时不重测，内容变更才失效缓存 |
| 内存 | O(n) 宽度缓存 | n = 项数 |

策略：
- **虚拟化**：不内置。项数 > 数百时建议改用 VirtualList；OverflowList 定位中小列表。
- **惰性渲染**：折叠项默认仍渲染（隐藏）以便快速恢复；可设 `destroyOverflowed`（隐含于 `collapse` 模式时仅渲染可见项 + 折叠节点，折叠项不入 DOM，避免大列表 DOM 膨胀）。
- **测量层**：仅在初次与内容变更时挂载，稳定后可卸载离屏测量层减少节点数。
- **防抖**：ResizeObserver 回调经 rAF 合批 + hysteresis，避免高频重排。

## 10. AI 元数据

提供 `component.meta.ts`（`OverflowList.meta.ts`），导出结构化元数据供 AI/低代码消费：

- `name: 'OverflowList'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'OverflowList'`
- `summary`：一句话能力描述（溢出自动收纳）。
- `props`：每个 prop 的类型、默认、枚举、约束（如 `renderMode ∈ {collapse,scroll}`）。
- `events` / `slots` / `methods`：签名与说明（含命令式方法）。
- `tokens`：第 5 节 token 清单与默认引用。
- `a11y`：role 建议、键盘表、APG 模式引用（Menu Button）。
- `i18nKeys`：第 7 节 key 列表。
- `examples`：典型用例（工具栏收纳 / 面包屑保留首尾 / scroll 模式分页定位），含可运行片段与 props 组合。
- `whenToUse` / `whenNotToUse`：vs VirtualList、vs 纯 CSS `flex-wrap` 的取舍。

## 11. 测试

- **单元（core，`createOverflowList`）**：
  - 给定项宽度数组 + 容器宽度，断言 `visibleCount` / `overflowCount` 正确（边界：刚好放下、差 1px、全溢出、全可见）。
  - hysteresis：在阈值带内来回改变宽度，断言不抖动。
  - `alwaysVisibleIndexes` / `minVisibleItems` 生效。
  - `overflowDirection=start` 与 `end` 折叠端正确。
- **组件（svelte，Vitest + Testing Library + jsdom + mock ResizeObserver）**：
  - slot 模式与 items 模式渲染一致。
  - resize 后 `on:overflowChange` 派发且去重。
  - 命令式 `recalculate()` / `scrollToIndex` 行为。
  - SSR 降级：无 RO 时全渲染，hydrate 后收纳。
- **a11y**：axe 扫描无违规；测量层 `aria-hidden`；折叠项移出 Tab 序；焦点在折叠时移交折叠节点。
- **视觉回归（Playwright/Storybook）**：三种 size、RTL、start/end 方向、scroll 模式锚点禁用态、reduced-motion 下无动画。
- **性能基准**：100 项 resize 重算耗时回归阈值（≤4ms）。

## 12. 验收标准 checklist

- [ ] 容器变窄/变宽时正确收纳/释放，单帧无闪烁（无「先全展开再回缩」）。
- [ ] `collapse` / `scroll` 两模式均工作；`overflowDirection` start/end 正确。
- [ ] `alwaysVisibleIndexes` 与 `minVisibleItems` 行为符合预期。
- [ ] hysteresis 生效，边界宽度无抖动。
- [ ] headless 逻辑在 `@chenzy-design/core` 的 `createOverflowList`，渲染在 `@chenzy-design/svelte`，复用 `useId`/`useResizeObserver`/`useLiveAnnouncer`。
- [ ] 折叠节点默认 `+N`，可经 `overflow` slot 自定义为 Dropdown 触发器，APG Menu Button 属性齐全。
- [ ] 折叠项移出 Tab 序；聚焦项被折叠时焦点移交折叠节点；测量层 `aria-hidden`。
- [ ] axe 无违规，文字对比度 ≥4.5:1。
- [ ] 所有可见文案走 i18n key（`OverflowList.*`），`{count}` 经 `Intl` 格式化，复数正确。
- [ ] reduced-motion 降级、RTL 镜像（logical properties）正确。
- [ ] 仅消费 `--cd-` Alias/Component token，无写死值；size 三档生效。
- [ ] Perf Budget 达标：svelte ≤3.2KB / core ≤1.8KB gzip，100 项 resize 重算 ≤4ms。
- [ ] 提供 `OverflowList.meta.ts` 且字段完整。
- [ ] SSR 首屏不报错，hydration 后正确收纳。
