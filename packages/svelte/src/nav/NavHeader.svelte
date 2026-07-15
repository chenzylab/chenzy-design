<!--
  Nav.Header — 导航头部：logo 槽 + 文案（对齐 Semi header={{logo,text}}）。
  折叠态隐藏文案仅留 logo。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** Logo 节点。 */
    logo?: Snippet;
    /** Logo 文案（字符串或 Snippet）。 */
    text?: string | Snippet;
    /** 链接地址（对齐 Semi）：传入时头部整体包裹一个 `<a>`。 */
    link?: string;
    /** 透传给 `<a>` 的属性（对齐 Semi linkOptions，如 target/rel）。 */
    linkOptions?: Record<string, string>;
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
    link,
    linkOptions,
    collapsedState = false,
    class: className = '',
    style,
    children,
  }: Props = $props();
</script>

{#snippet inner()}
  {#if children}
    {@render children()}
  {:else}
    {#if logo}
      <span class="cd-nav__header-logo">{@render logo()}</span>
    {/if}
    {#if text && !collapsedState}
      <span class="cd-nav__header-text"
        >{#if typeof text === 'string'}{text}{:else}{@render text()}{/if}</span
      >
    {/if}
  {/if}
{/snippet}

<div class={['cd-nav__header', className].filter(Boolean).join(' ')} {style}>
  {#if link}
    <a class="cd-nav__header-link" href={link} {...linkOptions}>{@render inner()}</a>
  {:else}
    {@render inner()}
  {/if}
</div>

<style>
  .cd-nav__header {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-navigation-header-logo-marginright);
    height: var(--cd-height-navigation-horizontal-header);
    padding-inline: var(--cd-spacing-navigation-horizontal-paddingleft);
    flex: 0 0 auto;
    overflow: hidden;
  }
  .cd-nav__header-link {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-navigation-header-logo-marginright);
    color: inherit;
    text-decoration: none;
  }
  .cd-nav__header-logo {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }
  .cd-nav__header-text {
    font-size: var(--cd-font-size-navigation-header-text);
    font-weight: var(--cd-font-navigation-header-item-fontweight);
    white-space: nowrap;
    color: var(--cd-color-navigation-header-text-default);
  }
</style>
