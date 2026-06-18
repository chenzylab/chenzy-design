<!--
  Content — main region within Layout. Grows to fill, token-driven background.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** true→token padding; number→px; string→raw; false→0 */
    padding?: string | number | boolean;
    class?: string;
    children?: Snippet;
  }

  let { padding = false, class: className = '', children }: Props = $props();

  const paddingCss = $derived.by(() => {
    if (padding === true) return 'var(--cd-layout-content-padding)';
    if (padding === false) return '0';
    return typeof padding === 'number' ? `${padding}px` : padding;
  });

  const cls = $derived(['cd-layout-content', className].filter(Boolean).join(' '));

  const inlineStyle = $derived(`padding:${paddingCss}`);
</script>

<main class={cls} style={inlineStyle}>
  {@render children?.()}
</main>

<style>
  .cd-layout-content {
    flex: 1;
    min-height: 0;
    background: var(--cd-layout-content-bg);
  }
</style>
