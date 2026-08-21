<!--
  SectionRow — 分组标题行（对齐 Semi Body/SectionRow.tsx 的职责/文件名）。

  架构决策同 ExpandedRow：不实例化 BaseRow，直接排 <tr>+<td colspan>，
  渲染结果对齐 Semi 但内部走 Svelte 惯用法。

  展开指示器是非交互 <span>（无 aria-label/自身 onclick，点击代理到整个
  <td>），与 CustomExpandIcon.svelte（可独立 focus 的 <button>）语义不同，
  故不复用该组件（说明见 CustomExpandIcon.svelte 注释）。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import { IconChevronRight } from '@chenzy-design/icons';

  let {
    groupKey,
    group,
    expanded,
    colSpan,
    clickGroupedRowToExpand = false,
    groupedRowProps,
    renderGroupSection,
    onToggle,
  }: {
    groupKey: string;
    group: T[];
    expanded: boolean;
    colSpan: number;
    clickGroupedRowToExpand?: boolean;
    groupedRowProps?:
      | {
          onClick?: (e: MouseEvent) => void;
          onDoubleClick?: (e: MouseEvent) => void;
          onMouseEnter?: (e: MouseEvent) => void;
          onMouseLeave?: (e: MouseEvent) => void;
          className?: string;
          style?: string;
        }
      | undefined;
    renderGroupSection?: Snippet<[{ groupKey: string; group: T[] }]> | undefined;
    onToggle: () => void;
  } = $props();
</script>

<!-- svelte-ignore a11y_no_redundant_roles -- 对齐 Semi：显式 role="row"（Semi BaseRow 同样在原生 tr 上显式设置） -->
<tr
  class="cd-table-row cd-table-row-section {groupedRowProps?.className ?? ''}"
  class:cd-table-row-section-clickable={clickGroupedRowToExpand}
  role="row"
  style={groupedRowProps?.style ?? undefined}
  ondblclick={groupedRowProps?.onDoubleClick ?? undefined}
  onmouseenter={groupedRowProps?.onMouseEnter ?? undefined}
  onmouseleave={groupedRowProps?.onMouseLeave ?? undefined}
>
  <td
    class="cd-table-row-cell cd-table-row-cell-section"
    colspan={colSpan}
    role={clickGroupedRowToExpand ? 'button' : undefined}
    tabindex={clickGroupedRowToExpand ? 0 : undefined}
    aria-expanded={clickGroupedRowToExpand ? expanded : undefined}
    onclick={(e) => {
      if (clickGroupedRowToExpand) onToggle();
      groupedRowProps?.onClick?.(e);
    }}
    onkeydown={clickGroupedRowToExpand
      ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }
      : undefined}
  >
    {#if clickGroupedRowToExpand}
      <span class="cd-table-expand-icon" class:cd-table-expandedIcon-show={expanded} aria-hidden="true">
        <IconChevronRight size="small" aria-hidden="true" />
      </span>
    {/if}
    {#if renderGroupSection}
      {@render renderGroupSection({ groupKey, group })}
    {:else}
      {groupKey}
    {/if}
  </td>
</tr>
