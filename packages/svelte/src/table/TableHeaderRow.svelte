<!--
  TableHeaderRow — 单层表头 <tr> 渲染（对齐 Semi table/TableHeaderRow.tsx 文件结构）。

  阶段B补做：原表头 <tr> 渲染内联在 Table.svelte 里，本次把 DOM 结构搬到独立文件，
  纯结构重构，不改变任何视觉输出/行为。Table.svelte 仍持有全部状态与业务逻辑
  （排序/筛选/resize/固定列偏移等），本组件通过 props 消费——Svelte 惯用法，
  不要求消灭跨组件状态依赖。

  两种 variant（对齐两处渲染点的实质差异，非同一份模板渲染两次）：
  - variant="leaf"：level 0，叶子列或含表头合并时最底层前的首行。渲染 expand/selection
    前置 th（可能 rowspan 跨表头合并全部层）+ 叶子列（含排序按钮/筛选按钮/resize handle）
    或表头合并首行的分组格。调用 onHeaderRow 取行级属性。
  - variant="group"：表头合并模式下 level 1+ 的分组行，只渲染分组/叶子格，无前置列，
    不调用 onHeaderRow（对齐 Semi 只对第 0 行取 headerRowProps）。

  onRowEl 回调把渲染出的 <tr> DOM 节点回传给 Table.svelte 做 measureHeaderRow 测量
  （消费方逻辑，留在 Table.svelte，不属于本展示组件职责）。用回调而非 bind:this/$bindable——
  level 1+ 按数组下标动态赋值时，数组初始为空令目标表达式求值为 undefined，Svelte 5
  的 $bindable fallback 值场景禁止 bind:x={undefined}，回调式规避该限制。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import type { ColumnDef, RowSelection } from './types.js';
  import ColumnSelection from './ColumnSelection.svelte';
  import ColumnSorter from './ColumnSorter.svelte';
  import ColumnFilter from './ColumnFilter.svelte';
  import ResizableHeaderCell from './ResizableHeaderCell.svelte';
  import Checkbox from '../checkbox/Checkbox.svelte';
  import Tooltip from '../tooltip/Tooltip.svelte';

  interface HeaderCell {
    col: ColumnDef<T>;
    colSpan: number;
    rowSpan: number;
    leafIndex: number;
    isLeaf: boolean;
  }

  let {
    variant,
    tag = 'tr',
    onRowEl,
    // leaf 专用：前置 expand/selection 列
    expandAsColumn = false,
    hasSelection = false,
    hasHeaderMerge = false,
    headerDepth = 1,
    rowSelection,
    headerSelect,
    onToggleAll,
    leadingFixedClass = '',
    selectionFixedClass = '',
    selectionColStyle,
    leadingStyle,
    // 行级属性（仅 leaf/level 0 调用 onHeaderRow，调用方算好传入）
    headerRowProps,
    // 列数据：leaf 用 leafColumns + hasHeaderMerge 分支内部选 headerRows[0]/leafColumns 映射；
    // group 用该层 headerRows[level]
    leafColumns = [],
    mergedRow = [],
    // 通用列渲染依赖
    colKeyOf,
    alignOf,
    mergeHeaderStyle,
    mergeCellStyle,
    cellStyle,
    fixedCellClass,
    columnResizable,
    ariaSortFor,
    isEffectivelyFiltered,
    currentSort,
    onSort,
    openFilterKey,
    closingFilterKey,
    filterTriggers,
    resizeHandles,
    onFilterTriggerEl,
    onResizeHandleEl,
    resizingKey,
    setFilterOpen,
    startResize,
    selectionEnabled = false,
    resizeOverrides,
    columnTitle,
    filterDropdownPanel,
    locT,
  }: {
    variant: 'leaf' | 'group';
    tag?: string;
    /** 渲染出的 <tr> DOM 节点回调（对齐 bind:this 语义，用回调而非 $bindable——level 1+
     *  按数组下标动态赋值，数组初始为空时 headerRowElsRest[ri] 是 undefined，$bindable
     *  fallback 值场景下 Svelte 5 禁止 bind:x={undefined}，回调式规避此限制）。 */
    onRowEl?: (el: HTMLElement | null) => void;
    expandAsColumn?: boolean;
    hasSelection?: boolean;
    hasHeaderMerge?: boolean;
    headerDepth?: number;
    rowSelection?: RowSelection<T> | undefined;
    headerSelect?: { checked: boolean; indeterminate: boolean };
    onToggleAll?: () => void;
    leadingFixedClass?: string;
    selectionFixedClass?: string;
    selectionColStyle?: string | undefined;
    leadingStyle?: (slot: 'expand' | 'selection') => string | undefined;
    headerRowProps?:
      | {
          onClick?: (e: MouseEvent) => void;
          onMouseEnter?: (e: MouseEvent) => void;
          onMouseLeave?: (e: MouseEvent) => void;
          className?: string;
          style?: string;
        }
      | undefined;
    leafColumns?: ColumnDef<T>[];
    mergedRow?: { col: ColumnDef<T>; colSpan: number; rowSpan: number; leafIndex: number; isLeaf: boolean }[];
    colKeyOf: (col: ColumnDef<T>, index: number) => string;
    alignOf: (col: ColumnDef<T>) => string;
    mergeHeaderStyle: (base: string | undefined) => string | undefined;
    mergeCellStyle: (base: string | undefined, extra: string | undefined) => string | undefined;
    cellStyle: (col: ColumnDef<T>, i: number) => string | undefined;
    fixedCellClass: (i: number) => string;
    columnResizable: (col: ColumnDef<T>) => boolean;
    ariaSortFor: (col: ColumnDef<T>, index: number) => 'ascending' | 'descending' | 'none';
    isEffectivelyFiltered: (col: ColumnDef<T>, colKey: string) => boolean;
    currentSort: { key: string | null; order: 'ascend' | 'descend' | null };
    onSort: (col: ColumnDef<T>, index: number) => void;
    openFilterKey: string | null;
    closingFilterKey: string | null;
    /** 只读：判断触发器是否已收集到（如 261 行附近的筛选浮层渲染时机判断）。写入走 onFilterTriggerEl 回调，不直接 mutate。 */
    filterTriggers: Record<string, HTMLButtonElement | null>;
    /** 只读，语义同 filterTriggers。写入走 onResizeHandleEl 回调。 */
    resizeHandles: Record<string, HTMLElement | null>;
    /** 收集列筛选触发按钮 DOM 引用（对齐 onRowEl 的回调式 ref 收集，避免直接 mutate props）。 */
    onFilterTriggerEl?: (colKey: string, el: HTMLButtonElement | null) => void;
    /** 收集列宽拖拽手柄 DOM 引用，语义同 onFilterTriggerEl。 */
    onResizeHandleEl?: (colKey: string, el: HTMLElement | null) => void;
    resizingKey: string | null;
    setFilterOpen: (col: ColumnDef<T>, colKey: string, open: boolean) => void;
    startResize: (event: PointerEvent, col: ColumnDef<T>, index: number) => void;
    selectionEnabled?: boolean;
    resizeOverrides?: { get: (key: string) => { className?: string } | undefined };
    columnTitle: Snippet<[ColumnDef<T>]>;
    filterDropdownPanel: Snippet<[ColumnDef<T>, string]>;
    locT: (key: string) => string;
  } = $props();

  // level 0 需要渲染的格序列：合并模式用 headerRows[0]（mergedRow），否则 leafColumns 映射为叶子格。
  const level0Row = $derived<HeaderCell[]>(
    hasHeaderMerge ? mergedRow : leafColumns.map((col, i) => ({ col, colSpan: 1, rowSpan: 1, leafIndex: i, isLeaf: true as const })),
  );

  // <tr> DOM 节点原生 bind:this（无 $bindable fallback 限制）+ $effect 转发给调用方回调，
  // 对齐 Table.svelte 原 bind:this={headerRowEl0/headerRowElsRest[ri]} 语义。
  let rowElLocal = $state<HTMLElement | null>(null);
  $effect(() => {
    onRowEl?.(rowElLocal);
  });
</script>

{#snippet headerMergeCell(hc: HeaderCell)}
  {#if hc.isLeaf}
    {@render leafHeaderCell(hc.col, hc.leafIndex, hc.rowSpan)}
  {:else}
    <th
      class="cd-table-row-head cd-table-align-{alignOf(hc.col)}"
      class:cd-table-row-cell-ellipsis={!!hc.col.ellipsis}
      scope="colgroup"
      colspan={hc.colSpan}
      role="columnheader"
      style={mergeHeaderStyle(undefined)}
    >
      <span class="cd-table-row-head-title">{@render columnTitle(hc.col)}</span>
    </th>
  {/if}
{/snippet}

{#snippet leafHeaderCell(col: ColumnDef<T>, i: number, thRowSpan: number)}
  {@const gc = (expandAsColumn ? 1 : 0) + (hasSelection ? 1 : 0) + i}
  {@const sortable = !!col.sorter}
  {@const colKey = colKeyOf(col, i)}
  {@const hasFilter = (!!col.filters && col.filters.length > 0) || !!col.renderFilterDropdown}
  {@const colResizable = columnResizable(col)}
  {@const headerCellProps = col.onHeaderCell ? col.onHeaderCell(col, i) : undefined}
  {@const resizeOverride = resizeOverrides?.get(colKey)}
  {@const clickToSort = sortable && !hasFilter && !col.useFullRender}
  {@const order = sortable ? (col.sortOrder !== undefined ? col.sortOrder : (currentSort.key === colKeyOf(col, i) ? currentSort.order : null)) : null}
  {@const showTip = sortable && col.showSortTip === true && col.sortOrder === undefined}
  <!-- 对齐 Semi TableHeaderRow.tsx：clickToSort 为函数（即本库 clickToSort 为真，仅排序
       无筛选）且 showSortTip 时，Tooltip 包裹整条表头单元格内容，鼠标移到表头任意位置
       都出现提示；否则（有筛选等）仅移到排序图标本身才出现提示（ColumnSorter 内部处理，
       此处 showTip 传 false 避免重复包裹）。本库用 Tooltip 包裹 .cd-table-operate-wrapper
       （<th> 内部内容容器）而非 <th> 本身——Tooltip.svelte 会额外包一层 <span> 触发器，
       直接包 <th> 会产出非法 <tr> 子元素破坏表格 DOM 结构。 -->
  {@const thTipKey = order === 'ascend' ? 'Table.descend' : order === 'descend' ? 'Table.cancelSort' : 'Table.ascend'}
  {#if col.colSpan !== 0}
  <th
    rowspan={thRowSpan > 1 ? thRowSpan : undefined}
    colspan={col.colSpan !== undefined && col.colSpan > 1 ? col.colSpan : undefined}
    class="cd-table-row-head cd-table-align-{alignOf(col)} {fixedCellClass(i)} {headerCellProps?.className ?? ''} {resizeOverride?.className ?? ''}"
    class:cd-table-row-cell-ellipsis={!!col.ellipsis}
    class:cd-table-row-head-has-filter={hasFilter}
    class:cd-table-row-head-resizable={colResizable}
    class:cd-table-row-head-clicksort={clickToSort}
    class:resizing={resizingKey === colKey}
    scope="col"
    style={mergeCellStyle(mergeHeaderStyle(cellStyle(col, i)), headerCellProps?.style)}
    aria-sort={sortable ? ariaSortFor(col, i) : undefined}
    role="columnheader"
    aria-colindex={gc + 1}
    onclick={(e: MouseEvent) => {
      headerCellProps?.onClick?.(e);
      if (clickToSort) onSort(col, i);
    }}
    onmouseenter={headerCellProps?.onMouseEnter ?? undefined}
    onmouseleave={headerCellProps?.onMouseLeave ?? undefined}
  >
    <!-- 对齐 Semi：仅在有 sorter/filter 时套 .semi-table-operate-wrapper（flex），
         消除 inline descender 撑高；纯自定义 title（无 sorter）不套 flex，
         直接渲染保持其 inline 布局与 Semi 一致（Semi 自定义 title 不套 operate-wrapper）。 -->
    {#snippet operateContent()}
    <div class="cd-table-operate-wrapper" class:cd-table-operate-plain={typeof col.title !== 'string' && !sortable}>
    {#if sortable}
      {#snippet sortTitle()}{@render columnTitle(col)}{/snippet}
      <!-- clickToSort 为真时排序点击热区扩大到整个 <th>（见上方 onclick），ColumnSorter
           自身不再响应点击，避免与 th 的 onclick 冒泡重复触发（对齐 Semi Table.tsx 里
           ColumnSorter onClick={useFullRender || hasFilter ? handleSort : null} 的互斥
           关系：仅 useFullRender/hasFilter 时按钮自己承担点击职责）。 -->
      <ColumnSorter {col} {order} showTip={showTip && !clickToSort} title={sortTitle} onSort={clickToSort ? undefined : () => onSort(col, i)} />
    {:else if typeof col.title !== 'string'}
      <!-- 自定义 title（函数）：透传 selection/filter 物料，由使用方摆放（对齐 Semi
           title({ selection, filter, sorter })）。摆放 selection 全选框会撑高表头至 41px。 -->
      {#snippet headerSelectionMaterial()}
        {#if selectionEnabled}
          <Checkbox
            class="cd-table-selection-checkbox"
            aria-label={locT('Table.selectAll')}
            checked={headerSelect?.checked ?? false}
            disabled={rowSelection?.disabled === true}
            indeterminate={headerSelect?.indeterminate ?? false}
            onChange={() => onToggleAll?.()}
          />
        {/if}
      {/snippet}
      {#snippet headerFilterMaterial()}
        {#if hasFilter}
          <ColumnFilter
            {col}
            {colKey}
            filtered={isEffectivelyFiltered(col, colKey)}
            open={openFilterKey === colKey}
            ariaLabel={locT('Table.filter')}
            onToggle={(e) => { e.stopPropagation(); setFilterOpen(col, colKey, openFilterKey !== colKey); }}
            onTriggerEl={(el) => onFilterTriggerEl?.(colKey, el)}
          />
        {/if}
      {/snippet}
      {@render (col.title as Snippet<[{ filter?: Snippet; sorter?: Snippet; selection?: Snippet }]>)(hasFilter ? { selection: headerSelectionMaterial, filter: headerFilterMaterial } : { selection: headerSelectionMaterial })}
    {:else}
      <span class="cd-table-row-head-title">{@render columnTitle(col)}</span>
    {/if}

    {#if hasFilter && typeof col.title === 'string'}
      {#snippet panelForCol()}{@render filterDropdownPanel(col, colKey)}{/snippet}
      <ColumnFilter
        {col}
        {colKey}
        filtered={isEffectivelyFiltered(col, colKey)}
        open={openFilterKey === colKey}
        ariaLabel={locT('Table.filter')}
        onToggle={(e) => { e.stopPropagation(); setFilterOpen(col, colKey, openFilterKey !== colKey); }}
        onTriggerEl={(el) => onFilterTriggerEl?.(colKey, el)}
        showPanel={openFilterKey === colKey || closingFilterKey === colKey}
        panel={panelForCol}
      />
    {/if}
    </div>
    {/snippet}
    {#if showTip && clickToSort}
      <Tooltip content={locT(thTipKey)}>
        {@render operateContent()}
      </Tooltip>
    {:else}
      {@render operateContent()}
    {/if}
    <!-- 自定义 title 时 filter 按钮由 title snippet 摆放，浮层在此独立渲染（触发器仍绑 filterTriggers[colKey]） -->
    {#if hasFilter && typeof col.title !== 'string' && (openFilterKey === colKey || closingFilterKey === colKey) && filterTriggers[colKey]}
      {@render filterDropdownPanel(col, colKey)}
    {/if}

    <ResizableHeaderCell
      resizable={colResizable}
      resizing={resizingKey === colKey}
      ariaLabel={locT('Table.resizeColumn')}
      onHandleEl={(el) => onResizeHandleEl?.(colKey, el)}
      onPointerDown={(e) => startResize(e, col, i)}
    />
  </th>
  {/if}
{/snippet}

{#if variant === 'leaf'}
  <!-- svelte-ignore a11y_interactive_supports_focus -- 对齐 Semi：显式 role="row"（tag 可经 components 换标签，非交互 grid，无需 tabindex） -->
  <svelte:element
    this={tag}
    role="row"
    aria-rowindex={1}
    class="cd-table-row {headerRowProps?.className ?? ''}"
    style={headerRowProps?.style ?? undefined}
    onclick={headerRowProps?.onClick ?? undefined}
    onmouseenter={headerRowProps?.onMouseEnter ?? undefined}
    onmouseleave={headerRowProps?.onMouseLeave ?? undefined}
    bind:this={rowElLocal}
  >
    {#if expandAsColumn}
      {@const gc = 0}
      <th
        rowspan={hasHeaderMerge ? headerDepth : undefined}
        class="cd-table-row-head cd-table-column-expand {leadingFixedClass}"
        scope="col"
        style={mergeHeaderStyle(leadingStyle?.('expand'))}
        role="columnheader"
        aria-colindex={gc + 1}
      ></th>
    {/if}
    {#if hasSelection}
      {@const gc = expandAsColumn ? 1 : 0}
      {@const isRadio = rowSelection?.type === 'radio'}
      {@const showSelectAll = !isRadio && !rowSelection?.hideSelectAll}
      <th
        rowspan={hasHeaderMerge ? headerDepth : undefined}
        class="cd-table-row-head cd-table-column-selection {selectionFixedClass || leadingFixedClass}"
        scope="col"
        style={mergeHeaderStyle(selectionColStyle ?? leadingStyle?.('selection'))}
        role="columnheader"
        aria-colindex={gc + 1}
      >
        {#if showSelectAll}
          <ColumnSelection
            {rowSelection}
            inHeader={true}
            selected={headerSelect?.checked ?? false}
            indeterminate={headerSelect?.indeterminate ?? false}
            disabled={rowSelection?.disabled === true}
            onToggle={() => onToggleAll?.()}
          />
        {/if}
      </th>
    {/if}
    {#if !hasHeaderMerge}
      {#each leafColumns as col, i (colKeyOf(col, i))}
        {@render leafHeaderCell(col, i, 1)}
      {/each}
    {:else}
      <!-- 合并模式首行：expand/selection th 已 rowspan 跨满，其后接 headerRows[0] -->
      {#each level0Row as hc (hc.isLeaf ? colKeyOf(hc.col, hc.leafIndex) : `g-${typeof hc.col.title === 'string' ? hc.col.title : (hc.col.key ?? '')}-${hc.leafIndex}`)}
        {@render headerMergeCell(hc)}
      {/each}
    {/if}
  </svelte:element>
{:else}
  <tr class="cd-table-row" bind:this={rowElLocal}>
    {#each mergedRow as hc (hc.isLeaf ? colKeyOf(hc.col, hc.leafIndex) : `g-${typeof hc.col.title === 'string' ? hc.col.title : (hc.col.key ?? '')}-${hc.leafIndex}`)}
      {@render headerMergeCell(hc)}
    {/each}
  </tr>
{/if}

<style>
  /* 固定列表头 z 与数据行固定列一致（=fixed，对齐 Semi：表头/数据行固定列同为 101），
     覆盖 thead-sticky 通配 th 的 fixed+1（那条用于非固定 sticky 表头列盖住固定列滚动）。
     .cd-table-thead-sticky 是祖先 <thead>（Table.svelte 渲染）上的 class，本组件只渲染
     <tr>/<th>，故祖先部分须 :global()——Svelte scoped CSS 不跨组件生效，选择器右端
     的 th.cd-table-cell-fixed-left/-right 落在本组件才能被 scoped hash 命中。 */
  :global(.cd-table-thead-sticky) th.cd-table-cell-fixed-left,
  :global(.cd-table-thead-sticky) th.cd-table-cell-fixed-right {
    z-index: var(--cd-z-table-fixed-column);
  }

  /* 列宽拖拽手柄定位基准 + 拖拽中标示线（批次4：ResizableHeaderCell.svelte 拆分后，
     .react-resizable-handle 自身样式迁到该组件文件；这两条规则的挂载点（<th>）
     仍在本文件，故留在这里，Svelte scoped CSS 不跨组件生效） */
  .cd-table-row-head-resizable {
    position: relative;
  }
  .resizing.cd-table-row-head {
    border-right: var(--cd-width-table-resizer-border) solid var(--cd-color-table-resizer-bg-default);
  }

  /* RTL（对齐 Semi rtl.scss `.resizing { border-left: ... }`，thead 内 .resizing 通配规则）：
     resize 中标示线从右边移到左边。.cd-table-wrapper-rtl 挂在 Table.svelte 最外层 wrapper，
     跨组件须 :global()。 */
  :global(.cd-table-wrapper-rtl) .resizing.cd-table-row-head {
    border-right: 0;
    border-left: var(--cd-width-table-resizer-border) solid var(--cd-color-table-resizer-bg-default);
  }

  /* RTL bordered 模式：表头单元格边框左右互换（对齐 Semi rtl.scss
     `.semi-table-thead > .semi-table-row > .semi-table-row-head { border-right:0; border-left:... }`）。
     挂载点 <th> 在本文件渲染，故留在这里（Svelte scoped CSS 不跨组件生效）。

     选择器用 .cd-table-wrapper-rtl.cd-table-wrapper-bordered（两个 class 同挂在
     Table.svelte 最外层 wrapper 上，与 .cd-table-cell-fixed-* 那条同理）而非
     Semi 原文的 `.cd-table-thead > .cd-table-row >` 祖先链或本组件曾用过的
     `.cd-table-bordered`（table 元素上的 class）：table 元素在双 table 架构下由
     HeadTable.svelte/Body.svelte 渲染，`.cd-table-bordered` 前缀会被 Svelte 加上
     本文件（TableHeaderRow.svelte）的 scoped hash，与 table 元素实际携带的 hash
     不同，导致这段祖先链在真实 DOM 里永远不可能匹配（同一类"跨组件祖先链失效"，
     真机验证发现 computed border 与规则定义相反，命中的是未加 RTL 覆盖前的基础规则）。
     wrapper 上的两个 class 整体在 :global() 内，不受 hash 影响，可以安全跨组件引用；
     .cd-table-row-head 在本组件作用域内语义已唯一，无需再叠加 thead/row 祖先链消歧。
     同批曾用长组合链触发 svelte.compile() 编译卡死不返回（Svelte CSS 未使用性
     分析的已知性能坑），这里的两层选择器写法同时避开了该坑。 */
  :global(.cd-table-wrapper-rtl.cd-table-wrapper-bordered) .cd-table-row-head {
    border-right: 0;
    border-left: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }

  /* 表头文字方向 + align-left/right operate-wrapper 镜像（从 Table.svelte 移来，
     .cd-table-row-head/.cd-table-operate-wrapper 都在本文件渲染，同一类跨组件坑）。 */
  :global(.cd-table-wrapper-rtl) .cd-table-row-head {
    text-align: right;
  }
  :global(.cd-table-wrapper-rtl) .cd-table-align-left .cd-table-operate-wrapper {
    justify-content: flex-end;
  }
  :global(.cd-table-wrapper-rtl) .cd-table-align-right .cd-table-operate-wrapper {
    justify-content: flex-start;
  }
</style>
