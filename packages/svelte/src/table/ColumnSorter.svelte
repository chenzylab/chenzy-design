<!--
  ColumnSorter — 排序按钮（对齐 Semi ColumnSorter.tsx）：双箭头图标 + 当前排序方向高亮，
  支持 sortIcon 自定义覆盖、showTip 提示下一次点击的排序方向。

  本库用原生 <button type="button">（自带键盘可达性）而非 Semi 的
  <div role="button" tabIndex={-1} onKeyPress>（ARIA 模拟按钮），
  是合理的技术适配，交互结果一致，不视为对齐缺口。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import { IconCaretup, IconCaretdown } from '@chenzy-design/icons';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import type { ColumnDef } from './types.js';

  let {
    col,
    order,
    showTip,
    title,
    onSort,
  }: {
    col: ColumnDef<T>;
    order: 'ascend' | 'descend' | null;
    showTip: boolean;
    title: Snippet;
    onSort: () => void;
  } = $props();

  const loc = useLocale();
</script>

{#snippet sorterIcons()}
  {#if col.sortIcon}
    {@render col.sortIcon({ sortOrder: order })}
  {:else}
    <span class="cd-table-column-sorter" aria-hidden="true">
      <span class="cd-table-column-sorter-up" class:on={order === 'ascend'}>
        <IconCaretup size="small" />
      </span>
      <span class="cd-table-column-sorter-down" class:on={order === 'descend'}>
        <IconCaretdown size="small" />
      </span>
    </span>
  {/if}
{/snippet}

<button type="button" class="cd-table-column-sorter-wrapper" onclick={onSort}>
  <span class="cd-table-row-head-title">{@render title()}</span>
  {#if showTip}
    {@const tipKey = order === 'ascend' ? 'Table.descend' : order === 'descend' ? 'Table.cancelSort' : 'Table.ascend'}
    <Tooltip content={loc().t(tipKey)}>
      {@render sorterIcons()}
    </Tooltip>
  {:else}
    {@render sorterIcons()}
  {/if}
</button>
