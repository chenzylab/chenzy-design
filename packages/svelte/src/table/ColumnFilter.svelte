<!--
  ColumnFilter — 列筛选触发按钮 + 浮层挂载点（对齐 Semi table/ColumnFilter.tsx 文件结构）。

  职责边界：本组件只承担「触发按钮」的渲染（IconFilter/自定义 filterIcon + on/
  aria-expanded 态）与「浮层是否应该渲染」的判定（open||closing）；浮层内容本身
  （confirm/immediate 两种模式、renderFilterDropdown/renderFilterDropdownItem 自定义
  覆盖、tempFilterState 临时值等）复杂度高、深度依赖 Table.svelte 的一长串状态与
  回调（confirmFilter/clearFilter/resetFilter/toggleFilterValue 等），故仍以 panel
  Snippet 形式由 Table.svelte 传入渲染，不在此重写（对齐"文件结构标准"的同时不做
  无意义的状态搬迁）。

  触发按钮 DOM 引用（filterTriggers[colKey]，供浮层 use:floating 定位锚点）用回调
  而非 bind:/$bindable——colKey 首次渲染时对应表达式求值为 undefined（Record 初始
  空对象），Svelte 5 $bindable fallback 值场景禁止 bind:x={undefined}（同
  TableHeaderRow.svelte onRowEl / ResizableHeaderCell.svelte onHandleEl 的处理方式）。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import type { ColumnDef } from './types.js';
  import { IconFilter } from '@chenzy-design/icons';

  let {
    col,
    filtered,
    open,
    ariaLabel,
    onToggle,
    onTriggerEl,
    /** 浮层是否应挂载（open||closing 由调用方算好传入，触发按钮自身不判定，
     *  因为普通 title 场景浮层紧跟按钮渲染、自定义 title 场景浮层独立摆放在
     *  别处——两种布局都由调用方决定，本组件只负责按钮，可选渲染 panel）。 */
    showPanel = false,
    panel,
  }: {
    col: ColumnDef<T>;
    colKey: string;
    filtered: boolean;
    open: boolean;
    ariaLabel: string;
    onToggle: (e: MouseEvent) => void;
    onTriggerEl?: (el: HTMLButtonElement | null) => void;
    showPanel?: boolean;
    panel?: Snippet;
  } = $props();

  let triggerElLocal = $state<HTMLButtonElement | null>(null);
  $effect(() => {
    onTriggerEl?.(triggerElLocal);
  });
</script>

<button
  type="button"
  class="cd-table-column-filter"
  class:on={filtered}
  aria-label={ariaLabel}
  aria-expanded={open}
  bind:this={triggerElLocal}
  onclick={onToggle}
>
  {#if col.filterIcon}
    {@render col.filterIcon({ filtered })}
  {:else}
    <IconFilter size="small" aria-hidden="true" />
  {/if}
</button>
{#if showPanel && triggerElLocal && panel}
  {@render panel()}
{/if}
