<!--
  HeadTable — 双 table 架构下独立的表头 <table>（对齐 Semi HeadTable.tsx）。

  仅在 useFixedHeader=true（存在 fixed 列或 scroll.y 设置）时挂载，与 Body.svelte
  的 tbody table 分离。外层 div 横向 overflow-x:hidden——用户不能直接横滚表头，
  滚动位置由 Body 侧横滚事件命令式同步过来（Table.svelte 持有 headWrapEl 引用，
  在 body onscroll 回调里写 headWrapEl.scrollLeft，对齐 Semi handleBodyScrollLeft）。

  纯展示壳：colgroup/thead 内容由调用方（Table.svelte）以 Snippet 传入——那部分
  仍是 Table.svelte 内定义的一大批闭包 snippet（leafHeaderCell/headerMergeCell/
  filterDropdownPanel...），本阶段不迁移，只迁移外层 table/div 结构（红线 #2/#3
  相关状态与副作用全部保留在 Table.svelte，未变更）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    tag = 'table',
    cls,
    style,
    ariaLabel,
    role,
    ariaRowCount,
    ariaColCount,
    colgroup,
    thead,
    wrapEl = $bindable(null),
  }: {
    tag?: string;
    cls: string;
    style?: string | undefined;
    ariaLabel?: string | undefined;
    role: 'grid' | 'treegrid';
    ariaRowCount: number;
    ariaColCount: number;
    colgroup: Snippet;
    thead: Snippet;
    /** 横滚同步落点：Body 侧横向滚动时 Table.svelte 命令式写此 div 的 scrollLeft。 */
    wrapEl?: HTMLDivElement | null;
  } = $props();
</script>

<div class="cd-table-head" bind:this={wrapEl}>
  <svelte:element this={tag} class={cls} {style} aria-label={ariaLabel} {role} aria-rowcount={ariaRowCount} aria-colcount={ariaColCount}>
    {@render colgroup()}
    {@render thead()}
  </svelte:element>
</div>

<style>
  /* 双 table 场景表头容器：.semi-table-head（对齐 Semi HeadTable.tsx）。
     横向 overflow:hidden——用户不能直接横滚表头，scrollLeft 由 Body 侧命令式同步写入。
     Svelte scoped CSS 不跨组件生效，此规则必须定义在本组件（渲染 .cd-table-head 的
     组件）而非 Table.svelte，否则父组件的同名规则不会应用到子组件渲染的元素上。 */
  .cd-table-head {
    position: relative;
    inline-size: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
</style>
