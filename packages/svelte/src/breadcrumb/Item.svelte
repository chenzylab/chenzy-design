<!--
  BreadcrumbItem — declarative item for the `children` mode of Breadcrumb.
  Renders itself only. TODO: separator insertion between declarative items
  (parent-injected `last` via context) — this round prefers the `routes` data mode.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    href?: string;
    class?: string;
    children?: Snippet;
    onClick?: (e: MouseEvent) => void;
  }

  let { href, class: className = '', children, onClick }: Props = $props();

  const cls = $derived(['cd-breadcrumb__item', className].filter(Boolean).join(' '));
</script>

<li class={cls}>
  {#if href}
    <a class="cd-breadcrumb__link" {href} onclick={onClick}>{@render children?.()}</a>
  {:else}
    <span class="cd-breadcrumb__text">{@render children?.()}</span>
  {/if}
</li>
