<!--
  ColumnSelection — 选择框 wrapper（对齐 Semi ColumnSelection.tsx）：
  <span class="cd-table-selection-wrap"> 包 Checkbox/Radio，支持 rowSelection.renderCell
  自定义覆盖。inHeader 区分全选框（表头，Checkbox-only，无 rowDisabled/rowHalf 概念，
  Semi renderCell 回调本身按 inHeader 分支，故本组件合一而非拆两个）。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import Checkbox from '../checkbox/Checkbox.svelte';
  import Radio from '../radio/Radio.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import type { RowSelection } from './types.js';

  let {
    rowSelection,
    inHeader,
    selected,
    indeterminate = false,
    disabled = false,
    record,
    onToggle,
  }: {
    rowSelection: RowSelection<T> | undefined;
    inHeader: boolean;
    selected: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    record?: T | undefined;
    onToggle: () => void;
  } = $props();

  const loc = useLocale();
</script>

{#snippet origin()}
  {#if inHeader}
    <Checkbox
      class="cd-table-selection-checkbox"
      aria-label={loc().t('Table.selectAll')}
      checked={selected}
      {disabled}
      {indeterminate}
      onChange={onToggle}
    />
  {:else if rowSelection?.type === 'radio'}
    <Radio
      class="cd-table-selection-checkbox"
      aria-label={loc().t('Table.selectRow')}
      checked={selected}
      {disabled}
      onChange={onToggle}
    />
  {:else}
    <Checkbox
      class="cd-table-selection-checkbox"
      aria-label={loc().t('Table.selectRow')}
      checked={selected}
      {disabled}
      {indeterminate}
      onChange={onToggle}
    />
  {/if}
{/snippet}

{#if inHeader}
  <span class="cd-table-selection-wrap" class:cd-table-selection-disabled={disabled}>
    {#if rowSelection?.renderCell}
      {@render rowSelection.renderCell({
        selected,
        originNode: origin,
        inHeader: true,
        disabled,
        indeterminate,
        selectAll: onToggle,
      })}
    {:else}
      {@render origin()}
    {/if}
  </span>
{:else}
  <span
    class="cd-table-selection-wrap"
    class:cd-table-selection-disabled={disabled}
    role="presentation"
    onclick={(e) => e.stopPropagation()}
  >
    {#if rowSelection?.renderCell}
      {@render rowSelection.renderCell({
        selected,
        ...(record !== undefined ? { record } : {}),
        originNode: origin,
        inHeader: false,
        disabled,
        indeterminate,
        selectRow: onToggle,
      })}
    {:else}
      {@render origin()}
    {/if}
  </span>
{/if}
