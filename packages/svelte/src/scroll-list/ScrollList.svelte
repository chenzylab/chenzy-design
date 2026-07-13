<!--
  ScrollList — 严格对齐 Semi Design（semi-ui/scrollList/index.tsx）。
  纯容器组件：header / footer / bodyHeight / class / style + children（放若干 <ScrollItem>）。
  DOM 镜像 semi-scrolllist：外层 flex column → -header(> -title + -line) / -body(flex, height=bodyHeight) / -footer。
  不含选择逻辑（选择由子组件 ScrollItem 各自负责，对齐 Semi 手动组合多列的用法）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** 头部 addon（对齐 Semi header）。 */
    header?: Snippet | string;
    /** 底部 addon（对齐 Semi footer）。 */
    footer?: Snippet | string;
    /** body 高度（对齐 Semi bodyHeight）；数字按 px，字符串原样。 */
    bodyHeight?: number | string;
    /** 根节点类名（对齐 Semi className）。 */
    class?: string;
    /** 根节点内联样式（对齐 Semi style）。 */
    style?: string;
    /** 列内容：若干 <ScrollItem>（对齐 Semi children）。 */
    children?: Snippet;
  }

  let {
    header,
    footer,
    bodyHeight,
    class: className,
    style,
    children,
  }: Props = $props();

  const rootCls = $derived(['cd-scrolllist', className].filter(Boolean).join(' '));
  const bodyStyle = $derived(
    bodyHeight === undefined || bodyHeight === ''
      ? undefined
      : `height: ${typeof bodyHeight === 'number' ? `${bodyHeight}px` : bodyHeight}`,
  );
</script>

<div class={rootCls} {style}>
  {#if header}
    <div class="cd-scrolllist-header">
      <div class="cd-scrolllist-header-title">
        {#if typeof header === 'string'}{header}{:else}{@render header()}{/if}
      </div>
      <div class="cd-scrolllist-line"></div>
    </div>
  {/if}

  <div class="cd-scrolllist-body" style={bodyStyle}>
    {@render children?.()}
  </div>

  {#if footer}
    <div class="cd-scrolllist-footer">
      {#if typeof footer === 'string'}{footer}{:else}{@render footer()}{/if}
    </div>
  {/if}
</div>

<style>
  /* 对齐 Semi scrollList.scss `.#{$module}` */
  .cd-scrolllist {
    inline-size: 100%;
    block-size: 100%;
    background: var(--cd-color-scroll-list-bg);
    box-shadow: var(--cd-shadow-scroll-list);
    border-radius: var(--cd-radius-scroll-list);
    overflow: hidden;
    font-size: var(--cd-font-size-regular);
    user-select: none;
    display: flex;
    flex-direction: column;
  }

  /* -header */
  .cd-scrolllist-header {
    text-align: center;
    padding: var(--cd-spacing-scroll-list-header-paddingy) var(--cd-spacing-scroll-list-header-paddingx);
    background: var(--cd-color-scroll-list-header-bg);
  }
  .cd-scrolllist-header-title {
    padding: var(--cd-spacing-scroll-list-header-title-paddingy) var(--cd-spacing-scroll-list-header-title-paddingx);
    font-weight: var(--cd-font-scroll-list-header-title-fontweight);
    color: var(--cd-color-scroll-list-header-title);
    font-size: var(--cd-font-size-regular);
  }
  .cd-scrolllist-line {
    background: var(--cd-color-scroll-list-border);
    block-size: var(--cd-height-scroll-list-line);
  }

  /* -body */
  .cd-scrolllist-body {
    display: flex;
    block-size: var(--cd-height-scroll-list);
    padding: var(--cd-spacing-scroll-list-body-paddingy) var(--cd-spacing-scroll-list-body-paddingx);
    overflow: hidden;
  }

  /* -footer */
  .cd-scrolllist-footer {
    border-block-start: var(--cd-width-scroll-list-footer-border) solid var(--cd-color-scroll-list-footer-border);
    padding: var(--cd-spacing-scroll-list-footer-padding);
  }
</style>
