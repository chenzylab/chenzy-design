<!--
  Body — 双 table 架构下承载 tbody 的独立 <table>（对齐 Semi Body/index.tsx）。

  includeHeader=true（useFixedHeader=false，单 table 场景）时内联渲染 thead，
  与现状（单一 table 含 thead+tbody）行为等价；includeHeader=false（双 table
  场景）时只渲染 colgroup+tbody，thead 由同级 HeadTable 独立承载。

  外层 .cd-table-body 滚动容器职责不变（纵向虚拟滚动/横向溢出），双 table 场景下
  额外承担「横向滚动位置的权威来源」——onscroll 里 Table.svelte 命令式把 scrollLeft
  写回 HeadTable 的 wrapEl（对齐 Semi handleBodyScrollLeft），本组件不关心该同步逻辑，
  只把 scroll 容器 bind:this 暴露给调用方（既有 scrollEl 语义不变）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    includeHeader = false,
    tag = 'table',
    cls,
    style,
    ariaLabel,
    role,
    ariaRowCount,
    ariaColCount,
    colgroup,
    thead,
    tbody,
  }: {
    /** true：内联渲染 thead（单 table 场景，includeHeader 对齐 Semi Body includeHeader prop）。 */
    includeHeader?: boolean;
    tag?: string;
    cls: string;
    style?: string | undefined;
    ariaLabel?: string | undefined;
    role: 'grid' | 'treegrid';
    ariaRowCount: number;
    ariaColCount: number;
    colgroup: Snippet;
    /** includeHeader=true 时渲染；双 table 场景不传亦可（不会被渲染）。 */
    thead?: Snippet;
    tbody: Snippet;
  } = $props();
</script>

<svelte:element this={tag} class={cls} {style} aria-label={ariaLabel} {role} aria-rowcount={ariaRowCount} aria-colcount={ariaColCount}>
  {@render colgroup()}
  {#if includeHeader && thead}
    {@render thead()}
  {/if}
  {@render tbody()}
</svelte:element>
