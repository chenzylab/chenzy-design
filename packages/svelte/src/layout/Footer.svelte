<!--
  Footer — bottom bar within Layout. Token-driven background/color.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    sticky?: boolean;
    /** override height; number→px, string→raw */
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
    ['cd-layout-footer', sticky && 'cd-layout-footer--sticky', className].filter(Boolean).join(' '),
  );

  const inlineStyle = $derived(heightCss ? `height:${heightCss}` : undefined);
</script>

<footer class={cls} style={inlineStyle}>
  {@render children?.()}
</footer>

<style>
  .cd-layout-footer {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    padding-block: var(--cd-spacing-4);
    padding-inline: var(--cd-spacing-6);
    background: var(--cd-layout-footer-bg);
    color: var(--cd-layout-footer-color);
    text-align: center;
  }
  .cd-layout-footer--sticky {
    position: sticky;
    inset-block-end: 0;
  }
</style>
