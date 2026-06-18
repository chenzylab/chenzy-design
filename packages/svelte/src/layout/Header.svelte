<!--
  Header — top bar within Layout. Token-driven background/height.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    sticky?: boolean;
    /** override token height; number→px, string→raw */
    height?: string | number;
    class?: string;
    children?: Snippet;
  }

  let { sticky = false, height, class: className = '', children }: Props = $props();

  const heightCss = $derived.by(() => {
    if (height === undefined) return undefined;
    return typeof height === 'number' ? `${height}px` : height;
  });

  const cls = $derived(
    ['cd-layout-header', sticky && 'cd-layout-header--sticky', className].filter(Boolean).join(' '),
  );

  const inlineStyle = $derived(heightCss ? `height:${heightCss}` : undefined);
</script>

<header class={cls} style={inlineStyle}>
  {@render children?.()}
</header>

<style>
  .cd-layout-header {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    height: var(--cd-layout-header-height);
    background: var(--cd-layout-header-bg);
  }
  .cd-layout-header--sticky {
    position: sticky;
    inset-block-start: 0;
    z-index: var(--cd-layout-header-z);
  }
</style>
