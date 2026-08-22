<!--
  ExpandedRow — 展开内容行（对齐 Semi Body/ExpandedRow.tsx 的职责/文件名）。

  架构决策：Semi 内部用"假列"技巧复用 BaseRow（构造单元素 columns 数组，
  render() 返回整段内容）——这是 React column.render 抽象层的复用手法，
  Svelte 模板语法没有等价的间接层，故本组件直接排 <tr>+<td colspan>，
  不实例化 BaseRow。渲染结果（class/属性/层级）与 Semi 对齐，内部实现走
  Svelte 惯用法。

  displayNone：keepDOM 模式下始终挂载但用它控制 display:none（对齐 Semi
  TableExpandedRow.displayNone）；非 keepDOM 时调用方只在展开时才渲染本
  组件，无需传 displayNone。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { Snippet } from 'svelte';

  let {
    colSpan,
    displayNone = false,
    content,
  }: {
    colSpan: number;
    displayNone?: boolean;
    content: Snippet;
  } = $props();
</script>

<!-- svelte-ignore a11y_no_redundant_roles -- 对齐 Semi：显式 role="row"（Semi BaseRow 同样在原生 tr 上显式设置） -->
<tr class="cd-table-row cd-table-row-expand" role="row" style={displayNone ? 'display:none' : undefined}>
  <td class="cd-table-row-cell cd-table-row-cell-expanded-content" colspan={colSpan} role="gridcell" aria-colindex={1}>
    {@render content()}
  </td>
</tr>
