<!--
  TablePagination — 分页区域（对齐 Semi table/TablePagination.tsx 文件结构）。

  纯展示：左侧 range 文案（pageRangeText，缺省 null 不渲染）+ 右侧 Pagination
  组件；renderPagination 传入时整体替换（对齐 Semi customPagination 分支）。
  表格 size（行高密度）不影响分页器，固定 default 尺寸（不透传表格 size，对齐 Semi）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Pagination } from '../pagination/index.js';

  let {
    total,
    currentPage,
    pageSize,
    onChange,
    pageRangeText = null,
    renderPagination,
  }: {
    total: number;
    currentPage: number;
    pageSize: number;
    onChange: (page: number) => void;
    pageRangeText?: string | null;
    renderPagination?: Snippet<[{ total: number; currentPage: number; pageSize: number; onChange: (page: number) => void }]> | undefined;
  } = $props();
</script>

{#if renderPagination}
  {@render renderPagination({ total, currentPage, pageSize, onChange })}
{:else}
  <div class="cd-table-pagination-outer">
    {#if pageRangeText !== null}
      <span class="cd-table-pagination-total">{pageRangeText}</span>
    {/if}
    <Pagination {total} {currentPage} {pageSize} size="default" {onChange} />
  </div>
{/if}
