<!--
  Table — see specs/components/show/Table.spec.md
  列定义驱动渲染：三态排序、客户端分页、行选择(含半选)，受控/非受控双轨。
  受控 sortState / rowSelection.selectedRowKeys / pagination.current 不回写，
  仅通过 onSortChange / rowSelection.onChange / pagination.onChange 通知 (红线 #1)。
  复用 @chenzy-design/core 纯函数算法与 Pagination 组件，不重复实现。
  固定列：column.fixed='left'|'right'，横滚时 sticky 锁定 + 逐列像素偏移 + 边界阴影。
  TODO(延后): 虚拟化 / 列筛选 / 树形数据 / 列宽调整。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import {
    toggleSort,
    applySort,
    paginate,
    selectAllState,
    toggleSelectAll,
    toggleRow,
    type RowKey,
    type SortState,
  } from '@chenzy-design/core';
  import { Pagination } from '../pagination/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import type { ColumnDef, RowSelection, Expandable, Align, TableSize } from './types.js';

  // 泛型组件 props 用内联类型而非具名 interface Props：在 declaration:true 下，
  // 引用泛型参数 T 的具名 interface 会被当作私有名泄漏进生成的 .d.ts 公共签名而报错。
  let {
    columns = [],
    dataSource = [],
    rowKey = 'key',
    size = 'default',
    bordered = false,
    stripe = false,
    loading = false,
    sortState,
    defaultSortState = { key: null, order: null },
    onSortChange,
    pagination,
    rowSelection,
    expandable,
    rowClassName,
    empty,
    ariaLabel,
    onRowClick,
  }: {
    columns?: ColumnDef<T>[];
    dataSource?: T[];
    rowKey?: string | ((record: T) => RowKey);
    size?: TableSize;
    bordered?: boolean;
    stripe?: boolean;
    loading?: boolean;
    sortState?: SortState;
    defaultSortState?: SortState;
    onSortChange?: (state: SortState) => void;
    pagination?:
      | false
      | {
          pageSize?: number;
          current?: number;
          defaultCurrent?: number;
          onChange?: (page: number) => void;
        };
    rowSelection?: RowSelection<T>;
    expandable?: Expandable<T>;
    rowClassName?: (record: T, index: number) => string;
    empty?: string;
    ariaLabel?: string;
    onRowClick?: (info: { record: T; index: number }) => void;
  } = $props();

  const loc = useLocale();

  // --- 键解析 ---
  const getKey = (record: T): RowKey =>
    typeof rowKey === 'function' ? rowKey(record) : (record[rowKey] as RowKey);

  const colKeyOf = (col: ColumnDef<T>, index: number): string =>
    col.key ?? col.dataIndex ?? String(index);

  // --- 排序：受控 sortState 不回写 (红线 #1) ---
  const isSortControlled = $derived(sortState !== undefined);
  let innerSort = $state<SortState>(initSort());
  const currentSort = $derived<SortState>(
    isSortControlled ? (sortState as SortState) : innerSort,
  );
  function initSort(): SortState {
    return { ...defaultSortState };
  }

  // --- 数据管道：排序（客户端）。状态全来自 props / 本地 $state，派生安全 (红线 #2) ---
  const processed = $derived.by(() => {
    let data = [...dataSource];
    const { key, order } = currentSort;
    if (key && order) {
      let target: ColumnDef<T> | undefined;
      columns.forEach((col, i) => {
        if (colKeyOf(col, i) === key) target = col;
      });
      if (target && target.sorter) {
        const dataIndex = target.dataIndex;
        const compare =
          typeof target.sorter === 'function'
            ? target.sorter
            : (a: T, b: T): number => {
                if (!dataIndex) return 0;
                const av = a[dataIndex];
                const bv = b[dataIndex];
                if (av == null && bv == null) return 0;
                if (av == null) return -1;
                if (bv == null) return 1;
                if (typeof av === 'number' && typeof bv === 'number') return av - bv;
                return String(av).localeCompare(String(bv));
              };
        data = applySort(data, order, compare);
      }
    }
    return data;
  });

  // --- 分页：受控 current 不回写 (红线 #1) ---
  const paginationEnabled = $derived(pagination !== false);
  const pageSize = $derived(pagination ? (pagination.pageSize ?? 10) : 10);
  const isPageControlled = $derived(!!pagination && pagination.current !== undefined);
  let innerPage = $state(initPage());
  function initPage(): number {
    return pagination ? (pagination.defaultCurrent ?? 1) : 1;
  }
  const currentPage = $derived(
    pagination && pagination.current !== undefined ? pagination.current : innerPage,
  );

  const total = $derived(processed.length);
  const visibleRows = $derived(
    paginationEnabled ? paginate(processed, currentPage, pageSize) : processed,
  );

  // --- 行选择：受控 selectedRowKeys 不回写 (红线 #1) ---
  const isSelectionControlled = $derived(
    rowSelection?.selectedRowKeys !== undefined,
  );
  let innerSelected = $state<RowKey[]>(initSelected());
  function initSelected(): RowKey[] {
    return [...(rowSelection?.defaultSelectedRowKeys ?? [])];
  }
  const currentSelectedKeys = $derived<RowKey[]>(
    isSelectionControlled
      ? (rowSelection?.selectedRowKeys ?? [])
      : innerSelected,
  );
  const selectedSet = $derived(new Set(currentSelectedKeys));

  // 全选范围 = 当前渲染行集；半选状态据当前可见行计算
  const visibleKeys = $derived(visibleRows.map((r) => getKey(r)));
  const disabledSet = $derived.by(() => {
    const set = new Set<RowKey>();
    const getProps = rowSelection?.getCheckboxProps;
    if (getProps) {
      for (const r of visibleRows) {
        if (getProps(r).disabled) set.add(getKey(r));
      }
    }
    return set;
  });
  const headerSelect = $derived(
    selectAllState(visibleKeys, selectedSet, disabledSet),
  );

  const hasSelection = $derived(rowSelection !== undefined);
  const hasExpand = $derived(expandable !== undefined);
  const colSpan = $derived(
    columns.length + (hasSelection ? 1 : 0) + (hasExpand ? 1 : 0),
  );

  // --- 展开行：受控 expandedRowKeys 不回写 (红线 #1) ---
  const isExpandControlled = $derived(expandable?.expandedRowKeys !== undefined);
  let innerExpanded = $state<RowKey[]>(initExpanded());
  function initExpanded(): RowKey[] {
    return [...(expandable?.defaultExpandedRowKeys ?? [])];
  }
  const expandedSet = $derived<Set<RowKey>>(
    new Set(
      isExpandControlled
        ? (expandable?.expandedRowKeys ?? [])
        : innerExpanded,
    ),
  );

  function canExpand(record: T): boolean {
    return expandable?.rowExpandable ? expandable.rowExpandable(record) : true;
  }

  function toggleExpand(record: T) {
    const key = getKey(record);
    if (!canExpand(record)) return;
    const next = new Set(expandedSet);
    const willExpand = !next.has(key);
    if (willExpand) next.add(key);
    else next.delete(key);
    if (!isExpandControlled) innerExpanded = [...next];
    expandable?.onExpand?.(willExpand, record);
  }

  // --- 选择变更：回调取对应行对象（在可见行集中查找）---
  function rowsForKeys(keys: RowKey[]): T[] {
    const map = new Map<RowKey, T>();
    for (const r of visibleRows) map.set(getKey(r), r);
    const result: T[] = [];
    for (const k of keys) {
      const r = map.get(k);
      if (r !== undefined) result.push(r);
    }
    return result;
  }

  function emitSelection(next: Set<RowKey>) {
    const keys = [...next];
    if (!isSelectionControlled) innerSelected = keys;
    rowSelection?.onChange?.(keys, rowsForKeys(keys));
  }

  function onToggleAll() {
    emitSelection(toggleSelectAll(visibleKeys, selectedSet, disabledSet));
  }

  function onToggleRow(record: T) {
    if (disabledSet.has(getKey(record))) return;
    emitSelection(toggleRow(selectedSet, getKey(record)));
  }

  // --- 排序点击 ---
  function onSort(col: ColumnDef<T>, index: number) {
    const key = colKeyOf(col, index);
    const next = toggleSort(currentSort, key);
    if (!isSortControlled) innerSort = next;
    onSortChange?.(next);
  }

  function ariaSortFor(col: ColumnDef<T>, index: number): 'ascending' | 'descending' | 'none' {
    if (currentSort.key !== colKeyOf(col, index) || !currentSort.order) return 'none';
    return currentSort.order === 'ascend' ? 'ascending' : 'descending';
  }

  // --- 分页变更 ---
  function onPageChange(page: number) {
    if (!isPageControlled) innerPage = page;
    if (pagination) pagination.onChange?.(page);
  }

  // --- 单元格取值 ---
  function cellValue(col: ColumnDef<T>, record: T): unknown {
    return col.dataIndex ? record[col.dataIndex] : undefined;
  }
  function cellText(value: unknown): string {
    return value == null ? '' : String(value);
  }

  function alignOf(col: ColumnDef<T>): Align {
    return col.align ?? 'left';
  }
  function widthStyle(col: ColumnDef<T>): string | undefined {
    if (col.width === undefined) return undefined;
    return typeof col.width === 'number' ? `width:${col.width}px` : `width:${col.width}`;
  }

  // --- 固定列：纯 CSS sticky + 逐列像素偏移计算 ---
  // selection / expand 前置列宽（与 CSS .cd-table__cell--selection/--expand 对齐）
  const LEADING_W = 48;
  // 前置 leading 列（expand + selection）的总宽，作为 left 固定列偏移基数
  const leadingWidth = $derived((hasExpand ? LEADING_W : 0) + (hasSelection ? LEADING_W : 0));
  const hasFixed = $derived(columns.some((c) => c.fixed));
  // 固定列时 table 的最小总宽（列宽和 + 前置列），撑过容器以触发横滚
  const totalMinWidth = $derived(
    leadingWidth + columns.reduce((sum, c) => sum + (typeof c.width === 'number' ? c.width : 120), 0),
  );
  const tableStyle = $derived(hasFixed ? `min-inline-size:${totalMinWidth}px` : undefined);

  function colNumWidth(col: ColumnDef<T>): number {
    return typeof col.width === 'number' ? col.width : 0;
  }

  // 每个数据列的 left 偏移（左固定列）：前置宽 + 之前所有左固定列宽之和
  const fixedLeftOffsets = $derived.by(() => {
    const out: (number | null)[] = [];
    let acc = leadingWidth;
    for (const col of columns) {
      if (col.fixed === 'left') {
        out.push(acc);
        acc += colNumWidth(col);
      } else {
        out.push(null);
      }
    }
    return out;
  });
  // 每个数据列的 right 偏移（右固定列）：之后所有右固定列宽之和
  const fixedRightOffsets = $derived.by(() => {
    const out: (number | null)[] = new Array(columns.length).fill(null);
    let acc = 0;
    for (let i = columns.length - 1; i >= 0; i--) {
      const col = columns[i] as ColumnDef<T>;
      if (col.fixed === 'right') {
        out[i] = acc;
        acc += colNumWidth(col);
      }
    }
    return out;
  });
  // 最后一个左固定列 / 第一个右固定列索引（用于阴影边界）
  const lastLeftFixed = $derived.by(() => {
    let idx = -1;
    columns.forEach((c, i) => {
      if (c.fixed === 'left') idx = i;
    });
    return idx;
  });
  const firstRightFixed = $derived(columns.findIndex((c) => c.fixed === 'right'));

  // 组合某数据列的 sticky 行内样式（含宽度）
  function cellStyle(col: ColumnDef<T>, i: number): string | undefined {
    const parts: string[] = [];
    const w = widthStyle(col);
    if (w) parts.push(w);
    const left = fixedLeftOffsets[i];
    const right = fixedRightOffsets[i];
    if (left != null) parts.push(`position:sticky`, `inset-inline-start:${left}px`);
    else if (right != null) parts.push(`position:sticky`, `inset-inline-end:${right}px`);
    return parts.length ? parts.join(';') : undefined;
  }

  function fixedCellClass(i: number): string {
    if (fixedLeftOffsets[i] != null) {
      return `cd-table__cell--fixed cd-table__cell--fixed-left${i === lastLeftFixed ? ' cd-table__cell--fixed-left-last' : ''}`;
    }
    if (fixedRightOffsets[i] != null) {
      return `cd-table__cell--fixed cd-table__cell--fixed-right${i === firstRightFixed ? ' cd-table__cell--fixed-right-first' : ''}`;
    }
    return '';
  }

  // 前置 leading 列在存在左固定列时也需 sticky 锁定在最左
  function leadingStyle(slot: 'expand' | 'selection'): string | undefined {
    if (!hasFixed || lastLeftFixed < 0) return undefined;
    const offset = slot === 'expand' ? 0 : hasExpand ? LEADING_W : 0;
    return `position:sticky;inset-inline-start:${offset}px`;
  }
  const leadingFixedClass = $derived(hasFixed && lastLeftFixed >= 0 ? 'cd-table__cell--fixed cd-table__cell--fixed-left' : '');

  // --- 半选 indeterminate：用 attachment 命令式写具体 input 元素属性。
  //     仅读派生布尔值并写 DOM，不读几何，写属性不触发响应式，无循环风险 (不违反红线 #3)。
  function indeterminate(value: boolean) {
    return (node: HTMLInputElement) => {
      node.indeterminate = value;
    };
  }

  const cls = $derived(
    [
      'cd-table',
      `cd-table--${size}`,
      bordered && 'cd-table--bordered',
      stripe && 'cd-table--stripe',
      hasFixed && 'cd-table--fixed',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class="cd-table-wrap">
  <table class={cls} style={tableStyle} aria-label={ariaLabel}>
    <thead class="cd-table__head">
      <tr>
        {#if hasExpand}
          <th class="cd-table__cell cd-table__cell--expand {leadingFixedClass}" scope="col" style={leadingStyle('expand')}></th>
        {/if}
        {#if hasSelection}
          <th class="cd-table__cell cd-table__cell--selection {leadingFixedClass}" scope="col" style={leadingStyle('selection')}>
            <input
              type="checkbox"
              class="cd-table__checkbox"
              aria-label={loc().t('Table.selectAll')}
              checked={headerSelect.checked}
              {@attach indeterminate(headerSelect.indeterminate)}
              onchange={onToggleAll}
            />
          </th>
        {/if}
        {#each columns as col, i (colKeyOf(col, i))}
          {@const sortable = !!col.sorter}
          <th
            class="cd-table__cell cd-table__cell--head cd-table__cell--{alignOf(col)} {fixedCellClass(i)}"
            class:cd-table__cell--ellipsis={col.ellipsis}
            scope="col"
            style={cellStyle(col, i)}
            aria-sort={sortable ? ariaSortFor(col, i) : undefined}
          >
            {#if sortable}
              {@const order = currentSort.key === colKeyOf(col, i) ? currentSort.order : null}
              <button
                type="button"
                class="cd-table__sort-btn"
                onclick={() => onSort(col, i)}
              >
                <span class="cd-table__title">{col.title}</span>
                <span class="cd-table__sort-icons" aria-hidden="true">
                  <svg
                    class="cd-table__sort-up"
                    class:cd-table__sort--active={order === 'ascend'}
                    viewBox="0 0 8 5"
                    width="8"
                    height="5"
                    focusable="false"
                  >
                    <path fill="currentColor" d="M4 0l4 5H0z" />
                  </svg>
                  <svg
                    class="cd-table__sort-down"
                    class:cd-table__sort--active={order === 'descend'}
                    viewBox="0 0 8 5"
                    width="8"
                    height="5"
                    focusable="false"
                  >
                    <path fill="currentColor" d="M4 5L0 0h8z" />
                  </svg>
                </span>
              </button>
            {:else}
              <span class="cd-table__title">{col.title}</span>
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="cd-table__body">
      {#if visibleRows.length === 0}
        <tr class="cd-table__row cd-table__row--empty">
          <td class="cd-table__cell cd-table__cell--empty" colspan={colSpan}>
            {empty ?? loc().t('Table.emptyText')}
          </td>
        </tr>
      {:else}
        {#each visibleRows as record, index (getKey(record))}
          {@const key = getKey(record)}
          {@const selected = selectedSet.has(key)}
          {@const rowDisabled = disabledSet.has(key)}
          {@const extra = rowClassName ? rowClassName(record, index) : ''}
          {@const clickable = !!onRowClick}
          <tr
            class="cd-table__row {extra}"
            class:cd-table__row--selected={selected}
            class:cd-table__row--stripe={stripe && index % 2 === 1}
            class:cd-table__row--clickable={clickable}
            onclick={clickable ? () => onRowClick?.({ record, index }) : undefined}
          >
            {#if hasExpand}
              <td class="cd-table__cell cd-table__cell--expand {leadingFixedClass}" style={leadingStyle('expand')}>
                {#if canExpand(record)}
                  <button
                    type="button"
                    class="cd-table__expand-btn"
                    class:cd-table__expand-btn--open={expandedSet.has(key)}
                    aria-expanded={expandedSet.has(key)}
                    aria-label={expandedSet.has(key) ? loc().t('Table.collapseRow') : loc().t('Table.expandRow')}
                    onclick={(e) => {
                      e.stopPropagation();
                      toggleExpand(record);
                    }}
                  >
                    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 4l4 4-4 4" />
                    </svg>
                  </button>
                {/if}
              </td>
            {/if}
            {#if hasSelection}
              <td class="cd-table__cell cd-table__cell--selection {leadingFixedClass}" style={leadingStyle('selection')}>
                <input
                  type="checkbox"
                  class="cd-table__checkbox"
                  aria-label={loc().t('Table.selectRow')}
                  checked={selected}
                  disabled={rowDisabled}
                  onclick={(e) => e.stopPropagation()}
                  onchange={() => onToggleRow(record)}
                />
              </td>
            {/if}
            {#each columns as col, i (colKeyOf(col, i))}
              {@const value = cellValue(col, record)}
              <td
                class="cd-table__cell cd-table__cell--{alignOf(col)} {fixedCellClass(i)}"
                class:cd-table__cell--ellipsis={col.ellipsis}
                style={cellStyle(col, i)}
              >
                {#if col.render}
                  {@render col.render({ value, record, index })}
                {:else}
                  {cellText(value)}
                {/if}
              </td>
            {/each}
          </tr>
          {#if hasExpand && expandedSet.has(key) && canExpand(record)}
            <tr class="cd-table__row cd-table__row--expanded">
              <td class="cd-table__cell cd-table__cell--expanded-content" colspan={colSpan}>
                {@render expandable!.expandedRowRender({ record, index })}
              </td>
            </tr>
          {/if}
        {/each}
      {/if}
    </tbody>
  </table>

  {#if paginationEnabled && total > 0}
    <div class="cd-table__pagination">
      <Pagination
        {total}
        currentPage={currentPage}
        {pageSize}
        size={size === 'large' ? 'default' : size}
        onChange={onPageChange}
      />
    </div>
  {/if}

  {#if loading}
    <div class="cd-table__loading" aria-hidden="true">
      <span class="cd-table__spinner"></span>
    </div>
  {/if}
</div>

<style>
  .cd-table-wrap {
    position: relative;
    inline-size: 100%;
    overflow-x: auto;
  }

  .cd-table {
    inline-size: 100%;
    border-collapse: collapse;
    background: var(--cd-table-bg);
    color: var(--cd-table-cell-text);
    border-radius: var(--cd-table-radius);
    font-size: var(--cd-font-size-body);
  }
  /* 固定列：用 fixed 布局让列宽精确生效，min-width 撑过容器以触发横滚 */
  .cd-table--fixed {
    inline-size: auto;
    min-inline-size: 100%;
    table-layout: fixed;
  }

  .cd-table__cell {
    padding-block: var(--cd-table-cell-padding-y);
    padding-inline: var(--cd-table-cell-padding-x);
    text-align: left;
    vertical-align: middle;
    border-block-end: 1px solid var(--cd-table-border-color);
  }
  .cd-table--small .cd-table__cell {
    padding-block: var(--cd-table-cell-padding-y-small);
  }
  .cd-table--large .cd-table__cell {
    padding-block: var(--cd-table-cell-padding-y-large);
  }

  .cd-table__cell--head {
    color: var(--cd-table-header-text);
    background: var(--cd-table-header-bg);
    font-weight: 600;
  }
  .cd-table__head th {
    background: var(--cd-table-header-bg);
    color: var(--cd-table-header-text);
    font-weight: 600;
  }

  .cd-table__cell--center {
    text-align: center;
  }
  .cd-table__cell--right {
    text-align: right;
  }
  .cd-table__cell--selection {
    inline-size: 48px;
    text-align: center;
    white-space: nowrap;
  }
  .cd-table__cell--expand {
    inline-size: 48px;
    white-space: nowrap;
    text-align: center;
  }
  .cd-table__expand-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    cursor: pointer;
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-table__expand-btn:hover {
    color: var(--cd-color-text-0);
  }
  .cd-table__expand-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-table__expand-btn--open {
    transform: rotate(90deg);
  }
  .cd-table__cell--expanded-content {
    padding: var(--cd-table-cell-padding, var(--cd-spacing-3));
    background: var(--cd-color-fill-0);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-table__expand-btn {
      transition: none;
    }
  }
  .cd-table__cell--ellipsis {
    max-inline-size: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* --- 固定列：sticky 单元格需不透明背景，避免透出横滚内容 --- */
  .cd-table__cell--fixed {
    z-index: 2;
    background: var(--cd-table-bg);
  }
  .cd-table__head .cd-table__cell--fixed {
    z-index: 3;
    background: var(--cd-table-header-bg);
  }
  /* 固定列随行态变色：hover / stripe / selected 时同步背景 */
  .cd-table__row:hover .cd-table__cell--fixed {
    background: var(--cd-table-row-hover-bg);
  }
  .cd-table__row--stripe .cd-table__cell--fixed {
    background: var(--cd-table-row-stripe-bg);
  }
  .cd-table__row--selected .cd-table__cell--fixed,
  .cd-table__row--selected:hover .cd-table__cell--fixed {
    background: var(--cd-table-row-selected-bg);
  }
  /* 边界阴影：最后一个左固定列右侧、第一个右固定列左侧 */
  .cd-table__cell--fixed-left-last::after,
  .cd-table__cell--fixed-right-first::after {
    content: '';
    position: absolute;
    inset-block: 0;
    inline-size: 6px;
    pointer-events: none;
  }
  .cd-table__cell--fixed-left-last {
    position: sticky;
  }
  .cd-table__cell--fixed-left-last::after {
    inset-inline-end: -6px;
    background: linear-gradient(
      to right,
      var(--cd-table-fixed-shadow, rgba(0, 0, 0, 0.12)),
      transparent
    );
  }
  .cd-table__cell--fixed-right-first::after {
    inset-inline-start: -6px;
    background: linear-gradient(
      to left,
      var(--cd-table-fixed-shadow, rgba(0, 0, 0, 0.12)),
      transparent
    );
  }
  /* sticky cell 需相对定位以承载 ::after 阴影 */
  .cd-table__cell--fixed {
    position: sticky;
  }

  .cd-table--bordered .cd-table__cell {
    border-inline-end: 1px solid var(--cd-table-border-color);
  }
  .cd-table--bordered .cd-table__cell:first-child {
    border-inline-start: 1px solid var(--cd-table-border-color);
  }
  .cd-table--bordered .cd-table__head th {
    border-block-start: 1px solid var(--cd-table-border-color);
  }

  .cd-table__row--stripe {
    background: var(--cd-table-row-stripe-bg);
  }
  .cd-table__row:hover {
    background: var(--cd-table-row-hover-bg);
  }
  .cd-table__row--selected,
  .cd-table__row--selected:hover {
    background: var(--cd-table-row-selected-bg);
  }
  .cd-table__row--clickable {
    cursor: pointer;
  }

  .cd-table__cell--empty {
    padding-block: var(--cd-spacing-6, 32px);
    color: var(--cd-table-empty-color);
    text-align: center;
  }

  .cd-table__sort-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    padding: 0;
    color: inherit;
    font: inherit;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
  }
  .cd-table__sort-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-small, 4px);
  }

  .cd-table__sort-icons {
    display: inline-flex;
    flex-direction: column;
    gap: 1px;
    color: var(--cd-table-sort-icon-color);
  }
  .cd-table__sort--active {
    color: var(--cd-table-sort-active-color);
  }

  .cd-table__checkbox {
    cursor: pointer;
    accent-color: var(--cd-color-primary);
  }
  .cd-table__checkbox:disabled {
    cursor: not-allowed;
  }
  .cd-table__checkbox:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  .cd-table__pagination {
    display: flex;
    justify-content: flex-end;
    margin-block-start: var(--cd-spacing-3);
  }

  .cd-table__loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-table-loading-mask);
    opacity: 0.6;
  }

  .cd-table__spinner {
    inline-size: 28px;
    block-size: 28px;
    border: 3px solid var(--cd-color-fill-1, rgba(0, 0, 0, 0.1));
    border-top-color: var(--cd-color-primary);
    border-radius: 50%;
    animation: cd-table-spin 0.8s linear infinite;
  }

  @keyframes cd-table-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-table__spinner {
      animation: none;
    }
    .cd-table__sort-up,
    .cd-table__sort-down {
      transition: none;
    }
  }
</style>
