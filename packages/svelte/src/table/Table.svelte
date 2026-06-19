<!--
  Table — see specs/components/show/Table.spec.md
  列定义驱动渲染：三态排序、客户端分页、行选择(含半选)，受控/非受控双轨。
  受控 sortState / rowSelection.selectedRowKeys / pagination.current 不回写，
  仅通过 onSortChange / rowSelection.onChange / pagination.onChange 通知 (红线 #1)。
  复用 @chenzy-design/core 纯函数算法与 Pagination 组件，不重复实现。
  TODO(延后): 固定列 / 虚拟化 / 筛选 / 树形 / 行展开。
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
  import type { ColumnDef, RowSelection, Align, TableSize } from './types.js';

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
  const colSpan = $derived(columns.length + (hasSelection ? 1 : 0));

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
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class="cd-table-wrap">
  <table class={cls} aria-label={ariaLabel}>
    <thead class="cd-table__head">
      <tr>
        {#if hasSelection}
          <th class="cd-table__cell cd-table__cell--selection" scope="col">
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
            class="cd-table__cell cd-table__cell--head cd-table__cell--{alignOf(col)}"
            class:cd-table__cell--ellipsis={col.ellipsis}
            scope="col"
            style={widthStyle(col)}
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
            {#if hasSelection}
              <td class="cd-table__cell cd-table__cell--selection">
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
                class="cd-table__cell cd-table__cell--{alignOf(col)}"
                class:cd-table__cell--ellipsis={col.ellipsis}
                style={widthStyle(col)}
              >
                {#if col.render}
                  {@render col.render({ value, record, index })}
                {:else}
                  {cellText(value)}
                {/if}
              </td>
            {/each}
          </tr>
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
  }

  .cd-table {
    inline-size: 100%;
    border-collapse: collapse;
    background: var(--cd-table-bg);
    color: var(--cd-table-cell-text);
    border-radius: var(--cd-table-radius);
    font-size: var(--cd-font-size-body);
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
    inline-size: 1px;
    white-space: nowrap;
  }
  .cd-table__cell--ellipsis {
    max-inline-size: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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
