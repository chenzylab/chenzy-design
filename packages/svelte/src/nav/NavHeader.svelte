<!--
  Nav.Header — 导航头部：logo 槽 + 文案（对齐 Semi header={{logo,text}}）。
  折叠态隐藏文案仅留 logo。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** Logo 节点。 */
    logo?: Snippet;
    /** Logo 文案。 */
    text?: string;
    /** 折叠态（由 Nav 透传；折叠时隐藏文案）。 */
    collapsedState?: boolean;
    /** 自定义类名。 */
    class?: string;
    /** 自定义内联样式。 */
    style?: string;
    children?: Snippet;
  }

  let {
    logo,
    text,
    collapsedState = false,
    class: className = '',
    style,
    children,
  }: Props = $props();
</script>

<div class={['cd-nav__header', className].filter(Boolean).join(' ')} {style}>
  {#if children}
    {@render children()}
  {:else}
    {#if logo}
      <span class="cd-nav__logo">{@render logo()}</span>
    {/if}
    {#if text && !collapsedState}
      <span class="cd-nav__header-text">{text}</span>
    {/if}
  {/if}
</div>

<style>
  .cd-nav__header {
    display: flex;
    align-items: center;
    gap: var(--cd-nav-header-gap);
    height: var(--cd-nav-header-height);
    padding-inline: var(--cd-nav-header-padding-x);
    flex: 0 0 auto;
    overflow: hidden;
  }
  .cd-nav__logo {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }
  .cd-nav__header-text {
    font-size: var(--cd-nav-header-text-size);
    font-weight: var(--cd-font-weight-semibold);
    white-space: nowrap;
    color: var(--cd-nav-header-text-color);
  }
</style>
