<!--
  BaseRow — 普通数据行（对齐 Semi Body/BaseRow.tsx 的职责/文件名）。

  职责边界：本组件只承担 <tr> 容器 + 行级状态（selected/stripe/clickable/
  子行/自定义 onRow 属性与事件），不含单元格 <td> 循环渲染——那部分本质是
  Semi TableCell.tsx 的职责（含 fixed 列偏移/ellipsis/展开缩进物料/
  useFullRender 分支等复杂度，且当前分组行径与非分组行径的单元格渲染存在
  真实差异：分组路径缺 aria-colindex 与 onCell colSpan/rowSpan 处理，是
  现有实现的既有分支差异，本次结构抽离不改变这一行为），故单元格由调用方
  以 cells Snippet 传入，留给后续 TableCell.svelte 抽离批次处理。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { Snippet } from 'svelte';

  let {
    tag = 'tr',
    record,
    index,
    selected,
    stripe = false,
    clickable = false,
    isChild = false,
    extraClassName = '',
    rowProps,
    ariaRowIndex,
    onRowClick,
    cells,
  }: {
    tag?: string;
    record: T;
    index: number;
    selected: boolean;
    stripe?: boolean;
    clickable?: boolean;
    isChild?: boolean;
    extraClassName?: string;
    rowProps?:
      | {
          onClick?: (e: MouseEvent) => void;
          onDoubleClick?: (e: MouseEvent) => void;
          onMouseEnter?: (e: MouseEvent) => void;
          onMouseLeave?: (e: MouseEvent) => void;
          className?: string;
          style?: string;
          draggable?: boolean;
          onDragStart?: (e: DragEvent) => void;
          onDragOver?: (e: DragEvent) => void;
          onDragEnter?: (e: DragEvent) => void;
          onDragLeave?: (e: DragEvent) => void;
          onDrop?: (e: DragEvent) => void;
          onDragEnd?: (e: DragEvent) => void;
        }
      | undefined;
    ariaRowIndex?: number | undefined;
    onRowClick: (e: MouseEvent) => void;
    cells: Snippet;
  } = $props();
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -- 对齐 Semi：显式 role="row"（tag 可经 components 换标签，非交互 grid，无需 tabindex） -->
<svelte:element
  this={tag}
  class="cd-table-row {extraClassName} {rowProps?.className ?? ''}"
  class:cd-table-row-selected={selected}
  class:cd-table-row-stripe={stripe && index % 2 === 1}
  class:cd-table-row-clickable={clickable}
  class:cd-table-row-child={isChild}
  role="row"
  aria-rowindex={ariaRowIndex}
  style={rowProps?.style ?? undefined}
  onclick={onRowClick}
  ondblclick={rowProps?.onDoubleClick ?? undefined}
  onmouseenter={rowProps?.onMouseEnter ?? undefined}
  onmouseleave={rowProps?.onMouseLeave ?? undefined}
  draggable={rowProps?.draggable}
  ondragstart={rowProps?.onDragStart ?? undefined}
  ondragover={rowProps?.onDragOver ?? ((e: DragEvent) => rowProps?.onDrop && e.preventDefault())}
  ondragenter={rowProps?.onDragEnter ?? undefined}
  ondragleave={rowProps?.onDragLeave ?? undefined}
  ondrop={rowProps?.onDrop ?? undefined}
  ondragend={rowProps?.onDragEnd ?? undefined}
>
  {@render cells()}
</svelte:element>
