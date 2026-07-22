---
title: Table 表格
name: table
category: show
brief: 表格用于呈现结构化的数据内容，通常会伴随提供对数据进行操作（排序、搜索、分页……）的能力。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/table/01-basic.svelte';
  import basicSrc from '../../demos/table/01-basic.svelte?raw';
  import Jsx from '../../demos/table/03-jsx-render.svelte';
  import jsxSrc from '../../demos/table/03-jsx-render.svelte?raw';
  import RowSelection from '../../demos/table/02-row-selection.svelte';
  import rowSelectionSrc from '../../demos/table/02-row-selection.svelte?raw';
  import CustomRender from '../../demos/table/05-custom-render.svelte';
  import customRenderSrc from '../../demos/table/05-custom-render.svelte?raw';
  import Pagination from '../../demos/table/04-pagination.svelte';
  import paginationSrc from '../../demos/table/04-pagination.svelte?raw';
  import RemoteData from '../../demos/table/06-remote-data.svelte';
  import remoteDataSrc from '../../demos/table/06-remote-data.svelte?raw';
  import Fixed from '../../demos/table/07-fixed.svelte';
  import fixedSrc from '../../demos/table/07-fixed.svelte?raw';
  import SortFilterHeader from '../../demos/table/08-sort-filter-header.svelte';
  import sortFilterHeaderSrc from '../../demos/table/08-sort-filter-header.svelte?raw';
  import ShowSortTip from '../../demos/table/09-show-sort-tip.svelte';
  import showSortTipSrc from '../../demos/table/09-show-sort-tip.svelte?raw';
  import CustomHeaderFilter from '../../demos/table/10-custom-header-filter.svelte';
  import customHeaderFilterSrc from '../../demos/table/10-custom-header-filter.svelte?raw';
  import CustomFilterDropdown from '../../demos/table/11-custom-filter-dropdown.svelte';
  import customFilterDropdownSrc from '../../demos/table/11-custom-filter-dropdown.svelte?raw';
  import FilterConfirm from '../../demos/table/12-filter-confirm.svelte';
  import filterConfirmSrc from '../../demos/table/12-filter-confirm.svelte?raw';
  import CustomFilterItem from '../../demos/table/13-custom-filter-item.svelte';
  import customFilterItemSrc from '../../demos/table/13-custom-filter-item.svelte?raw';
  import Expandable from '../../demos/table/14-expandable.svelte';
  import expandableSrc from '../../demos/table/14-expandable.svelte?raw';
  import ExpandableColumn from '../../demos/table/31-expandable-column.svelte';
  import expandableColumnSrc from '../../demos/table/31-expandable-column.svelte?raw';
  import Tree from '../../demos/table/15-tree.svelte';
  import treeSrc from '../../demos/table/15-tree.svelte?raw';
  import TreeSelect from '../../demos/table/33-tree-select.svelte';
  import treeSelectSrc from '../../demos/table/33-tree-select.svelte?raw';
  import TreeCheckRelation from '../../demos/table/32-tree-check-relation.svelte';
  import treeCheckRelationSrc from '../../demos/table/32-tree-check-relation.svelte?raw';
  import RowCellEvents from '../../demos/table/19-row-cell-events.svelte';
  import rowCellEventsSrc from '../../demos/table/19-row-cell-events.svelte?raw';
  import Stripe from '../../demos/table/20-stripe.svelte';
  import stripeSrc from '../../demos/table/20-stripe.svelte?raw';
  import HeaderStyle from '../../demos/table/21-header-style.svelte';
  import headerStyleSrc from '../../demos/table/21-header-style.svelte?raw';
  import CellHover from '../../demos/table/22-cell-hover.svelte';
  import cellHoverSrc from '../../demos/table/22-cell-hover.svelte?raw';
  import Ellipsis from '../../demos/table/23-ellipsis.svelte';
  import ellipsisSrc from '../../demos/table/23-ellipsis.svelte?raw';
  import EllipsisTooltip from '../../demos/table/24-ellipsis-tooltip.svelte';
  import ellipsisTooltipSrc from '../../demos/table/24-ellipsis-tooltip.svelte?raw';
  import Resizable from '../../demos/table/25-resizable.svelte';
  import resizableSrc from '../../demos/table/25-resizable.svelte?raw';
  import ResizableAdvanced from '../../demos/table/26-resizable-advanced.svelte';
  import resizableAdvancedSrc from '../../demos/table/26-resizable-advanced.svelte?raw';
  import DragSort from '../../demos/table/34-drag-sort.svelte';
  import dragSortSrc from '../../demos/table/34-drag-sort.svelte?raw';
  import Group from '../../demos/table/27-group.svelte';
  import groupSrc from '../../demos/table/27-group.svelte?raw';
  import Virtualized from '../../demos/table/28-virtualized.svelte';
  import virtualizedSrc from '../../demos/table/28-virtualized.svelte?raw';
  import InfiniteScroll from '../../demos/table/29-infinite-scroll.svelte';
  import infiniteScrollSrc from '../../demos/table/29-infinite-scroll.svelte?raw';
  import Dynamic from '../../demos/table/30-dynamic.svelte';
  import dynamicSrc from '../../demos/table/30-dynamic.svelte?raw';
  import UseFullRender from '../../demos/table/18-use-full-render.svelte';
  import useFullRenderSrc from '../../demos/table/18-use-full-render.svelte?raw';
  import HeaderGroup from '../../demos/table/17-header-group.svelte';
  import headerGroupSrc from '../../demos/table/17-header-group.svelte?raw';
  import SpanCell from '../../demos/table/16-span-cell.svelte';
  import spanCellSrc from '../../demos/table/16-span-cell.svelte?raw';
</script>

## 如何使用

往 Table 传入表头 `columns` 和数据 `dataSource` 进行渲染。

<Notice type="primary" title="注意事项">

请为 `dataSource` 中的每个数据项提供一个与其他数据项值不同的 `key`，或者使用 `rowKey` 参数指定一个作为主键的属性名，表格的行选择、展开等绝大多数行操作功能都会使用到。

</Notice>

## 代码演示

### 基本表格

对于表格，最基本的两个参数为 `dataSource` 和 `columns`，前者为数据项，后者为每列的配置，二者皆为数组类型。

<Notice type="primary" title="render 与 Semi 的差异">

本库 `column.render` 只接受 Snippet（渲染富内容），不接受返回字符串的函数。Semi 的返回字符串写法在本库写成一个渲染 `{value} KB` 的 Snippet。这是 React → Svelte 的合理映射。

</Notice>

<DemoBox code={basicSrc}><Basic /></DemoBox>

### JSX 写法

本库以「带 `render` Snippet 的配置式列定义」等价 Semi 的 JSX `<Table.Column>` 写法（Svelte 无 JSX，列定义统一走配置式）。

<DemoBox code={jsxSrc}><Jsx /></DemoBox>

### 行选择操作

往 Table 传入 `rowSelection` 即可打开此功能。

- 点击表头的选择框，会选择 `dataSource` 里所有不是 `disabled` 状态的行。选择所有行回调函数为 `onSelectAll`；
- 点击行的选择框会选中当前行。它的回调函数为 `onSelect`；

<Notice type="primary" title="注意事项">

1. 请务必为 `dataSource` 中每行数据提供一个与其他行值不同的 `key`，或者使用 `rowKey` 参数指定一个作为主键的属性名。
2. 如你遇见在第二页点击行选择后，回到第一页问题，请检查组件渲染是否触发了 `dataSource` 更新（浅对比）。`dataSource` 更新后，非受控的翻页器会回到第一页。请将 `dataSource` 放在 state 内。

</Notice>

<DemoBox code={rowSelectionSrc}><RowSelection /></DemoBox>

### 自定义渲染

用户可以使用 `column.render` 来自定义某一列单元格的渲染，该功能适用于需要渲染较为复杂的单元格内容时。

`render` Snippet 的入参对象包含 `value`（当前单元格值）、`record`（当前行数据）、`index`（行索引）。空数据占位可通过 `emptySnippet` 自定义（对齐 Semi `empty`）。

<DemoBox code={customRenderSrc}><CustomRender /></DemoBox>

### 带分页组件的表格

表格分页目前支持两种模式：受控和非受控模式。

- 受控模式下，分页的状态完全由外部传入，依据为是否往 Table 传入了 `pagination.currentPage` 这个字段。一般情况下，受控模式适用于远程拉取数据并渲染。
- 非受控模式下，Table 默认会将传入的 `dataSource` 长度作为 `total` 传给 Pagination 组件，当然你也可以传入一个 `total` 字段来覆盖 Table 组件的取值，不过我们并不推荐用户在非受控分页模式下传入这个字段。

<DemoBox code={paginationSrc}><Pagination /></DemoBox>

### 拉取远程数据

正常情况下，数据往往不是一次性获取的，我们会在点击页码、过滤器或者排序按钮时从接口重新获取数据，这种情况下请使用**受控模式**来处理分页。用户需往 Table 传入 `pagination.currentPage` 这个字段，此时分页组件的渲染完全依赖于传入的 `pagination` 对象。

<Notice type="primary" title="注意事项">

1. 非受控时，pagination 如果是对象类型则不推荐使用字面量写法，原因是字面量写法会导致表格渲染至初始状态（看起来像是分页器没有生效）。请尽量将引用型参数定义在 render 方法之外，如果使用了 runes 请利用 `$state` 进行存储；
2. 受控模式下，Table 不会对 dataSource 分页，请给 dataSource 传入当前页数据。

</Notice>

<DemoBox code={remoteDataSrc}><RemoteData /></DemoBox>

### 固定列或表头

可以通过设置 column 的 `fixed` 属性以及 `scroll.x` 来进行列固定，通过设置 `scroll.y` 来进行表头固定。

如果是固定值，设置为 >=所有固定列宽之和 + 所有表格列宽之和 的数值。

> - 建议指定 `scroll.x` 为大于表格宽度的**固定值**或百分比。如果是固定值，设置为 `>=所有固定列宽之和+所有表格列宽之和` 的数值。
> - 若列头与内容不对齐或出现列重复或者固定列失效的情况，请指定固定列的宽度 `width`。
> - 请确保表格内部的所有元素在渲染后不会对单元格的高度造成影响（例如含有未加载完成的图片等）。

<DemoBox code={fixedSrc}><Fixed /></DemoBox>

### 带排序和过滤功能的表头

表格内部集成了过滤器和排序控件，用户可以通过在 Column 中传入 `filters` 以及 `onFilter` 开启表头的过滤器控件展示，传入 `sorter` 开启表头的排序控件的展示。

<Notice type="primary" title="注意事项">

1. 请为 `dataSource` 中的每个数据项提供一个与其他数据项值不同的 `key`，或者使用 `rowKey` 参数指定一个作为主键的属性名，表格的行选择、展开等绝大多数行操作功能都会使用到。
2. 排序和筛选列必须设置独立的 `dataIndex`。

</Notice>

<DemoBox code={sortFilterHeaderSrc}><SortFilterHeader /></DemoBox>

sorter 为函数类型时，可以通过函数的第三个参数获取 sortOrder 状态。函数类型为 `(a?: RecordType, b?: RecordType, sortOrder?: 'ascend' | 'descend') => number`。

可通过 `showSortTip` 属性控制是否展示排序提示，默认为 `false`。当开启提示后，鼠标移动至排序图标时，会展示排序提示。**注**：在使用 `sortOrder` 属性受控排序时，`showSortTip` 不生效。

<DemoBox code={showSortTipSrc}><ShowSortTip /></DemoBox>

### 自定义表头筛选

如果你需要将筛选器输入框展示在表头，可在 `title` 传入 Snippet，配合 `filteredValue` 使用。

<DemoBox code={customHeaderFilterSrc}><CustomHeaderFilter /></DemoBox>

### 自定义筛选器

使用 `renderFilterDropdown` 自定义渲染筛选器面板。

你可以在用户输入筛选值的时候调用 `setTempFilteredValue` 存储筛选值，在筛选值输入完毕后调用 `confirm` 触发真正的筛选。也可以通过 `confirm({ filteredValue })` 直接筛选。

设置 `tempFilteredValue` 的原因是在需要存储临时筛选值的场景，不需要自己声明一个 state 保存这个临时筛选值。

```typescript
interface RenderFilterDropdownProps {
  /** 临时筛选值，初始值为 `filteredValue` 或 `defaultFilteredValue` */
  tempFilteredValue: (string | number)[];
  /** 设置临时筛选值 */
  setTempFilteredValue: (tempFilteredValue: (string | number)[]) => void;
  /** confirm 默认会将 tempFilteredValue 赋值给 filteredValue 并触发 onChange 事件。也可传入 filteredValue 直接设置筛选值 */
  confirm: (props?: { closeDropdown?: boolean; filteredValue?: (string | number)[] }) => void;
  /** 清除筛选值、临时筛选值 */
  clear: (props?: { closeDropdown?: boolean }) => void;
  /** 关闭 dropdown */
  close: () => void;
  /** 筛选器配置项，如不需要可以不传 */
  filters?: { text: string; value: string | number }[];
}
```

<DemoBox code={customFilterDropdownSrc}><CustomFilterDropdown /></DemoBox>

### 筛选确认模式

通过设置 `filterConfirmMode='confirm'`，可以让筛选下拉面板支持确认模式。在该模式下：

- 点击筛选项不会立即生效，而是先暂存到临时状态
- 下拉面板底部会显示"确定"和"重置"按钮
- 点击"确定"按钮后才会应用筛选条件并关闭下拉面板
- 点击"重置"按钮会恢复到打开下拉面板时的初始状态（不会关闭面板）

这个功能适用于需要多选筛选条件后再一次性应用的场景，避免每次点击都触发筛选。

<DemoBox code={filterConfirmSrc}><FilterConfirm /></DemoBox>

### 自定义筛选项渲染

支持往 column 中传入 `renderFilterDropdownItem` 自定义每个筛选项的渲染方式。

- `text` 当前筛选项的文案；
- `value` 当前筛选项的值；
- `checked` 当前筛选项是否已经选中；
- `filteredValue` 当前所有的筛选值；
- `filterMultiple` 当前筛选项是否为多选；
- `onChange` 切换当前项的选中态。

配合 `filterDropdownProps: { showTick: true }` 可让选中项左侧显示对勾。

<DemoBox code={customFilterItemSrc}><CustomFilterItem /></DemoBox>

### 可以展开的表格

<Notice type="primary" title="注意事项">

1. 展开按钮会默认与第一列文案渲染在同一个单元格内，你可以通过往 Table 传入 hideExpandedColumn=false 将展开按钮单独作为一列渲染；
2. 请务必为每行数据提供一个与其他行值不同的 key，或者使用 rowKey 参数指定一个作为主键的属性名。

</Notice>

#### 一般可展开行

如果需要渲染可以展开的表格，除了需要在 Table 传 `expandable.expandedRowRender` 这个 Snippet 外，还必须要指定 `rowKey`（默认为 `key`），Table 会根据 `rowKey` 取得行唯一标识符。

- 如果 `rowKey` 为 `Function`，则会把 `rowKey(record)` 的结果作为行唯一 ID
- 如果 `rowKey` 为 `string` 类型，则会把 `record[rowKey]` 作为行唯一 ID

<DemoBox code={expandableSrc}><Expandable /></DemoBox>

#### 展开按钮渲染为单独列 / 关闭某一行的可展开按钮

默认情况，展开按钮会与第一列文案渲染在同一个单元格内，你可以通过传入 `hideExpandedColumn={false}` 来渲染为单独一列；可传入 `expandable.rowExpandable` 方法，入参为 `record`，返回 `false` 时关闭某一行的可展开按钮的渲染。

<DemoBox code={expandableColumnSrc}><ExpandableColumn /></DemoBox>

### 树形数据展示

表格支持树形数据的展示，当数据中有 `children` 字段时会自动展示为树形表格，如果不需要或使用其他字段可以用 `tree.childrenColumnName`（或 `childrenRecordName`）进行配置。另外可以通过设置 `tree.indentSize` 以控制每一层的缩进宽度。

> **注意：** 请务必为每行数据提供一个与其他行值不同的 `key`，或者使用 `rowKey` 参数指定一个作为主键的属性名。

<DemoBox code={treeSrc}><Tree /></DemoBox>

#### 树形选择

默认情况下，表格的行选中是各自独立的，你可以通过定义 `selectedRowKeys` 来模拟一个树形选中。

<DemoBox code={treeSelectSrc}><TreeSelect /></DemoBox>

#### 树形选择关联（checkRelation）

通过设置 `rowSelection.checkRelation` 为 `'related'`，可以实现父子节点选择关联。选中父节点会自动选中所有子节点，选中子节点会影响父节点的状态（全选/半选/未选）。

<DemoBox code={treeCheckRelationSrc}><TreeCheckRelation /></DemoBox>

### 自定义行或单元格事件以及属性

- 传入 `onRow`/`onHeaderRow` 可以定义表格或表头行的原生事件或属性。
- 传入 `column.onCell`/`column.onHeaderCell` 可以定义表格或表头单元格原生事件或属性。

原则上 tr/td/th 上支持的属性或事件都能够被定义。例如下面这个例子：表头的 tr 定义了 `onMouseEnter`/`onMouseLeave`，表格的 tr 定义了 `className`，表格的第三行定义了 `onClick`。

<DemoBox code={rowCellEventsSrc}><RowCellEvents /></DemoBox>

### 实现斑马纹样式

使用 `onRow` 给每行设置一个背景色，实现有斑马纹效果的表格。如果设置了固定列，可以通过 `onCell` 给每列设置一个背景色实现相同效果。

<DemoBox code={stripeSrc}><Stripe /></DemoBox>

### 实现表头样式定制

可以通过 `Column.onHeaderCell` 返回特定 style 或 className，定制表头的样式。如下例子，通过传入 backgroundColor 改变了表头背景色。

<DemoBox code={headerStyleSrc}><HeaderStyle /></DemoBox>

### 实现单元格 Hover 样式定制

Table 默认为整行配置 Hover 样式，如果你需要修改相关样式可以通过 CSS 覆盖的方式自行实现。如下例子，通过 CSS 覆盖，将可 Hover 的背景色或者由行高亮改为 Cell 单元格高亮。

<DemoBox code={cellHoverSrc}><CellHover /></DemoBox>

### 单元格缩略

使用 `ellipsis` 可以让单元格自动实现缩略效果。

<DemoBox code={ellipsisSrc}><Ellipsis /></DemoBox>

设置 `ellipsis.showTitle` 为 false 可以隐藏默认原生的 HTML title。配合 `column.render` 可以自定义内容提示。

<DemoBox code={ellipsisTooltipSrc}><EllipsisTooltip /></DemoBox>

### 可伸缩列

#### 基本伸缩列

对于一些内容比较多的列，可以选择打开伸缩列功能，在表头进行拉拽实现列宽的实时变化。

不过你需要注意一些参数：

- `resizable` 设定为 `true` 或者一个 `object`
- `columns` 里需要伸缩功能的列都要指定 `width` 这个字段（如果不传，该列不具备伸缩功能，且其列宽度会被浏览器自动调整）
- `column.resize` 可以在 resizable 开启后生效，设置为 false 后，列不再支持伸缩。

> 与固定列同时使用时，需指定某一列不设置宽度。

<DemoBox code={resizableSrc}><Resizable /></DemoBox>

#### 进阶的伸缩列

`resizable` 还能为一个 `Object`，包括三个事件方法：`onResize`、`onResizeStart`、`onResizeStop`，分别触发于`列宽改变中`、`开始改变`和`结束改变`三个时机。开发者可以选择在这个时机修改 column，例如在拉拽时增加一个拖动时的竖线效果等，如下例。

<DemoBox code={resizableAdvancedSrc}><ResizableAdvanced /></DemoBox>

### 拖拽排序

把 `sortable` action 挂到包住 Table 的容器上，松手时用 `arrayMove` 更新 `dataSource` 顺序即可实现行拖拽排序。

<Notice type="primary" title="与 Semi 的差异">

Semi 借助 React 的 `dnd-kit` 搭配 `components.body.row` 注入自定义 `SortableRow` 组件实现拖拽排序。本库复刻 dnd-kit 的**核心思路**，提供框架无关的 `sortable` action（`@chenzy-design/svelte`）：拖拽全程**只给行叠加 CSS `transform` 做视觉位移，不改动任何 DOM 结构**，Svelte 始终掌控 DOM；只在松手那一刻用 `arrayMove`（长度守恒）更新一次 `dataSource`。这样与 Table 的 keyed 渲染零冲突，不会像直接操作 DOM 的拖拽库那样丢行（技术栈差异：`dnd-kit` → 本库 `sortable`，可观察结果一致）。

</Notice>

<DemoBox code={dragSortSrc}><DragSort /></DemoBox>

### 表格分组

对于一些数据需要分组展示的表格，可以传入 `groupBy` 定义分组规则，使用 `renderGroupSection` 来定义分组表头的渲染。

> **注意：** 请务必为每行数据提供一个与其他行值不同的 `key`，或者使用 `rowKey` 参数指定一个作为主键的属性名。

<DemoBox code={groupSrc}><Group /></DemoBox>

### 虚拟化表格

虚拟化可用于需要渲染大规模数据的场景，通过配置 `virtualized` 参数来开启这个功能。需要注意的是：

- 必须传递 `scroll.y`（number）与 `style.width`（number）；
- 需要传递每行的高度 `rowHeight`（默认 `48`）与视口高度 `height`（默认 `400`）；
- 虚拟化时忽略 `pagination`（全量滚动）、表头 sticky 固定顶部；
- 可以传入 `getVirtualizedListRef` 获取滚动控制句柄（`scrollTo` / `scrollToItem`）。

以下为渲染 1000 条数据的示例。

<DemoBox code={virtualizedSrc}><Virtualized /></DemoBox>

### 无限滚动

基于虚拟化特性，通过传入 `onReachBottom` 我们可以实现无限滚动加载数据。

<DemoBox code={infiniteScrollSrc}><InfiniteScroll /></DemoBox>

### 受控的动态表格

运行时切换固定表头、边框、行选择、加载态等能力。

<DemoBox code={dynamicSrc}><Dynamic /></DemoBox>

### 完全自定义渲染

一般情况下，使用 `column.render` 即可，但是你也可以通过传递 `column.useFullRender=true` 来开启完全自定义渲染模式，此时复选框按钮、展开按钮、缩进等物料将会透传至 `column.render` 方法中，你可以进一步来定义单元格的内容渲染方式。

其中 `column.title` 可传入 Snippet 摆放列头；`column.render` 的入参含 `expandIcon`、`selection`、`indentText` 三个物料 Snippet。下方的例子将复选框与内容渲染至同一单元格中（配合 `rowSelection.hidden` 隐藏默认选择列）。

<DemoBox code={useFullRenderSrc}><UseFullRender /></DemoBox>

### 表头合并

用户可以通过表头合并功能进行表头的分组，表头合并支持与固定列、虚拟化、数据分组、列伸缩等功能复合使用。通过 `column.children` 定义子列，父列 `title` 横跨其全部叶子列。

<DemoBox code={headerGroupSrc}><HeaderGroup /></DemoBox>

### 行列合并

表格支持行/列合并，使用 `column.onCell` 返回的 `colSpan` 或者 `rowSpan` 设值为 0 时，设置的表格不会渲染；表头列合并可通过设置 `column.colSpan` 进行。

<DemoBox code={spanCellSrc}><SpanCell /></DemoBox>

## API 参考

### Table

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bordered | 是否展示外边框和列边框 | boolean | false |
| childrenRecordName | 树形表格 dataSource 中每行元素中表示子级数据的字段 | string | 'children' |
| class | 最外层样式名（对齐 Semi className） | string | - |
| clickGroupedRowToExpand | 点击分组表头行时分组内容展开或收起 | boolean | false |
| columns | 表格列的配置描述，详见 [Column](#column) | `ColumnDef<T>[]` | [] |
| components | 覆盖组成元素的标签名（`table`/`header`/`body` 的 `wrapper`/`row`/`cell`） | object | - |
| dataSource | 数据。**请为每一条数据分配一个独立的 key，或使用 rowKey 指定一个作为主键的属性名** | `T[]` | [] |
| defaultExpandAllRows | 默认是否展开所有行，动态加载数据时不生效 | boolean | false |
| defaultExpandAllGroupRows | 默认是否展开分组行 | boolean | true |
| direction | RTL、LTR 方向 | 'ltr' \| 'rtl' | 'ltr' |
| empty | 无数据时展示的文案 | string | '暂无数据' |
| emptySnippet | 无数据时展示的自定义内容（优先于 empty，对齐 Semi `empty: ReactNode`） | Snippet | - |
| expandable | 行展开配置，详见 [Expandable](#expandable) | `Expandable<T>` | - |
| expandAllRows | 是否展开所有行 | boolean | false |
| expandRowByClick | 点击行时是否展开可展开行 | boolean | false |
| footer / footerSnippet | 表格尾部（字符串 / Snippet 接收 currentData） | string \| Snippet | - |
| getPopupContainer | 筛选浮层挂载容器 | () => HTMLElement | - |
| getVirtualizedListRef | 返回虚拟化滚动控制句柄（`scrollTo`/`scrollToItem`），仅 virtualized 时有效 | (ref) => void | - |
| groupBy | 分组依据，dataSource 元素中某个键名或返回字符串的方法 | string \| ((record: T) => string) | - |
| headerStyle | 表头单元格的内联样式（应用到所有表头 th，含 fixed 表头） | string \| `Record<string, string>` | - |
| height | 虚拟滚动视口高度（px），virtualized 时生效 | number | 400 |
| hideExpandedColumn | 展开按钮默认与第一列渲染在同一单元格，设为 false 时单独成列 | boolean | true |
| indentSize | 树形结构 TableCell 的缩进大小 | number | 20 |
| keepDOM | 折叠行时是否不销毁被折叠的 DOM | boolean | false |
| loading | 页面是否加载中 | boolean | false |
| pagination | 分页组件配置，详见 [pagination](#pagination) | false \| object | - |
| renderGroupSection | 分组表头渲染 Snippet | `Snippet<[{ groupKey, group }]>` | - |
| renderPagination | 自定义分页器渲染 Snippet | Snippet | - |
| resizable | 是否开启伸缩列功能，需要进行伸缩的列必须提供 width；对象态含 onResize/Start/Stop | boolean \| `ResizableConfig<T>` | false |
| rowClassName | 行样式名生成函数 | (record: T, index: number) => string | - |
| rowHeight | 虚拟滚动行高（px），virtualized 时生效 | number | 48 |
| rowKey | 表格行 key 的取值 | string \| ((record: T) => RowKey) | 'key' |
| rowSelection | 表格行是否可选择，详见 [rowSelection](#rowselection) | `RowSelection<T>` | - |
| scroll | 表格滚动配置，详见 [scroll](#scroll) | object | - |
| showHeader | 是否显示表头 | boolean | true |
| size | 表格尺寸，影响表格行 padding | 'small' \| 'default' \| 'large' | 'default' |
| sortState / defaultSortState | 受控 / 非受控排序状态 | SortState | - |
| sticky | 固定表头 | boolean \| `{ offsetHeader: number }` | false |
| stripe | 斑马纹 | boolean | false |
| title / titleSnippet | 表格标题（字符串 / Snippet） | string \| Snippet | - |
| tree | 树形数据：true 或 `{ childrenColumnName / indentSize / expandedRowKeys / defaultExpandedRowKeys / onExpand }` | boolean \| TreeTable | - |
| virtualized | 行虚拟滚动 | boolean | false |
| onChange | 分页、排序、筛选变化时触发 | (info: TableChangeInfo) => void | - |
| onExpandChange | 行展开/收起（展开行与树形行均触发） | (info) => void | - |
| onGroupedRow | 分组表头行属性回调 | (group: T[], index: number) => RowAttrs | - |
| onHeaderRow | 设置头部行属性 | (columns, index) => RowAttrs | - |
| onReachBottom | 纵向触底（懒加载触发） | () => void | - |
| onRow | 设置行属性，返回的对象会被合并传给表格行 | (record, index, rowStatus?) => RowAttrs | - |
| onScroll | 滚动位置（含触底，用于无限加载） | (info: TableScrollInfo) => void | - |
| onSortChange | 排序变化（受控 sortState 时通知） | (state: SortState) => void | - |

`onRow` / `onHeaderRow` 返回的 `RowAttrs` 支持 `onClick`/`onDoubleClick`/`onMouseEnter`/`onMouseLeave`/`className`/`style`，以及 `draggable` 与 HTML5 拖拽事件（`onDragStart`/`onDragOver`/`onDrop`/`onDragEnd` 等）。

### Column

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | 设置列的对齐方式，RTL 时自动切换 | 'left' \| 'center' \| 'right' | 'left' |
| children | 表头合并时用于子列的设置 | `ColumnDef<T>[]` | - |
| className | 列样式名 | string | - |
| colSpan | 表头列合并，设置为 0 时不渲染 | number | - |
| dataIndex | 列数据在数据项中对应的 key，使用排序或筛选时必传 | string | - |
| defaultFilteredValue | 筛选的默认值 | (string \| number)[] | - |
| defaultSortOrder | 排序的默认值 | 'ascend' \| 'descend' \| null | - |
| ellipsis | 文本缩略，对象态可关掉原生 title 提示 | boolean \| `{ showTitle: boolean }` | false |
| filterChildrenRecord | 是否对子级数据本地过滤（树形） | boolean | - |
| filterConfirmMode | 筛选确认模式（`immediate` 立即生效 / `confirm` 需点确定） | 'immediate' \| 'confirm' | 'immediate' |
| filterDropdownProps | 透传给筛选浮层的配置（`showTick` 让选中项左侧显示对勾） | `{ showTick?: boolean }` | - |
| filteredValue | 筛选的受控属性 | (string \| number)[] \| null | - |
| filterIcon | 自定义 filter 图标 | `Snippet<[{ filtered }]>` | - |
| filterMultiple | 是否多选 | boolean | true |
| filters | 表头的筛选菜单项 | `{ text, value }[]` | - |
| fixed | 列是否固定，可选 true(等效 left) / 'left' / 'right' | boolean \| 'left' \| 'right' | false |
| key | 列唯一键，缺省回退 dataIndex / 列索引 | string | - |
| onCell | 设置单元格属性，返回 `{ colSpan, rowSpan, style, className }` | (record, rowIndex) => object | - |
| onFilter | 本地模式下确定筛选的运行函数 | (value, record) => boolean | - |
| onFilterDropdownVisibleChange | 自定义筛选菜单可见变化时回调 | (visible: boolean) => void | - |
| onHeaderCell | 设置头部单元格属性，返回 `{ style, className, onClick... }` | (column, columnIndex) => object | - |
| render | 单元格自定义渲染 Snippet（useFullRender 时额外收到 expandIcon/selection/indentText 物料） | Snippet | - |
| renderFilterDropdown | 自定义筛选器 dropdown 面板 | `Snippet<[RenderFilterDropdownProps]>` | - |
| renderFilterDropdownItem | 自定义每个筛选项渲染方式 | Snippet | - |
| resize | Table resizable 开启后是否允许本列伸缩 | boolean | true |
| resizable | 列宽可拖拽调整（列级开关，与 Table 级 resizable 并存） | boolean | - |
| showSortTip | 是否展示排序提示（受控 sortOrder 时不生效） | boolean | false |
| sortChildrenRecord | 是否对子级数据本地排序（树形） | boolean | - |
| sorter | 排序：true 按 dataIndex 默认比较，或自定义比较器 `(a, b, sortOrder?) => number` | boolean \| function | - |
| sortIcon | 自定义 sort 图标 | `Snippet<[{ sortOrder }]>` | - |
| sortOrder | 排序的受控属性 | 'ascend' \| 'descend' \| null | - |
| title | 列头显示文字（string）或自定义表头渲染（Snippet）。Snippet 入参含 `filter`/`sorter`/`selection` 物料，由使用方摆放（对齐 Semi title 函数）；摆放物料时组件不再自动前置对应按钮 | string \| Snippet | - |
| useFullRender | 是否完全自定义渲染 | boolean | false |
| width | 列宽度 | string \| number | - |

### rowSelection

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| checkRelation | 父子节点选择关联模式：`'related'` 联动 / `'unRelated'` 独立 | 'related' \| 'unRelated' | - |
| checkStrictly | 树形表父子选择是否独立（false 联动、true 独立），与 checkRelation 互补 | boolean | false |
| clickRow | 点击行任意位置触发行选择/取消 | boolean | false |
| columnWidth | 自定义选择列宽度 | string \| number | - |
| defaultSelectedRowKeys | 非受控初始选中 | RowKey[] | - |
| disabled | 表头的 Checkbox 是否禁用 | boolean | false |
| fixed | 把选择框列固定在左边 | boolean \| 'left' | - |
| getCheckboxProps | 逐行定制复选框属性（如 disabled） | (record: T) => `{ disabled?: boolean }` | - |
| hidden | 隐藏选择列（选择状态仍生效，配合 useFullRender 摆放选择框） | boolean | false |
| hideSelectAll | 隐藏全选框 | boolean | false |
| renderCell | 自定义渲染勾选框（含 header），入参 `{ selected, record, originNode, inHeader, disabled, indeterminate... }` | Snippet | - |
| selectedRowKeys | 受控选中行 key 列表 | RowKey[] | - |
| type | 选择方式：checkbox（多选）或 radio（单选） | 'checkbox' \| 'radio' | 'checkbox' |
| onChange | 选中项发生变化时的回调 | (keys: RowKey[], rows: T[]) => void | - |
| onSelect | 用户手动点击某行选择框的回调 | (record, selected, selectedRows) => void | - |
| onSelectAll | 用户手动点击表头选择框的回调 | (selected, selectedRows, changedRows) => void | - |

### Expandable

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| expandedRowRender | 额外的展开行渲染 Snippet | `Snippet<[{ record, index }]>` | - |
| rowExpandable | 该行是否可展开 | (record: T) => boolean | - |
| expandedRowKeys | 受控展开行 key 列表 | RowKey[] | - |
| defaultExpandedRowKeys | 非受控初始展开 | RowKey[] | - |
| onExpand | 展开/收起回调 | (expanded: boolean, record: T) => void | - |

### scroll

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| x | 设置横向滚动区域的宽（像素/百分比/'max-content'） | string \| number | - |
| y | 设置纵向滚动区域的高（像素值） | number | - |
| scrollToFirstRowOnChange | 分页、排序、筛选变化后是否自动滚动到表格顶部 | boolean | false |

### pagination

翻页组件配置。`pagination` 建议不要使用字面量写法。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| currentPage | 当前页码（受控，对齐 Semi） | number | - |
| defaultCurrentPage | 默认的当前页码 | number | 1 |
| pageSize | 每页条数 | number | 10 |
| total | 数据总数（受控远程分页时覆盖本地数据长度） | number | - |
| position | 分页器位置 | 'bottom' \| 'top' \| 'both' | 'bottom' |
| formatPageText | 翻页区域左侧文案自定义格式化，传 false 关闭文案显示 | boolean \| ((info) => string) | true |
| onPageChange | 页码变化 | (page: number) => void | - |

## 无障碍

### ARIA

- 交互型表格的 role 为 `grid`（含 `aria-rowcount`/`aria-colcount`），纯展示型为 `table`；树形表格新增 `aria-level` 表示层级。
- 行的 role 为 `row`（含 `aria-rowindex`），单元格的 role 为 `gridcell`（含 `aria-colindex`），列头为 `columnheader`（含 `aria-sort`）。
- 可展开表格行具有 `aria-expanded` 属性。
- 排序、筛选、分页、选择操作结果通过 live region 向屏幕阅读器播报；行复选框使用原生 `<input type="checkbox">` 并提供 `aria-label`，半选态设 `indeterminate`。
- 键盘遵循 WAI-ARIA Grid Pattern：方向键在单元格间漫游（roving tabindex），Home/End、PageUp/PageDown 导航，Enter/F2 进入单元格交互模式，Esc 退出。

## 文案规范

- 表格标题
  - 表格标题应清晰的让用户感知到表格的目的；
  - 为复杂表格添加描述，为用户提供更多关于表格的上下文信息；
  - 使用句子大小写；
- 列标题
  - 保持列标题简洁，建议使用 1-2 个词作为列标题；
  - 当列标题较长时，建议 2 行显示，剩余文字缩略并在 Tooltip 中显示完全；
  - 列标题使用句子大小写；
- 表格操作
  - 可以遵循 Button 的文案规范。
