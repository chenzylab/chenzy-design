<!--
  ScrollList — see specs/components/show/ScrollList.spec.md
  滚轮选择器：JS 主导定位吸附居中，中央选区遮罩 + 上下渐隐。
  单列（data）向后兼容；多列（columns）联动，值为各列组合数组。
  进阶：cyclic 循环、惯性物理（pointer 拖拽 + 减速）、虚拟化、loadMore、status。
  复用 @chenzy-design/core 纯函数（offset/index/cyclic/momentum/virtual）。
  受控 value 不回写仅 onChange（红线 #1）；监听/动画命令式 + cleanup（红线 #3）；
  列联动/循环/虚拟窗口派生纯函数（红线 #2）。单列逐列封装在 ScrollColumn 子组件。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    useId,
    indexOfValue,
    firstEnabledIndex,
    type ScrollListValue,
    type ScrollListItem,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import ScrollColumn from './ScrollColumn.svelte';
  import type { ScrollListColumn, ScrollListStatus } from './types.js';

  type Size = 'small' | 'default' | 'large';
  type Status = ScrollListStatus;

  type ChangeInfo = {
    /** 单列：选中值；多列：各列值数组。 */
    value: ScrollListValue | ScrollListValue[];
    /** 单列时提供 item/index；多列省略。 */
    item?: ScrollListItem;
    index?: number;
    /** 多列：发生变化的列序号。 */
    column?: number;
  };

  interface Props {
    value?: ScrollListValue | ScrollListValue[];
    defaultValue?: ScrollListValue | ScrollListValue[];
    /** 单列数据（向后兼容）。与 columns 互斥；columns 优先。 */
    data?: ScrollListItem[];
    /** 多列配置。提供时进入多列模式。 */
    columns?: ScrollListColumn[];
    size?: Size;
    rows?: number;
    itemHeight?: number;
    disabled?: boolean;
    /** 全局循环（单列或所有列）；列级 cyclic 覆盖之。 */
    cyclic?: boolean;
    /** 虚拟化（列项很多时）。 */
    virtualized?: boolean;
    overscan?: number;
    /** 单列加载/空状态。 */
    status?: Status;
    emptyText?: string;
    loadingText?: string;
    ariaLabel?: string;
    /** 单列滚到末尾加载更多。 */
    onLoadMore?: () => void;
    renderItem?: Snippet<[{ item: ScrollListItem; selected: boolean; index: number }]>;
    onChange?: (info: ChangeInfo) => void;
  }

  let {
    value,
    defaultValue,
    data = [],
    columns,
    size = 'default',
    rows = 5,
    itemHeight,
    disabled = false,
    cyclic = false,
    virtualized = false,
    overscan = 3,
    status = 'idle',
    emptyText,
    loadingText,
    ariaLabel,
    onLoadMore,
    renderItem,
    onChange,
  }: Props = $props();

  const loc = useLocale();
  // 稳定 id 前缀（每列追加列号），SSR/水合一致。
  const baseId = useId('cd-scroll-list');

  const ih = $derived(itemHeight ?? { small: 28, default: 36, large: 44 }[size]);
  const isMulti = $derived(Array.isArray(columns) && columns.length > 0);

  // 归一化为「列数组」：单列模式包成一项。
  const colDefs = $derived.by<ScrollListColumn[]>(() => {
    if (isMulti) return columns!;
    const single: ScrollListColumn = { data, cyclic, status };
    if (ariaLabel !== undefined) single.ariaLabel = ariaLabel;
    if (onLoadMore !== undefined) single.onLoadMore = onLoadMore;
    return [single];
  });
  const isControlled = $derived(value !== undefined);

  // 把外部 value/defaultValue 归一化为「逐列 value」数组。
  function valueForColumn(col: number, seed: ScrollListValue | ScrollListValue[] | undefined):
    | ScrollListValue
    | undefined {
    if (seed === undefined) return undefined;
    if (Array.isArray(seed)) return seed[col];
    return col === 0 ? seed : undefined;
  }

  // 每列当前逻辑 index（受控时派生自 value，非受控用 defaultValue 解析初值后由列内部维护）。
  function resolveColIndex(col: number, seed: ScrollListValue | ScrollListValue[] | undefined): number {
    const items = colDefs[col]?.data ?? [];
    const v = valueForColumn(col, seed);
    const i = indexOfValue(items, v);
    if (i >= 0 && !items[i]?.disabled) return i;
    const f = firstEnabledIndex(items);
    return f === -1 ? 0 : f;
  }

  // 受控时每列 index 派生自 value；非受控传初值（defaultValue 或 value）。
  const controlledIndices = $derived.by(() =>
    colDefs.map((_, col) => resolveColIndex(col, value)),
  );
  const initialIndices = untrack(() =>
    colDefs.map((_, col) => resolveColIndex(col, value !== undefined ? value : defaultValue)),
  );

  // 非受控：记录各列当前逻辑 index（用于组装多列 onChange 的 values）。
  let innerIndices = $state<number[]>(untrack(() => [...initialIndices]));

  // 列变更 → 组装 onChange（红线 #1：受控不回写，仅回调）。
  function handleColSelect(col: number, logicalIndex: number): void {
    if (!isControlled) {
      const next = [...innerIndices];
      next[col] = logicalIndex;
      innerIndices = next;
    }
    const item = colDefs[col]?.data[logicalIndex];
    if (!item) return;

    if (isMulti) {
      // 组装各列当前值数组（变更列用最新，其它列用受控值或内部值）。
      const values = colDefs.map((c, ci) => {
        const idx =
          ci === col
            ? logicalIndex
            : (isControlled ? controlledIndices[ci] : innerIndices[ci]) ?? 0;
        return c.data[idx]?.value as ScrollListValue;
      });
      onChange?.({ value: values, column: col });
    } else {
      onChange?.({ value: item.value, item, index: logicalIndex });
    }
  }

  const viewportHeight = $derived(ih * rows);
  const resolvedEmpty = $derived(emptyText ?? loc().t('ScrollList.empty'));
  const resolvedLoading = $derived(loadingText ?? loc().t('ScrollList.loading'));

  const cls = $derived(
    [
      'cd-scroll-list',
      `cd-scroll-list--${size}`,
      isMulti && 'cd-scroll-list--multi',
      disabled && 'cd-scroll-list--disabled',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  class={cls}
  style="--cd-sl-item-height: {ih}px; --cd-sl-viewport-height: {viewportHeight}px;"
>
  <div class="cd-scroll-list__cols">
    {#each colDefs as col, ci (ci)}
      <ScrollColumn
        data={col.data}
        index={(isControlled ? controlledIndices[ci] : innerIndices[ci]) ?? 0}
        controlled={isControlled}
        itemHeight={ih}
        {rows}
        {disabled}
        cyclic={col.cyclic ?? cyclic}
        {virtualized}
        {overscan}
        status={col.status ?? status}
        emptyText={resolvedEmpty}
        loadingText={resolvedLoading}
        ariaLabel={col.ariaLabel ?? ariaLabel ?? loc().t('ScrollList.ariaLabel')}
        itemIdPrefix={`${baseId}-c${ci}`}
        {renderItem}
        onSelect={(i) => handleColSelect(ci, i)}
        onLoadMore={col.onLoadMore}
      />
    {/each}
  </div>

  <div class="cd-scroll-list__mask" aria-hidden="true"></div>
  <div class="cd-scroll-list__gradient cd-scroll-list__gradient--top" aria-hidden="true"></div>
  <div class="cd-scroll-list__gradient cd-scroll-list__gradient--bottom" aria-hidden="true"></div>
</div>

<style>
  .cd-scroll-list {
    position: relative;
    inline-size: 100%;
    block-size: var(--cd-sl-viewport-height);
    overflow: hidden;
    border: 1px solid var(--cd-scrolllist-border-color);
    border-radius: var(--cd-scrolllist-radius);
    color: var(--cd-scrolllist-color-text-adjacent);
    font-size: var(--cd-font-size-body);
  }

  .cd-scroll-list__cols {
    display: flex;
    block-size: 100%;
  }

  .cd-scroll-list--disabled .cd-scroll-list__cols {
    pointer-events: none;
  }

  /* 中央选区遮罩：居中一行，上下 1px 边框 */
  .cd-scroll-list__mask {
    position: absolute;
    inset-inline: 0;
    inset-block-start: calc(50% - var(--cd-sl-item-height) / 2);
    block-size: var(--cd-sl-item-height);
    background: var(--cd-scrolllist-mask-bg);
    border-block: 1px solid var(--cd-scrolllist-mask-border);
    pointer-events: none;
  }

  /* 上/下渐隐 */
  .cd-scroll-list__gradient {
    position: absolute;
    inset-inline: 0;
    block-size: calc((var(--cd-sl-viewport-height) - var(--cd-sl-item-height)) / 2);
    pointer-events: none;
  }
  .cd-scroll-list__gradient--top {
    inset-block-start: 0;
    background: linear-gradient(
      to bottom,
      var(--cd-scrolllist-gradient-color),
      transparent
    );
  }
  .cd-scroll-list__gradient--bottom {
    inset-block-end: 0;
    background: linear-gradient(to top, var(--cd-scrolllist-gradient-color), transparent);
  }
</style>
