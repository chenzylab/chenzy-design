<!--
  ColGroup — <colgroup> 渲染（对齐 Semi ColGroup.tsx）。纯展示，无状态：
  前置 expand/selection 占位列 + 数据列，每列一个 <col>。
  leadingWidth 复用调用方的 LEADING_W 常量（expand 与 selection 两个前置列同宽）。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { ColumnDef } from './types.js';

  let {
    leafColumns,
    expandAsColumn,
    hasSelection,
    selectionColWidth,
    leadingWidth,
    colKey,
    colStyle,
  }: {
    leafColumns: ColumnDef<T>[];
    expandAsColumn: boolean;
    hasSelection: boolean;
    selectionColWidth: number;
    leadingWidth: number;
    colKey: (col: ColumnDef<T>, index: number) => string;
    colStyle: (col: ColumnDef<T>, index: number) => string | undefined;
  } = $props();
</script>

<colgroup class="cd-table-colgroup">
  {#if expandAsColumn}
    <col class="cd-table-column-expand" style="width:{leadingWidth}px" />
  {/if}
  {#if hasSelection}
    <col class="cd-table-column-selection" style="width:{selectionColWidth}px" />
  {/if}
  {#each leafColumns as col, i (colKey(col, i))}
    <col class={col.className} style={colStyle(col, i)} />
  {/each}
</colgroup>
