# SPEC · Pagination
> 分类：navigation · 阶段：M3
> 对标 Semi：Pagination（严格全量对齐，见 [[align-semi-remove-extensions-not-just-add-gaps]]）

## 1. 概述

Pagination（分页器）用于在数据量较大、无法一次性展示时，将内容切分为多页并提供页间导航。它解决三类核心问题：

- 让用户感知数据规模（总条数 / 总页数）与当前所处位置；
- 提供高效的页间跳转（上一页 / 下一页 / 直接点击页码 / 输入跳页）；
- 控制每页展示密度（每页条数切换 pageSize）。

典型场景：表格底部分页、列表分页、搜索结果分页、卡片流分页。

形态分两类（严格对齐 Semi，无 simple/移动端简洁模式——Semi 无此形态，本库不自造）：
- **default（完整模式）**：页码按钮 + 上/下一页 + 省略号折叠，适合桌面端宽容器；
- **small（紧凑模式）**：仅 `当前页/总页数` 文本 + 上/下一页，可选 `hoverShowPageSelect` 悬停弹出全部页码快速切换。

附加能力：跳页输入框（`showQuickJumper`，内部复用 InputNumber）、每页条数选择（`showSizeChanger`，内部复用 Select）、总数展示（`showTotal`）。Pagination 本身不持有数据，只负责发出页变化意图，数据切片由调用方完成。

边界与非目标：不内置数据请求/缓存；不内置无限滚动（属 InfiniteScroll 组件）；超大页数（如百万级页码）依赖省略号折叠 + hover 弹层虚拟滚动，不渲染全部页码 DOM。

## 2. 设计语义

- **当前页（active）**：`--cd-color-pagination-item-bg-selected` 背景 + `--cd-color-pagination-item-text-selected` 文字 + 加粗，承载 `aria-current="page"`。
- **可点击页码（rest）**：文本色 `--cd-color-pagination-item-text-default`，hover 提升至 `--cd-color-pagination-item-bg-hover` 背景。
- **禁用边界（disabled）**：首页时"上一页"、末页时"下一页"降为 `--cd-color-pagination-item-icon-disabled`（视觉禁用态，非原生 `disabled` 属性——严格对齐 Semi `<li role="button" aria-disabled>` 结构）。
- **省略号（ellipsis）**：静态展示 `…`；非 disabled 时 hover 弹出隐藏页码列表（虚拟滚动，对齐 Semi `react-window`）。
- **节奏**：页码项两档尺寸（default `32px` / small `44px` 最小宽度），间距用组件 token 控制。
- **对齐**：分页项基线对齐，showTotal 与 sizeChanger 与页码区垂直居中。
- 所有颜色、间距、圆角只消费 Component token（回退 Alias），禁止字面量。

## 3. 分层实现

Pagination 含分页折叠算法、越界钳制、跳页解析，属"有交互逻辑"组件，采用 core + svelte 分层。

**@chenzy-design/core**
- `paginationPageCount(total, pageSize)`：`pageCount = max(1, ceil(total/pageSize))`。
- `clampPage(page, total, pageSize)` / `clampPageSize(size, options, fallback)`：越界钳制，永不回写受控 prop。
- `semiPageList(current, total)`：严格镜像 Semi `_updatePageList` 截断逻辑（t≤7 全展开；t>7 按 c<4 / c=4 / 4<c<t-3 / t-3≤c≤t 四段分支，产出 `pageList`（含 `'...'`）+ `restLeft` / `restRight`（省略号 hover 弹层的隐藏页码，上限 `REST_PAGE_MAX_SIZE = 1_000_000`，对齐 Semi）。
- `parseJumpInput(raw, total, pageSize)`：跳页输入解析（去空格、非数字过滤、越界钳制），返回 `number | null`。
- 纯函数，无 DOM/window 依赖，无状态机/原语依赖（Pagination 无浮层主体、无键盘导航，不需要 useRovingTabindex/useLiveAnnouncer/useFocusTrap 等 headless 原语——Semi 本身也不含这些能力，见第 6 节）。

**@chenzy-design/svelte · `Pagination.svelte`**
- 消费 core 纯函数渲染 `<ul>`（default）/ `<div>`（small）根节点；sizeChanger 复用 `Select`，jumper 复用 `InputNumber`（`hideButtons`），省略号/hoverShowPageSelect 弹层复用 `Popover`。
- 受控 `currentPage` / `pageSize` 永不回写，仅经 `onPageChange` / `onPageSizeChange` / `onChange` 回调上报。
- SSR 友好：序列计算纯函数，无 window 依赖；`prefers-reduced-motion` 下移除页码 hover/active 过渡。

## 4. API

### Props

> 本表由 `packages/svelte/src/pagination/meta.ts` 真源生成（2026-08-18 重校，严格对齐 Semi `semi-ui/pagination/index.tsx` PaginationProps）。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| total | `number` | `1` | 数据总条数（对齐 Semi） |
| showTotal | `boolean` | `false` | 是否显示总页数文案（对齐 Semi） |
| pageSize | `number` | `undefined` | 每页条数；缺省取 pageSizeOpts[0]（对齐 Semi，默认 null） |
| pageSizeOpts | `number[]` | `[10,20,40,100]` | size changer 可选每页条数（对齐 Semi） |
| size | `'small'\|'default'` | `default` | small 为紧凑视图（current/total）（对齐 Semi） |
| currentPage | `number` | `undefined` | 受控当前页（越界自动钳制显示，不回写；对齐 Semi） |
| defaultCurrentPage | `number` | `1` | 默认当前页（非受控；对齐 Semi） |
| onPageChange | `(currentPage: number) => void` | `undefined` | 仅页码变化回调（对齐 Semi） |
| onPageSizeChange | `(newPageSize: number) => void` | `undefined` | 每页容量变化回调（对齐 Semi） |
| onChange | `(currentPage: number, pageSize: number) => void` | `undefined` | 页码或每页容量变化回调（对齐 Semi） |
| prevText | `string \| Snippet` | `undefined` | 上一页内容；缺省显示 IconChevronLeft（对齐 Semi prevText） |
| nextText | `string \| Snippet` | `undefined` | 下一页内容；缺省显示 IconChevronRight（对齐 Semi nextText） |
| showSizeChanger | `boolean` | `false` | 显示每页条数选择器；size=small 时不生效（对齐 Semi） |
| showQuickJumper | `boolean` | `false` | 显示快速跳页输入（越界静默钳制，非数字忽略；对齐 Semi） |
| popoverZIndex | `number` | `1030` | 浮层 z-index（对齐 Semi），透传 Select/Popover |
| popoverPosition | `PopoverPosition` | `'bottomLeft'` | size changer / 省略号 / hover 浮层方位（对齐 Semi，透传 Select/Popover） |
| style | `string` | `undefined` | 透传根元素内联样式（对齐 Semi style） |
| class | `string` | `undefined` | 透传根元素类名（对齐 Semi className） |
| hideOnSinglePage | `boolean` | `false` | 仅一页时隐藏整个分页器；showSizeChanger 为 true 时此开关失效（对齐 Semi） |
| hoverShowPageSelect | `boolean` | `false` | size=small 时 hover 页码弹出全部页码快速切换（对齐 Semi，v1.27） |
| disabled | `boolean` | `false` | 禁用（对齐 Semi） |
| preventPageChangeOnPageSizeChange | `boolean` | `false` | 切换 pageSize 时阻止自动调整 currentPage（对齐 Semi） |

### Events

> 本组件无事件回调 prop（meta.events 为空）；页码/容量变化统一走上表的 `onPageChange` / `onPageSizeChange` / `onChange`。

### Slots

> 本组件无 slot（Semi Pagination 无 slot/render-prop 机制，本库不自造）。

## 5. 主题 / Token 表

组件级 token 一律回退到 Alias/Global，禁止字面量。全量对齐 Semi `pagination/variables.scss`（41 个），见 `packages/tokens/src/components/pagination.ts` 真源。

| Component Token | 回退 | 用途 |
|---|---|---|
| `--cd-color-pagination-text-default` | `--cd-color-text-2` | 总页数文本颜色 |
| `--cd-color-pagination-item-text-default` | `--cd-color-text-0` | 页码文本颜色 |
| `--cd-color-pagination-item-bg-default` | `transparent` | 页码背景颜色 |
| `--cd-color-pagination-item-icon-default` | `--cd-color-tertiary` | 页码图标颜色（prev/next） |
| `--cd-color-pagination-item-text-hover` | `--cd-color-text-0` | 页码悬浮态文本颜色 |
| `--cd-color-pagination-item-bg-hover` | `--cd-color-fill-0` | 页码悬浮态背景颜色 |
| `--cd-color-pagination-item-text-active` | `--cd-color-text-0` | 页码按下态文字颜色 |
| `--cd-color-pagination-item-bg-active` | `--cd-color-fill-1` | 页码按下态背景颜色 |
| `--cd-color-pagination-item-text-disabled` | `--cd-color-disabled-text` | 页码禁用态文字颜色 |
| `--cd-color-pagination-item-icon-disabled` | `--cd-color-disabled-text` | 页码禁用态图标颜色 |
| `--cd-color-pagination-item-bg-disabled` | `transparent` | 页码禁用态背景颜色 |
| `--cd-color-pagination-item-bg-selected-disabled` | `--cd-color-disabled-fill` | 页码选中禁用态背景颜色 |
| `--cd-color-pagination-item-text-selected` | `--cd-color-primary` | 页码选中态文字颜色 |
| `--cd-color-pagination-item-bg-selected` | `--cd-color-primary-light-default` | 页码选中态背景颜色 |
| `--cd-color-pagination-quickjump-text-disabled` | `--cd-color-disabled-text` | 快速跳转禁用态文字颜色 |
| `--cd-color-pagination-item-border-default` | `transparent` | 页码默认边框颜色 |
| `--cd-color-pagination-item-border-hover` | `transparent` | 页码悬浮边框颜色 |
| `--cd-color-pagination-item-border-active` | `transparent` | 页码激活边框颜色 |
| `--cd-color-pagination-item-border-selected` | `transparent` | 页码选中边框颜色 |
| `--cd-color-pagination-item-border-disabled` | `transparent` | 页码禁用边框颜色 |
| `--cd-height-pagination-item` | `32px` | 页码高度 |
| `--cd-width-pagination-item-minwidth` | `32px` | 页码最小宽度 |
| `--cd-width-pagination-item-small-minwidth` | `44px` | 迷你页码最小宽度 |
| `--cd-width-pagination-quickjump-input-width` | `50px` | 快速跳转输入框宽度 |
| `--cd-width-pagination-item-border` | `0px` | 页码默认边框宽度 |
| `--cd-spacing-pagination-padding` | `0` | 内边距 |
| `--cd-spacing-pagination-small-paddingy` | `0` | 迷你垂直内边距 |
| `--cd-spacing-pagination-small-paddingx` | `0` | 迷你水平内边距 |
| `--cd-spacing-pagination-item-marginleft` | `--cd-spacing-extra-tight` | 页码左侧外边距 |
| `--cd-spacing-pagination-item-marginright` | `--cd-spacing-extra-tight` | 页码右侧外边距 |
| `--cd-spacing-pagination-item-small-margin` | `0` | 迷你页码外边距 |
| `--cd-spacing-pagination-reset-list-paddingtop` | `--cd-spacing-extra-tight` | 弹层列表上内边距 |
| `--cd-spacing-pagination-reset-list-paddingbottom` | `--cd-spacing-extra-tight` | 弹层列表下内边距 |
| `--cd-spacing-pagination-quickjump-marginleft` | `24px` | 快速跳转左侧外边距 |
| `--cd-spacing-pagination-quickjump-input-marginleft` | `4px` | 快速跳转输入框左外边距 |
| `--cd-spacing-pagination-quickjump-input-marginright` | `4px` | 快速跳转输入框右外边距 |
| `--cd-radius-pagination-item` | `--cd-border-radius-small` | 页码圆角大小 |
| `--cd-font-pagination-small-fontweight` | `--cd-font-weight-regular` | 迷你字重 |
| `--cd-font-pagination-item-fontweight` | `--cd-font-weight-regular` | 页码字重 |
| `--cd-font-pagination-item-active-fontweight` | `--cd-font-weight-bold` | 页码选中态字重 |
| `--cd-font-pagination-quickjump-fontweight` | `--cd-font-weight-regular` | 快速跳转输入框字重 |

另直引 Alias（Semi scss 用字面量 `transition`，本库走 motion token；无对应组件 token）：`--cd-motion-duration-fast`、`--cd-motion-ease-standard`。

每页条数下拉复用 Select（`--cd-select-*`）；hover 弹层复用 Popover；跳页输入复用 InputNumber。这些非本组件 token 表职责。

暗色主题：仅切换 Alias 层（`--cd-color-*` 暗色集），组件层零改动。

## 6. 无障碍

严格对齐 Semi 源码（`semi-ui/pagination/index.tsx`），**不做超出 Semi 的 a11y 增强**——Semi 本身对页码列表无键盘导航、无 roving tabindex、无 live region 播报，本库不自造：

**结构与 role**
- 根节点为 `<ul className={prefixCls}>`（default）/ `<div className={prefixCls}>`（small），**无 `<nav>` 地标**（Semi 无此包裹）。
- 页码 / 上一页 / 下一页均为 `<li role="button">`（非 `<button>` 元素），`aria-disabled` 表达禁用态（非原生 `disabled` 属性）。
- `aria-label` **全部硬编码英文**，不走 locale（对齐 Semi 源码字面量）：`"Previous"` / `"Next"` / `"Page size selector"`（size changer 内置 Select）/ `` `Page ${page}` ``（页码）/ `"More"`（省略号）。
- 当前页 `aria-current="page"`；非当前页 `aria-current={false}`。
- 省略号非 disabled 时可 hover 弹出隐藏页码列表（`Popover`），弹层内页码项无 `role`/`aria-selected`（对齐 Semi `renderRestPageList` 纯 `<div onClick>`）。

**键盘交互**
- **无专用键盘导航**：Semi `handleKeyDown()` 为空实现（源码注释 `// TODO handle tab/enter events`），页码/prev/next 仅可鼠标点击，`<li role="button">` 不在原生 Tab 序列中。
- sizeChanger（Select）与 quickJumper（InputNumber）保留各自组件原生的键盘交互（非 Pagination 自身职责）。

**通告**
- **无 live region / 通告机制**（Semi 无 LiveAnnouncer，本库不自造）。

**RTL**
- 页码 `margin-inline-start/end` 逻辑属性随 `dir` 自动镜像；prev/next 图标额外 `transform: scaleX(-1)`（对齐 Semi `pagination/rtl.scss`）。

## 7. 国际化

用户可见文案走 i18n key 的**仅 4 个**（严格对齐 Semi `locale/source/*.ts` 的 `Pagination` 键集——Semi 的 aria-label 全部硬编码英文，不走 locale，本库不为此自造额外 key）。

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-08-18 重校，严格对齐 Semi）。历史上本表列过 `ariaLabel`/`prevPage`/`nextPage`/`pageLabel`/`itemsPerPage`/`more`/`pageChangeAnnounce`/`pageSizeChangeAnnounce` 共 8 个自造 key，Semi 无对应 locale 条目，已删除，见 [[align-semi-remove-extensions-not-just-add-gaps]]。

| i18n key | 默认（zh-CN） | 说明 |
| --- | --- | --- |
| `Pagination.pageSize` | 每页条数：{size} | size changer 选项文案 |
| `Pagination.total` | 总页数：{total} | showTotal 文案 |
| `Pagination.jumpTo` | 跳至 | 跳页输入框前缀 |
| `Pagination.page` | 页 | 跳页输入框后缀 |

## 8. 文案

遵循 content-guidelines：

- 简短、动作明确。
- showTotal 文案格式固定为「总页数：N」（对齐 Semi `total`），不做范围文案（Semi 无"第 A-B 条"概念）。
- 越界跳页静默钳制到合法范围，不弹出提示（对齐 Semi `_handleQuickJump` 行为）。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| core gzip | ≤ 1.5 KB | 纯算法，无渲染 |
| svelte gzip（不含 Select/InputNumber/Popover） | ≤ 3.0 KB | 基础分页渲染 |
| 首次渲染（100 页，default） | ≤ 1ms | 省略号折叠后实际 DOM 节点 ≤ ~11 项 |
| 翻页重算 + patch | ≤ 0.5ms | 序列纯函数，仅 diff 变更项 |

性能策略：
- **不渲染全部页码**：恒用省略号折叠（`PAGE_SHOW_MAX = 7`），与 total 无关 → 百万页仍 O(1) 节点。
- **hover 弹层虚拟滚动**：`restLeft`/`restRight` 隐藏页数量可达百万级（`REST_PAGE_MAX_SIZE`），弹层内需虚拟化渲染（对齐 Semi `react-window`），仅可视区域出 DOM。
- **惰性子组件**：sizeChanger/jumper 仅在对应 prop 开启时渲染，关闭时零成本。

## 10. AI 元数据

提供 `meta.ts`，供 AI / 低代码消费：

- `name: 'Pagination'`，`category: 'navigation'`。
- `props` 反射第 4 节表（类型、默认、说明）。
- `a11y`：role/aria/键盘映射摘要（第 6 节的精简版）。
- `tokens`：第 5 节 41 个组件 token + 2 个直引 motion token。

## 11. 测试

**core 单测（@chenzy-design/core）**
- `paginationPageCount`：total=0 → 1 页；非整除向上取整。
- `clampPage`/`clampPageSize`：越界钳制正确。
- `semiPageList`：t≤7 全展开；t>7 四段分支（c<4 / c=4 / 4<c<t-3 / t-3≤c≤t）均与 Semi `_updatePageList` 逐分支对照。
- `parseJumpInput`：非数字过滤、空输入、越界钳制、合法提交。

**svelte 组件测试（jsdom / a11y）**
- 渲染快照：default / small 两态。
- 交互：点击页码 / 上下一页 / 边界禁用不触发 / 跳页 blur+enter / sizeChanger 切换。
- 事件 payload：onChange/onPageChange/onPageSizeChange 触发次数与参数正确。
- DOM 结构：根节点为 `<ul>`/`<div>`（非 `<nav>`）；页码/prev/next 为 `role="button"` 的 `<li>`；`aria-label` 为硬编码英文；`aria-current` 正确。

**kbd e2e（browser project）**
- 仅验证 changePageSize（真实点击 Select 下拉选项）的页码重算；**不测键盘导航**（Semi 无此能力）。

**视觉回归**：两档尺寸 × 三态（normal/hover/active）× LTR/RTL × light/dark 快照。

## 12. 验收标准 Checklist

- [ ] 包名 `@chenzy-design/core` 与 `@chenzy-design/svelte` 分层落地，纯算法在 core。
- [ ] 所有样式仅消费 `--cd-` Component/Alias token，无字面量颜色/间距硬编码。
- [ ] 类名单连字符：`cd-page` / `cd-page-item` / `cd-page-item-small` 等。
- [ ] DOM 结构严格对齐 Semi：`<ul>`/`<div>` 根节点、`<li role="button">`、硬编码英文 aria-label，不自造 `<nav>`/roving tabindex/LiveAnnouncer。
- [ ] 省略号折叠：可见节点数与 total 解耦，百万页 O(1) DOM；hover 弹层虚拟滚动。
- [ ] i18n：仅 Semi 对应的 4 个 `Pagination.*` key，不自造额外 key。
- [ ] RTL 与 dark 主题正确镜像/换色（prev/next 图标 `scaleX(-1)`），reduced-motion 关闭过渡。
- [ ] Perf Budget 达标：core ≤1.5KB、基础 svelte ≤3KB gzip；翻页重算 ≤0.5ms。
- [ ] sizeChanger / jumper 惰性引入，关闭时零成本。
- [ ] `hideOnSinglePage`、`disabled` 行为正确（对齐 Semi）。
- [ ] 提供 `meta.ts`，含 props/a11y/tokens。
- [ ] 单测 / 组件 / kbd e2e / 视觉回归全部通过。
