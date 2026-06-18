# SPEC · Table
> 分类：show · 阶段：M4
> 对标 Semi：Table

## 1. 概述

Table 是结构化二维数据的核心展示与操作组件，是整个组件库中复杂度与性能要求最高的组件之一。它聚合了列定义驱动渲染、排序、筛选、分页、行选择（多选/单选）、行展开/树形数据、固定列/固定表头、合并单元格、自定义渲染、虚拟化滚动等能力。

设计目标：

- **列定义驱动**：通过 `columns` 描述结构（`dataIndex`/`title`/`width`/`fixed`/`sorter`/`filters`/`render`），数据通过 `dataSource` 注入，二者解耦。
- **大数据可用**：内置基于 `core` 的虚拟化引擎，1k+ 行下仅渲染视口内行，滚动 60fps、初始挂载 < 100ms（10 列 × 1k 行）。
- **受控/非受控双轨**：排序、筛选、分页、选择、展开均支持受控（外部托管状态，常用于服务端数据）与非受控（组件内部管理，纯客户端数据）。
- **可组合**：固定列与虚拟化、树形数据与展开、分页与服务端排序可任意叠加而不互斥。

典型场景：管理后台数据列表、可排序筛选报表、可选择批量操作的资源列表、树形结构（部门/菜单）展示。

边界（非目标）：不内置编辑单元格的完整表单引擎（仅暴露 `render` + 受控数据由用户自行实现可编辑表格）；不内置数据请求层（仅暴露 `loading` 与受控事件，由用户对接 fetch）。

## 2. 设计语义

- **结构语义**：原生 `<table>` 语义不足以承载固定列/虚拟化，因此采用 `role="grid"`（交互型）或 `role="table"`（纯展示）+ `role="row"`/`role="columnheader"`/`role="rowheader"`/`role="gridcell"` 显式标注，DOM 用 `div` 分层（headerWrapper / bodyWrapper / 固定列 layer）。
- **视觉层级**：表头底色 `--cd-table-header-bg`（弱于内容区，建立"控制区 vs 数据区"对比），行边框使用 `--cd-color-border` 的低对比变体（`--cd-table-border-color`），保证密集数据下不产生网格噪音。
- **密度（density）**：`small | default | large` 对应行高与单元格 padding 三档，满足"信息密集报表 → 舒适浏览"的尺度切换；密度只改 spacing token，不改字号语义。
- **状态语义**：行 hover（`--cd-table-row-hover-bg`）、选中（`--cd-table-row-selected-bg`）、斑马纹（`--cd-table-row-stripe-bg`）三种背景态分层，选中态对比度优先级最高。
- **固定列视觉**：固定列与滚动区交界处使用渐变阴影（`--cd-table-fixed-shadow`），且仅在横向滚动发生时显现（`scrollLeft > 0` / 未触底），用阴影而非硬边界传达"层叠浮起"。
- **运动**：展开/收起行使用高度过渡，排序图标切换无位移仅状态色变化；`prefers-reduced-motion` 下取消展开动画与阴影渐变过渡。
- **空与载入**：空数据复用 Empty 语义占满 body 宽度并垂直居中；`loading` 时覆盖半透明遮罩 + Spin，保留已有结构避免布局抖动（skeleton 可选）。

## 3. 分层实现

属于重交互 + 重性能组件，拆分为 headless `core` 与 Svelte 渲染层。

**@chenzy-design/core · `createTable`**

承载所有与 DOM 框架无关的状态机与算法：

- 列模型规整（扁平化多级表头、计算 `fixed` 列偏移 left/right、列宽分配/`scroll.x` 溢出）。
- 排序状态机（单列/多列、`ascend|descend|null` 三态循环、`sortOrder` 受控合并）。
- 筛选状态机（多值筛选、`filteredValue` 受控、`onFilter` 谓词执行）。
- 选择状态机（`selectedRowKeys` 维护、半选 indeterminate 计算、跨页保留、`getCheckboxProps` 禁用合并、shift 范围选择）。
- 展开状态机（`expandedRowKeys`、树形 `childrenColumnName` 递归展平为可视行序列）。
- 数据管道（client 模式下 filter → sort → paginate 的纯函数组合 pipeline，memoized）。
- **虚拟化引擎**：复用通用 `createVirtualizer`（rowHeight 固定/动态测量、overscan、scrollTop → 可视区间 startIndex/endIndex、累积偏移 translateY）。
- 复用原语：`useId`（生成 table id / aria-describedby）、`useRovingTabindex`（grid 单元格焦点漫游）、`useLiveAnnouncer`（排序/筛选/分页/选择结果播报）、`useScrollLock`（不适用，省）。

`createTable` 暴露 store（`rows$`、`flatColumns$`、`sortState$`、`selectionState$`、`virtualRange$`）+ action（`toggleSort`、`setFilter`、`toggleSelect`、`selectAll`、`toggleExpand`、`onBodyScroll`）。

**@chenzy-design/svelte · `Table.svelte`**

- 订阅 store 渲染 DOM（headerWrapper / bodyWrapper / 左右固定列 layer / 虚拟 spacer）。
- 子组件：`Table.Column`（声明式列，亦支持 `columns` 数组式）、内置 `Selection`/`Expand`/`Sorter`/`Filter` 渲染件。
- 滚动同步：横向滚动时 header 与 body `transform: translateX` 同步；纵向虚拟化由 body 滚动驱动 `onBodyScroll`。
- 透传 `render` slot/函数获得 `{ text, record, index, column }`。
- 纯展示降级：当无 `sorter/filters/rowSelection/expandable/onRow` 交互时，可输出语义化 `<table>`（`role="table"`）省去 grid 漫游逻辑。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `columns` | `ColumnDef<T>[]` | `[]` | 列定义数组（亦可用 `<Table.Column>` 声明式） |
| `dataSource` | `T[]` | `[]` | 数据源；每行需可由 `rowKey` 解析唯一键 |
| `rowKey` | `string \| (record:T)=>string` | `'key'` | 行唯一键，虚拟化/选择/展开必需且必须稳定 |
| `loading` | `boolean \| { spinning, tip }` | `false` | 加载态遮罩 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 密度档位 |
| `bordered` | `boolean` | `false` | 显示单元格边框 |
| `stripe` | `boolean` | `false` | 斑马纹 |
| `sticky` | `boolean \| { offsetHeader }` | `false` | 表头吸顶 |
| `scroll` | `{ x?: number\|string; y?: number }` | `—` | `x` 触发横向滚动与固定列；`y` 启用固定表头/纵向滚动 |
| `virtualized` | `boolean \| { itemHeight?: number; overscan?: number }` | `false` | 行虚拟化；`itemHeight` 未给则动态测量。需配合 `scroll.y` |
| `pagination` | `false \| PaginationProps` | 内置 10/页 | 分页配置；`false` 关闭（常用于虚拟化场景） |
| `rowSelection` | `RowSelection<T>` | `—` | 选择配置（见下） |
| `expandable` | `Expandable<T>` | `—` | 展开行配置（含 `expandedRowRender`/`rowExpandable`） |
| `childrenColumnName` | `string` | `'children'` | 树形数据的子节点字段 |
| `defaultExpandAllRows` | `boolean` | `false` | 树形/展开默认全展开 |
| `rowClassName` | `(record:T,index:number)=>string` | `—` | 行自定义类名 |
| `empty` | `Snippet \| string` | 内置 Empty | 空数据占位 |
| `getPopupContainer` | `()=>HTMLElement` | `body` | 筛选浮层挂载点 |
| `locale` | `Partial<TableLocale>` | 全局 | 局部文案覆盖 |

`ColumnDef<T>` 关键字段：`dataIndex`、`title`、`key`、`width`、`align('left'|'center'|'right')`、`fixed('left'|'right'|true)`、`ellipsis`、`sorter(boolean|(a,b)=>number|{multiple})`、`sortOrder`、`defaultSortOrder`、`filters`、`filteredValue`、`onFilter`、`filterMultiple`、`render`、`colSpan`/`rowSpan`(via `onCell`)、`resizable`、`children`(多级表头)。

`RowSelection<T>`：`type('checkbox'|'radio')`、`selectedRowKeys`、`defaultSelectedRowKeys`、`onChange`、`onSelect`、`onSelectAll`、`getCheckboxProps`、`fixed`、`columnWidth`、`preserveSelectedRowKeys`(跨页/筛选保留)、`hideSelectAll`。

### Events

| Event | payload | 说明 |
|---|---|---|
| `on:change` | `{ pagination, filters, sorter, extra:{action:'paginate'\|'sort'\|'filter'} }` | 排序/筛选/分页任一变化的聚合事件（受控数据主入口） |
| `on:sortChange` | `{ column, order, sorter }` | 排序状态变化 |
| `on:filterChange` | `{ dataIndex, values }` | 筛选状态变化 |
| `on:paginationChange` | `{ current, pageSize }` | 分页变化 |
| `on:selectChange` | `{ selectedRowKeys, selectedRows }` | 选择集变化（对应 `rowSelection.onChange`） |
| `on:expandChange` | `{ expanded, record, expandedRowKeys }` | 行展开/收起 |
| `on:rowClick` | `{ record, index, event }` | 行点击（亦提供 `rowDblClick`/`rowContextMenu`） |
| `on:scroll` | `{ scrollLeft, scrollTop, atLeft, atRight, atTop, atBottom }` | 滚动位置（含虚拟化触底，用于无限加载） |
| `on:reachBottom` | `{ }` | 纵向触底（懒加载触发） |

注：受控 API 统一为 `value + on:change` 语义在此具象为「各状态字段 + 聚合 `on:change`」；筛选浮层显隐内部遵循 `open + on:openChange` 模式（透传至内部 Dropdown）。

### Slots / Snippets

| Slot/Snippet | 参数 | 说明 |
|---|---|---|
| `default` | `—` | 放置 `<Table.Column>` 声明式列 |
| `header` | `{ columns }` | 自定义整段表头（覆盖默认） |
| `cell` (per column `render`) | `{ text, record, index, column }` | 单元格自定义内容 |
| `title` | `{ }` | 表格上方标题区 |
| `footer` | `{ currentData }` | 表格下方汇总区 |
| `summary` | `{ data }` | 固定汇总行（如合计行） |
| `expandedRowRender` | `{ record, index, expanded }` | 展开行内容 |
| `empty` | `—` | 空状态 |
| `loading` | `—` | 自定义加载态（覆盖默认 Spin） |

## 5. 主题 / Token

组件级 Token 全部回退到 Alias，禁止写死。

| Component Token | 回退 Alias | 用途 |
|---|---|---|
| `--cd-table-bg` | `--cd-color-bg-0` | 表格容器背景 |
| `--cd-table-header-bg` | `--cd-color-bg-1` | 表头背景 |
| `--cd-table-header-text` | `--cd-color-text-0` | 表头文字 |
| `--cd-table-cell-text` | `--cd-color-text-0` | 单元格文字 |
| `--cd-table-border-color` | `--cd-color-border` | 行/列分隔线 |
| `--cd-table-row-hover-bg` | `--cd-color-fill-0` | 行 hover 背景 |
| `--cd-table-row-selected-bg` | `--cd-color-primary-light` | 选中行背景 |
| `--cd-table-row-stripe-bg` | `--cd-color-fill-0` | 斑马纹背景 |
| `--cd-table-cell-padding-y` | `--cd-spacing-3` | 单元格纵向 padding（default 档） |
| `--cd-table-cell-padding-x` | `--cd-spacing-4` | 单元格横向 padding |
| `--cd-table-row-height-sm` | `--cd-size-7` | small 行高 |
| `--cd-table-row-height` | `--cd-size-9` | default 行高 |
| `--cd-table-row-height-lg` | `--cd-size-11` | large 行高 |
| `--cd-table-fixed-shadow` | `--cd-shadow-2` | 固定列层叠阴影 |
| `--cd-table-sort-active-color` | `--cd-color-primary` | 激活排序图标色 |
| `--cd-table-filter-active-color` | `--cd-color-primary` | 激活筛选图标色 |
| `--cd-table-loading-mask` | `--cd-color-bg-0` (alpha) | 加载遮罩 |
| `--cd-table-expand-icon-color` | `--cd-color-text-2` | 展开箭头色 |

校验态：单元格内承载表单时由内部子组件消费 `--cd-color-danger`/`warning`，Table 本身不额外定义 status token。深色模式由 Alias 层切换，组件 Token 自动继承。

## 6. 无障碍

遵循 WAI-ARIA APG **Grid Pattern**（交互态）/ **Table Pattern**（纯展示）。

- **role 结构**：交互态根 `role="grid"`（含 `aria-rowcount`/`aria-colcount`，虚拟化时为总数而非渲染数），行 `role="row"`（`aria-rowindex` 用真实序号），表头 `role="columnheader"` + `aria-sort="ascending|descending|none"`，行头 `role="rowheader"`，数据 `role="gridcell"`。
- **选择**：行复选框为原生 `<input type=checkbox>` 带 `aria-label`（`Table.selectRow` 注入行标识）；全选框 `aria-label=Table.selectAll`，半选用 `indeterminate` 属性 + `aria-checked="mixed"`。
- **排序**：排序触发器为 `<button>` 嵌于 columnheader，`aria-label` 形如 `Table.sortBy {column}`，激活后更新 `aria-sort`；变更经 `useLiveAnnouncer` 播报 `Table.sortedAnnounce`。
- **筛选**：筛选触发器 `<button aria-haspopup="listbox" aria-expanded>` 控制浮层（遵循 `open + on:openChange`），浮层内 `useFocusTrap` + Esc `useDismiss`。
- **键盘（grid）**：方向键在单元格间漫游（`useRovingTabindex`，每行仅一个 tabbable 入口）；`Home/End` 行首尾，`Ctrl+Home/End` 表首尾，`PageUp/PageDown` 翻视口（虚拟化需先滚动再聚焦）；`Space` 切换当前行选择，`Enter` 触发行内主操作，可聚焦控件用 `F2`/`Enter` 进入。
- **焦点管理**：虚拟化下被回收的聚焦行，焦点回退到最近可视行并 announce；展开行内容获得独立 tab 序列。
- **对比度**：选中/hover/斑马纹背景与文字均 ≥ 4.5:1；排序激活色与表头底色 ≥ 3:1（图标 graphical object）。固定列阴影不作为唯一信息载体。
- **reduced-motion**：取消展开高度动画与固定列阴影过渡，立即态切换。
- **RTL**：`dir=rtl` 下 `fixed:left/right` 与偏移计算镜像，排序/展开图标方向翻转，`text-align` 默认随 `start/end`。

## 7. 国际化

用户可见文案零硬编码，经 `locale` prop 或全局 i18n provider 注入。日期/数字列由用户在 `render` 中使用 `Intl.DateTimeFormat`/`Intl.NumberFormat`（组件透传当前 locale 至 `render` 上下文）。

| i18n key | 默认（en） | 用途 |
|---|---|---|
| `Table.emptyText` | No data | 空数据 |
| `Table.selectAll` | Select all | 全选框标签 |
| `Table.selectInvert` | Invert selection | 反选 |
| `Table.selectNone` | Clear all | 清空选择 |
| `Table.selectRow` | Select row | 行选择框标签 |
| `Table.sortBy` | Sort by {column} | 排序按钮标签 |
| `Table.sortAscend` | Click to sort ascending | 排序提示 |
| `Table.sortDescend` | Click to sort descending | 排序提示 |
| `Table.sortCancel` | Click to cancel sorting | 排序提示 |
| `Table.sortedAnnounce` | Sorted by {column}, {order} | 排序播报 |
| `Table.filterTitle` | Filter menu | 筛选浮层标题 |
| `Table.filterConfirm` | OK | 筛选确认 |
| `Table.filterReset` | Reset | 筛选重置 |
| `Table.filterEmpty` | No filters | 无筛选项 |
| `Table.expand` | Expand row | 展开按钮 |
| `Table.collapse` | Collapse row | 收起按钮 |
| `Table.selectedCount` | {count} selected | 选中计数（亦用于播报） |
| `Table.loading` | Loading… | 加载提示 |

分页文案复用 `Pagination.*` key，不在此重复定义。

## 8. 文案

遵循 content-guidelines：

- 标签简洁、句首大写、不带尾标点（按钮/标签）；提示句完整可带句号。
- 排序/筛选按钮文案为「动作 + 对象」（Sort by Name），避免歧义术语。
- 空状态用中性陈述「No data」而非否定情绪文案；可由用户替换为带引导操作的自定义 Empty。
- 选中计数采用 ICU 复数（`{count, plural, ...}`），避免 "1 items"。
- 列 `title` 由用户提供，组件不改写。

**危险操作文案（单列）**：Table 本身不直接发起危险操作，但作为批量操作宿主常承载删除等。约定：批量删除按钮文案使用明确动词 + 数量「Delete {count} items」，二次确认走 Popconfirm/Modal，确认按钮 `danger` 态，文案 `Table.bulkDeleteConfirm = This will permanently delete {count} items. This cannot be undone.`，主操作按钮 `Delete`，取消 `Cancel`。删除播报经 liveAnnouncer 通知结果。

## 9. 性能

| 指标 | 预算 / 目标 |
|---|---|
| `@chenzy-design/svelte` Table gzip | ≤ 14 KB |
| `@chenzy-design/core` createTable gzip | ≤ 8 KB（虚拟化引擎含 ~2KB，可 tree-shake 排序/筛选/选择子模块） |
| 初始挂载（10 列 × 1k 行，virtualized） | < 100 ms |
| 滚动帧率（1k+ 行 virtualized） | 稳定 60fps，单帧 JS < 4ms |
| 排序/筛选（client，5k 行） | < 50 ms（memoized pipeline，仅 deps 变更重算） |
| 选择全选 toggle（10k 行） | < 16ms（基于 key Set，不重渲染未变行） |
| 横向滚动固定列同步 | transform-only，无 reflow，< 2ms/帧 |

策略：

- **虚拟化**：行数 > 阈值（默认 100 或显式 `virtualized`）启用，仅渲染视口 + overscan；固定 `itemHeight` 走 O(1) 偏移计算，动态高度走测量缓存。
- **惰性渲染**：`expandable.destroyOnClose`（默认 true）收起即卸载展开内容；筛选浮层惰性挂载。
- **memoization**：数据管道（filter→sort→paginate）纯函数 + 引用相等短路；列模型仅在 `columns` 变更重算。
- **渲染最小化**：行级 keyed each，选择/hover 仅切换行级 class，不重建单元格。
- **避免布局抖动**：固定列同步与虚拟 spacer 用 `transform`/`translate` 而非 `top/left`；`will-change` 受控启用。
- 服务端模式（受控 sort/filter/pagination）下组件不做客户端 pipeline，零额外计算。

## 10. AI 元数据

提供 `component.meta.ts`，导出供 AI/低代码消费的结构化描述：

- `name: 'Table'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Table'`。
- `props`/`events`/`slots` 的机读 schema（类型、默认值、枚举、是否受控、`controlledBy`）。
- `tokens`：组件级 token 列表及 alias 回退。
- `a11y`：`pattern: 'grid|table'`、role 映射、键盘 map。
- `i18nKeys`：全部 key 及默认值。
- `examples`：典型用例片段（基础、排序筛选、行选择、固定列、虚拟化 1k、树形、服务端受控）含可运行 props 快照。
- `recipes`：AI 生成指引（"服务端表格 → 设 pagination 受控 + on:change 对接 fetch"、"大数据 → virtualized + scroll.y + pagination:false"）。
- `antiPatterns`：`rowKey` 不稳定、virtualized 缺 `scroll.y`、固定列未设 `width` 等告警。

## 11. 测试

- **单元（core）**：排序三态循环 / 多列优先级；筛选谓词与多值；选择 indeterminate、shift 范围、跨页 preserve、getCheckboxProps 禁用；树形展平与展开；数据管道 memo 正确性；虚拟区间计算（边界 overscan、动态高度）；固定列偏移与 RTL 镜像。
- **组件（svelte）**：受控 vs 非受控分支；`on:change` 聚合 payload 形状；横向滚动 header/body 同步；loading/empty 渲染；密度档行高；`destroyOnClose` 卸载。
- **a11y**：axe 无违规；`aria-sort`/`aria-rowcount`/`aria-checked=mixed` 断言；键盘漫游（方向键/Home/End/PageDown）；焦点回收 announce；筛选浮层 focus-trap + Esc dismiss。
- **视觉回归**：固定列阴影、斑马纹、选中态、多级表头、small/large 密度、RTL、深色模式 snapshot。
- **性能基准**：1k/10k 行挂载时长、滚动 fps、全选 toggle 时长纳入 CI 性能门禁（回归 > 10% 失败）。
- **i18n**：缺失 key 回退、ICU 复数、RTL 布局快照。

## 12. 验收标准 checklist

- [ ] 列定义驱动渲染：`columns` 与 `<Table.Column>` 两种声明等价。
- [ ] 排序三态（asc/desc/none）+ 多列排序，受控/非受控均正确，触发 `on:change` action='sort'。
- [ ] 筛选多值 + 自定义 `onFilter` + `filteredValue` 受控，浮层遵循 `open + on:openChange`。
- [ ] 分页内置/受控/`false` 三态；`pagination:false` 与虚拟化兼容。
- [ ] 行选择 checkbox/radio、半选、shift 范围、跨页 preserve、禁用项；事件载荷符合表。
- [ ] 行展开 + 树形数据（`childrenColumnName`）+ `destroyOnClose` 默认卸载。
- [ ] 固定列 left/right + 固定表头（`scroll.x/y`），阴影仅滚动时显现，RTL 镜像正确。
- [ ] 虚拟化：1k+ 行仅渲染视口，滚动 60fps，满足 Perf Budget 全部指标。
- [ ] 全部组件 Token 回退 Alias，无写死值，深色/密度切换正确。
- [ ] a11y：grid/table role 正确、键盘漫游完整、axe 0 违规、对比度达标、reduced-motion 生效。
- [ ] i18n：零硬编码，全部 key 可覆盖，日期/数字经 Intl，ICU 复数正确。
- [ ] 危险批量操作走二次确认 + danger 文案 + 播报。
- [ ] headless 逻辑位于 `core/createTable`，渲染位于 `svelte`，复用指定原语。
- [ ] 提供 `component.meta.ts` 且字段完整（props/events/slots/tokens/a11y/i18n/examples/recipes/antiPatterns）。
- [ ] gzip 体积：svelte ≤ 14KB、core ≤ 8KB，子模块可 tree-shake。
- [ ] 单测 / 组件 / a11y / 视觉回归 / 性能基准 / i18n 测试齐全且 CI 性能门禁生效。
