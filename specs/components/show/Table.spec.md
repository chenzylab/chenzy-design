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

- **结构语义**：对齐 Semi，`role` 静态标注为 `grid`（普通表）或 `treegrid`（分组 `groupBy` / 展开行 `expandedRowRender` / 树形 `tree` 任一存在），不因交互能力（排序/筛选/行选择等）与否切换；配合 `role="row"`/`role="columnheader"`/`role="gridcell"` 显式标注，DOM 用 `div` 分层（headerWrapper / bodyWrapper / 固定列 layer）。
- **视觉层级**：表头底色 `--cd-table-header-bg`（弱于内容区，建立"控制区 vs 数据区"对比），行边框使用 `--cd-color-border` 的低对比变体（`--cd-table-border-color`），保证密集数据下不产生网格噪音。
- **密度（density）**：`small | default | middle` 对应行高与单元格 padding 三档，满足"信息密集报表 → 舒适浏览"的尺度切换；密度只改 spacing token，不改字号语义。
- **状态语义**：行 hover（`--cd-table-row-hover-bg`）、选中（`--cd-table-row-selected-bg`）、斑马纹（`--cd-table-row-stripe-bg`）三种背景态分层，选中态对比度优先级最高。
- **固定列视觉**：固定列与滚动区交界处使用渐变阴影（`--cd-table-fixed-shadow`），且仅在横向滚动发生时显现（`scrollLeft > 0` / 未触底），用阴影而非硬边界传达"层叠浮起"。
- **运动**：展开/收起行使用高度过渡，排序图标切换无位移仅状态色变化；`prefers-reduced-motion` 下取消展开动画与阴影渐变过渡。
- **空与载入**：空数据复用 Empty 语义占满 body 宽度并垂直居中；`loading` 时复用 Spin 组件（对齐 Semi），保留已有结构避免布局抖动。

## 3. 分层实现

属于重交互 + 重性能组件，拆分为 headless `core` 与 Svelte 渲染层。

**@chenzy-design/core · `createTable`**

承载所有与 DOM 框架无关的状态机与算法：

- 列模型规整（扁平化多级表头、计算 `fixed` 列偏移 left/right、列宽分配/`scroll.x` 溢出）。
- 排序状态机（单列/多列、`ascend|descend|null` 三态循环、`sortOrder` 受控合并）。
- 筛选状态机（多值筛选、`filteredValue` 受控、`onFilter` 谓词执行）。
- 选择状态机（`selectedRowKeys` 维护、半选 indeterminate 计算、跨页保留、`getCheckboxProps` 禁用合并、shift 范围选择）。
- 展开状态机（顶层 `expandedRowKeys`、树形 `childrenRecordName` 递归展平为可视行序列，二者共用同一份状态）。
- 数据管道（client 模式下 filter → sort → paginate 的纯函数组合 pipeline，memoized）。
- **虚拟化引擎**：复用通用 `createVirtualizer`（rowHeight 固定/动态测量、overscan、scrollTop → 可视区间 startIndex/endIndex、累积偏移 translateY）。
- 复用原语：`useId`（生成 table id / aria-describedby）、`useLiveAnnouncer`（排序/筛选/分页/选择结果播报）、`useScrollLock`（不适用，省）。

`createTable` 暴露 store（`rows$`、`flatColumns$`、`sortState$`、`selectionState$`、`virtualRange$`）+ action（`toggleSort`、`setFilter`、`toggleSelect`、`selectAll`、`toggleExpand`、`onBodyScroll`）。

**@chenzy-design/svelte · `Table.svelte`**

- 订阅 store 渲染 DOM（headerWrapper / bodyWrapper / 左右固定列 layer / 虚拟 spacer）。
- 子组件：`Table.Column`（声明式列，亦支持 `columns` 数组式）、内置 `Selection`/`Expand`/`Sorter`/`Filter` 渲染件。
- 滚动同步：横向滚动时 header 与 body `transform: translateX` 同步；纵向虚拟化由 body 滚动驱动 `onBodyScroll`。
- 透传 `render` slot/函数获得 `{ text, record, index, column }`。
- role 标注对齐 Semi 静态语义：无分组/展开行渲染/树形时输出 `role="grid"`，命中任一则 `role="treegrid"`；不因排序/筛选/行选择/onRow 等交互能力切换。

## 4. API

### Props

> 本表由 `packages/svelte/src/table/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| columns | `ColumnDef<T>[]` | `[]` | 列定义：key/dataIndex/title/width/fixed/resize/align/className/ellipsis/sorter/filters/onFilter/filterConfirmMode/render；children 表头合并（子列，父列 title 横跨叶子列）；onCell 返回 colSpan/rowSpan 行列合并（值 0 跳过渲染）；useFullRender 完全自定义（render 额外收到 expandIcon/indentText 物料自行摆放） |
| children | `Snippet` | `undefined` | 组合式列容器（对齐 Semi Table.Column）：放 <Column> 子组件声明列，嵌套 <Column> 即表头合并。与 columns 并存，传了 columns 用配置式否则用组合式收集 |
| dataSource | `T[]` | `[]` | 数据行 |
| rowKey | `string \| ((record: T) => RowKey)` | `'key'` | 行唯一键解析 |
| size | `'small'\|'default'\|'middle'` | `'default'` |  |
| tableLayout | `'' \| 'auto' \| 'fixed'` | `''` | 控制 `<table>` 的 table-layout（对齐 Semi）。缺省沿用既有推导：存在 fixed 列时 fixed，否则 auto；显式传值覆盖推导 |
| bordered | `boolean` | `false` | 单元格边框 |
| stripe | `boolean` | `false` | 斑马纹 |
| loading | `boolean` | `false` | 加载态；复用 Spin 组件（对齐 Semi `<Spin spinning size="large">`），包裹标题/分页/表体/footer 整个内容区 |
| sortState | `SortState` | `undefined` | 受控排序态；受控时不回写，仅 onSortChange |
| defaultSortState | `SortState` | `{ key: null, order: null }` | 非受控初始排序 |
| onSortChange | `(state: SortState) => void` | `undefined` |  |
| pagination | `false \| { pageSize?: number; currentPage?: number; defaultCurrentPage?: number; onPageChange?: (page: number) => void }` | `undefined` | false 关闭；对象/缺省启用内置分页(pageSize 默认 10)。currentPage 受控不回写 |
| rowSelection | `RowSelection<T>` | `undefined` | selectedRowKeys 受控不回写；defaultSelectedRowKeys / onChange / getCheckboxProps；checkStrictly(默认 false) 树形父子联动开关：false 勾父连带勾后代+后代部分选中父行半选，true 父子独立 |
| expandedRowRender | `Snippet<[{ record: T; index: number }]>` | `undefined` | 展开行内容渲染（对齐 Semi 顶层 expandedRowRender）。传入即启用展开行能力，与 tree 树形共用同一份 expandedRowKeys 状态 |
| rowExpandable | `(record: T) => boolean` | `undefined` | 该行是否可展开，默认全部可展开（对齐 Semi 顶层 rowExpandable，同时作用于展开行与树形展开图标） |
| expandedRowKeys | `RowKey[]` | `undefined` | 受控展开行 key 列表（对齐 Semi 顶层 expandedRowKeys）：同时驱动 expandedRowRender 展开行与树形 children 渲染。受控时不回写，仅经 onExpand / onExpandedRowsChange 通知 |
| defaultExpandedRowKeys | `RowKey[]` | `undefined` | 非受控初始展开行 key 列表（对齐 Semi 顶层 defaultExpandedRowKeys） |
| onExpand | `(expanded: boolean, record: T) => void` | `undefined` | 单行展开/收起时触发（对齐 Semi 顶层 onExpand） |
| onExpandedRowsChange | `(records: T[]) => void` | `undefined` | 展开行 key 集合变化时触发，入参为完整展开行记录数组而非 key 数组（对齐 Semi 顶层 onExpandedRowsChange） |
| tree | `boolean` | `undefined` | 树形数据开关（本库保持显式 opt-in，不像 Semi 靠 dataSource 含 childrenRecordName 字段自动判定）。开启后行含 childrenRecordName 字段自动嵌套，第一列内展开三角+逐级缩进；排序/分页/筛选作用于顶层行；子级字段名见 childrenRecordName、缩进见 indentSize |
| childrenRecordName | `string` | `'children'` | 树形 dataSource 中子级字段名（对齐 Semi childrenRecordName） |
| rowClassName | `(record: T, index: number) => string` | `undefined` |  |
| empty | `string` | `'暂无数据'` | 空数据占位文案 |
| aria-label | `string` | `undefined` | table aria-label |
| onRowClick | `(info: { record: T; index: number }) => void` | `undefined` |  |
| virtualized | `boolean` | `false` | 行虚拟滚动：仅渲染视口内行，适合大数据(1000+)。启用时忽略 pagination(全量滚动)、表头 sticky 固定顶部；假定行等高，不建议与 expandedRowRender 混用 |
| height | `number` | `400` | 虚拟滚动视口高度(px)，virtualized 时生效 |
| rowHeight | `number` | `48` | 虚拟滚动行高(px)，virtualized 时生效 |
| onChange | `(info: TableChangeInfo) => void` | `undefined` | 聚合事件：排序/筛选/分页任一变化的主入口（受控数据回流） |
| onFilterChange | `(info: { dataIndex: string; values: (string\|number)[] }) => void` | `undefined` | 筛选状态变化（含重置） |
| onPaginationChange | `(info: { current: number; pageSize: number }) => void` | `undefined` | 分页变化 |
| onSelectChange | `(info: { selectedRowKeys: RowKey[]; selectedRows: T[] }) => void` | `undefined` | 选择集变化（与 rowSelection.onChange 同时触发） |
| onExpandChange | `(info: { expanded: boolean; record: T; expandedRowKeys: RowKey[] }) => void` | `undefined` | 行展开/收起（展开行与树形行均触发） |
| onScroll | `(info: TableScrollInfo) => void` | `undefined` | 滚动位置（含触底，用于无限加载） |
| onReachBottom | `() => void` | `undefined` | 纵向触底（懒加载触发），距底 reachBottomThreshold 像素内触发一次 |
| reachBottomThreshold | `number` | `0` | onReachBottom 触发阈值（距底像素），默认 0（精确触底） |
| scroll | `ScrollConfig` | `undefined` | 横/纵向滚动配置：x 设最小宽度横向溢出，y 设最大高度纵向溢出；scrollToFirstRowOnChange 分页/排序/筛选变化后滚回顶部 |
| components | `{ table?; header?; body? }（tag 名 + body.colgroup 槽位）` | `undefined` | 覆盖组成元素 tag（对齐 Semi）：thead/tbody/行经 svelte:element 换标签，内部 class/role/事件仍注入；body.colgroup.{wrapper,col} 覆盖 colgroup/col 标签名（对齐 Semi ColGroup 消费的 components.body.colgroup，唯一真被 Semi 自身消费的 components 子槽位）。header.outer/body.outer/footer.* 未实现：核实 Semi 源码（Table.tsx renderFooter、HeadTable.tsx/Body 渲染）发现这些槽位在 Semi 自身实现里也未被消费（仅存在于 TableComponents 类型声明），本库不补充空转槽位 |
| getVirtualizedListRef | `(ref: { scrollTo; scrollToItem }) => void` | `undefined` | 返回虚拟化滚动控制句柄，仅 virtualized 有效（对齐 Semi） |
| sticky | `boolean \| { top?: number }` | `false` | 表头吸顶（v2.21+）：true 时 sticky 定位并自动切换 fixed 布局；对象可指定 top（距滚动容器顶部偏移 px） |
| showHeader | `boolean` | `true` | 是否显示表头 |
| defaultExpandAllRows | `boolean` | `false` | 默认展开全部行（含树形行） |
| getPopupContainer | `() => HTMLElement` | `undefined` | 筛选浮层挂载容器，默认跟随触发按钮 |
| onRow | `(record: T, index: number, rowStatus?: { disabled?; selected? }) => { onClick?; onDoubleClick?; onMouseEnter?; onMouseLeave?; className?; style? }` | `undefined` | 行级事件与属性（返回值合并到 tr；第三参 rowStatus 含 disabled/selected） |
| onHeaderRow | `(columns: ColumnDef<T>[], index: number) => { onClick?; className?; style? }` | `undefined` | 表头行级事件与属性 |
| expandRowByClick | `boolean` | `false` | 点击行体触发展开/收起 |
| expandCellFixed | `boolean \| 'left' \| 'right'` | `undefined` | 展开图标列固定方向 |
| keepDOM | `boolean` | `false` | true 时保留已展开行 DOM 但隐藏（display:none） |
| indentSize | `number` | `20` | 树形缩进像素（对齐 Semi 顶层 indentSize） |
| groupBy | `string \| ((record: T) => string)` | `undefined` | 按字段名或函数对数据行分组，插入分组标题行 |
| renderGroupSection | `Snippet<[{ groupKey: string; group: T[] }]>` | `undefined` | 自定义分组标题渲染 |
| clickGroupedRowToExpand | `boolean` | `false` | 点击分组标题行折叠/展开该组内数据行（groupBy 时生效，disclosure 模式 role=button+aria-expanded+Enter/Space 可达） |
| defaultExpandAllGroupRows | `boolean` | `false` | 非受控：默认是否展开分组行。对齐 Semi，仅显式 true 才默认展开，缺省与 false 均默认折叠。动态加载数据不生效 |
| expandAllGroupRows | `boolean` | `undefined` | 受控：true 展开全部分组、false 折叠全部分组；受控时不回写，仅经 onGroupExpandChange 通知 |
| onGroupExpandChange | `(info: { groupKey: string; expanded: boolean; expandedGroupKeys: string[] }) => void` | `undefined` | 分组展开/收起变化回调（点击分组标题行触发）。**Semi 无此专属回调**：核实 Semi Table 官方 API（onChange/onExpand/onExpandedRowsChange/onGroupedRow 等）不含逐组展开变化通知，仅有 expandAllGroupRows/clickGroupedRowToExpand 等控制型 props；本库参照 Semi 展开行 onExpand 的模式补充，属合理扩展 |
| onGroupedRow | `(group: T[], index: number) => { onClick?; onDoubleClick?; className?; style? }` | `undefined` | 分组标题行自定义属性回调（类似 onRow，仅作用于分组头行），返回值合并进分组头 tr |
| titleSnippet | `Snippet` | `undefined` | 表格顶部标题区域 |
| footerSnippet | `Snippet<[{ currentData: T[] }]>` | `undefined` | 表格底部内容区域（接收 currentData） |
| renderPagination | `Snippet<[{ total: number; currentPage: number; pageSize: number; onChange: (page: number) => void }]>` | `undefined` | 自定义分页器渲染，替换内置 Pagination UI；调用 onChange(page) 触发内部翻页（受控 currentPage 不回写） |
| expandIcon | `Snippet<[{ expanded: boolean; record: T }]>` | `undefined` | 自定义展开行的展开/收起图标（替换默认三角），仅 expandedRowRender 展开列生效 |
| hideExpandedColumn | `boolean` | `true` | 展开按钮是否并入首列。默认 true（并入首列，对齐 Semi）；false 时展开按钮单独成列 |
| rowSpanHover | `boolean` | `false` | 合并单元格（rowSpan）时 hover 高亮整个合并区（渐进能力，依赖单元格合并） |
| headerStyle | `string \| Record<string, string>` | `undefined` | 表头单元格（所有 th，含 fixed 表头）自定义内联样式 |

**事件**（回调 prop 形式，对齐 Semi）：

| 事件 | 说明 |
| --- | --- |
| `onChange` | 排序/筛选/分页任一变化的聚合主入口（受控数据回流） |
| `onSortChange` | 表头排序切换(三态循环) |
| `onFilterChange` | 列筛选状态变化（含重置） |
| `onPaginationChange` | 分页变化 |
| `onSelectChange` | 选择集变化（与 rowSelection.onChange 同时触发） |
| `onExpandChange` | 行展开/收起（展开行与树形行均触发） |
| `onGroupExpandChange` | 分组展开/收起（点击分组标题行触发）。Semi 无此专属回调，本库合理扩展（详见上方 Props 表该行说明） |
| `onScroll` | 滚动位置（含触底） |
| `onReachBottom` | 纵向触底（懒加载触发） |
| `rowSelection.onChange` | 行选择变更，回传 keys 与对应 rows |
| `pagination.onChange` | 页码变更 |
| `onRowClick` | 行点击(复选框/排序按钮已阻止冒泡) |

`ColumnDef<T>` 关键字段：`dataIndex`、`title`、`key`、`width`、`align('left'|'center'|'right')`、`fixed('left'|'right'|true)`、`ellipsis`、`sorter(boolean|(a,b)=>number|{multiple})`、`sortOrder`、`defaultSortOrder`、`filters`、`filteredValue`、`onFilter`、`filterMultiple`、`render`、`colSpan`/`rowSpan`(via `onCell`)、`resize`、`children`(多级表头)。

`RowSelection<T>`：`type('checkbox'|'radio')`、`selectedRowKeys`、`defaultSelectedRowKeys`、`onChange`、`onSelect`、`onSelectAll`、`getCheckboxProps`、`fixed`、`columnWidth`、`preserveSelectedRowKeys`(跨页/筛选保留)、`hideSelectAll`。

### Events

| 事件 | 说明 |
| --- | --- |
| `onChange` | 排序/筛选/分页任一变化的聚合主入口（受控数据回流） |
| `onSortChange` | 表头排序切换(三态循环) |
| `onFilterChange` | 列筛选状态变化（含重置） |
| `onPaginationChange` | 分页变化 |
| `onSelectChange` | 选择集变化（与 rowSelection.onChange 同时触发） |
| `onExpandChange` | 行展开/收起（展开行与树形行均触发） |
| `onGroupExpandChange` | 分组展开/收起（点击分组标题行触发）。Semi 无此专属回调，本库合理扩展（详见上方 Props 表该行说明） |
| `onScroll` | 滚动位置（含触底） |
| `onReachBottom` | 纵向触底（懒加载触发） |
| `rowSelection.onChange` | 行选择变更，回传 keys 与对应 rows |
| `pagination.onChange` | 页码变更 |
| `onRowClick` | 行点击(复选框/排序按钮已阻止冒泡) |

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
| `expandIcon` | `{ expanded, record }` | 自定义展开行展开/收起图标（替换默认三角） |
| `renderPagination` | `{ total, currentPage, pageSize, onChange }` | 自定义分页器渲染（替换内置 Pagination） |
| `renderGroupSection` | `{ groupKey, group }` | 自定义分组标题渲染 |
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
| `--cd-table-row-height-lg` | `--cd-size-11` | middle 行高（旧 token 名沿用 -lg 后缀，未随 size 值改名 large→middle 重命名，见下方"设计变量"章节的真实 token 表） |
| `--cd-table-fixed-shadow` | `--cd-shadow-2` | 固定列层叠阴影 |
| `--cd-table-sort-active-color` | `--cd-color-primary` | 激活排序图标色 |
| `--cd-table-filter-active-color` | `--cd-color-primary` | 激活筛选图标色 |
| `--cd-table-loading-mask` | `--cd-color-bg-0` (alpha) | 加载遮罩 |
| `--cd-table-expand-icon-color` | `--cd-color-text-2` | 展开箭头色 |

校验态：单元格内承载表单时由内部子组件消费 `--cd-color-danger`/`warning`，Table 本身不额外定义 status token。深色模式由 Alias 层切换，组件 Token 自动继承。

## 6. 无障碍

对齐 Semi：`role` 静态标注为 `grid`/`treegrid`（分组/展开行渲染/树形任一存在时 `treegrid`），不提供方向键漫游或 roving tabindex（Semi 无此实现，本库不自造超集，浏览器默认 Tab 序逐格移动）。

- **role 结构**：table 静态 `role="grid"` 或 `"treegrid"`（含 `aria-rowcount`/`aria-colcount`，均为顶层数据源真实行数/列数，非虚拟化渲染切片数），表头行 `role="row"` + `aria-rowindex`，表头格 `role="columnheader"` + `aria-colindex` + `aria-sort="ascending|descending|none"`（可排序列），数据行 `role="row"`（`aria-rowindex`/`aria-expanded`/`aria-level` 视展开/树形层级而定），数据格 `role="gridcell"` + `aria-colindex`。
- **选择**：行复选框为原生 `<input type=checkbox>` 带 `aria-label`（`Table.selectRow` 注入行标识）；全选框 `aria-label=Table.selectAll`，半选用 `indeterminate` 属性。
- **排序**：排序触发器为 `<button>` 嵌于 columnheader，`aria-label` 形如 `Table.sortBy {column}`，激活后更新 `aria-sort`；变更经 `useLiveAnnouncer` 播报 `Table.sortedAnnounce`。
- **筛选**：筛选触发器 `<button aria-haspopup="listbox" aria-expanded>` 控制浮层，浮层内 focus-trap + Esc dismiss。
- **键盘**：浏览器默认 Tab 序逐格移动（无自定义漫游）；`Space`/`Enter` 触发聚焦控件的默认行为（checkbox 勾选、button 点击等），展开行内容获得独立 tab 序列。
- **对比度**：选中/hover/斑马纹背景与文字均 ≥ 4.5:1；排序激活色与表头底色 ≥ 3:1（图标 graphical object）。固定列阴影不作为唯一信息载体。
- **reduced-motion**：取消展开高度动画与固定列阴影过渡，立即态切换。
- **RTL**：`dir=rtl` 下 `fixed:left/right` 与偏移计算镜像，排序/展开图标方向翻转，`text-align` 默认随 `start/end`。

## 7. 国际化

用户可见文案零硬编码，经 `locale` prop 或全局 i18n provider 注入。日期/数字列由用户在 `render` 中使用 `Intl.DateTimeFormat`/`Intl.NumberFormat`（组件透传当前 locale 至 `render` 上下文）。

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-07-30 重校）。键名与键值都是 Semi 契约，勿手写「规划中」的键——历史上本表列过大量从未实现的键名，见 [[locale-dangling-keys-render-raw-key]]。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `Table.emptyText` | 暂无数据 |
| `Table.selectAll` | 全选 |
| `Table.selectRow` | 选择此行 |
| `Table.expandRow` | 展开行 |
| `Table.collapseRow` | 收起行 |
| `Table.ascend` | 点击升序 |
| `Table.descend` | 点击降序 |
| `Table.cancelSort` | 取消排序 |
| `Table.filter` | 筛选 |
| `Table.resetFilter` | 重置 |
| `Table.confirmFilter` | 确定 |
| `Table.resizeColumn` | 拖拽调整列宽 |
| `Table.sortedAnnounce` | 已按 {column} {order}排序 |
| `Table.sortClearedAnnounce` | 已取消 {column} 排序 |
| `Table.sortOrderAscend` | 升序 |
| `Table.sortOrderDescend` | 降序 |
| `Table.rowCount` | {count} 行 |
| `Table.pageText` | 显示第 {currentStart} 条-第 {currentEnd} 条，共 {total} 条 |

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
- **惰性渲染**：`keepDOM`（默认 false）收起即卸载展开内容，true 时保留 DOM 隐藏；筛选浮层惰性挂载。
- **memoization**：数据管道（filter→sort→paginate）纯函数 + 引用相等短路；列模型仅在 `columns` 变更重算。
- **渲染最小化**：行级 keyed each，选择/hover 仅切换行级 class，不重建单元格。
- **避免布局抖动**：固定列同步与虚拟 spacer 用 `transform`/`translate` 而非 `top/left`；`will-change` 受控启用。
- 服务端模式（受控 sort/filter/pagination）下组件不做客户端 pipeline，零额外计算。

## 10. AI 元数据

提供 `component.meta.ts`，导出供 AI/低代码消费的结构化描述：

- `name: 'Table'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Table'`。
- `props`/`events`/`slots` 的机读 schema（类型、默认值、枚举、是否受控、`controlledBy`）。
- `tokens`：组件级 token 列表及 alias 回退。
- `a11y`：`pattern: 'grid|treegrid'`、role 映射（静态标注，非交互态切换）。
- `i18nKeys`：全部 key 及默认值。
- `examples`：典型用例片段（基础、排序筛选、行选择、固定列、虚拟化 1k、树形、服务端受控）含可运行 props 快照。
- `recipes`：AI 生成指引（"服务端表格 → 设 pagination 受控 + on:change 对接 fetch"、"大数据 → virtualized + scroll.y + pagination:false"）。
- `antiPatterns`：`rowKey` 不稳定、virtualized 缺 `scroll.y`、固定列未设 `width` 等告警。

## 11. 测试

- **单元（core）**：排序三态循环 / 多列优先级；筛选谓词与多值；选择 indeterminate、shift 范围、跨页 preserve、getCheckboxProps 禁用；树形展平与展开；数据管道 memo 正确性；虚拟区间计算（边界 overscan、动态高度）；固定列偏移与 RTL 镜像。
- **组件（svelte）**：受控 vs 非受控分支；`on:change` 聚合 payload 形状；横向滚动 header/body 同步；loading/empty 渲染；密度档行高；`destroyOnClose` 卸载。
- **a11y**：axe 无违规；`aria-sort`/`aria-rowcount`/`role=grid|treegrid` 静态标注断言；筛选浮层 focus-trap + Esc dismiss。
- **视觉回归**：固定列阴影、斑马纹、选中态、多级表头、small/middle 密度、RTL、深色模式 snapshot。
- **性能基准**：1k/10k 行挂载时长、滚动 fps、全选 toggle 时长纳入 CI 性能门禁（回归 > 10% 失败）。
- **i18n**：缺失 key 回退、ICU 复数、RTL 布局快照。

## 12. 验收标准 checklist

- [ ] 列定义驱动渲染：`columns` 与 `<Table.Column>` 两种声明等价。
- [ ] 排序三态（asc/desc/none）+ 多列排序，受控/非受控均正确，触发 `on:change` action='sort'。
- [ ] 筛选多值 + 自定义 `onFilter` + `filteredValue` 受控，浮层遵循 `open + on:openChange`。
- [ ] 分页内置/受控/`false` 三态；`pagination:false` 与虚拟化兼容。
- [ ] 行选择 checkbox/radio、半选、shift 范围、跨页 preserve、禁用项；事件载荷符合表。
- [ ] 行展开 + 树形数据（`childrenRecordName`）+ `keepDOM` 默认卸载。
- [ ] 固定列 left/right + 固定表头（`scroll.x/y`），阴影仅滚动时显现，RTL 镜像正确。
- [ ] 虚拟化：1k+ 行仅渲染视口，滚动 60fps，满足 Perf Budget 全部指标。
- [ ] 全部组件 Token 回退 Alias，无写死值，深色/密度切换正确。
- [ ] a11y：grid/treegrid role 静态标注正确、axe 0 违规、对比度达标、reduced-motion 生效。
- [ ] i18n：零硬编码，全部 key 可覆盖，日期/数字经 Intl，ICU 复数正确。
- [ ] 危险批量操作走二次确认 + danger 文案 + 播报。
- [ ] headless 逻辑位于 `core/createTable`，渲染位于 `svelte`，复用指定原语。
- [ ] 提供 `component.meta.ts` 且字段完整（props/events/slots/tokens/a11y/i18n/examples/recipes/antiPatterns）。
- [ ] gzip 体积：svelte ≤ 14KB、core ≤ 8KB，子模块可 tree-shake。
- [ ] 单测 / 组件 / a11y / 视觉回归 / 性能基准 / i18n 测试齐全且 CI 性能门禁生效。
