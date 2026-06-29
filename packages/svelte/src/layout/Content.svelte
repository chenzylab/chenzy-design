<!--
  Content — main region within Layout. Grows to fill, token-driven background.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** true→token padding; number→px; string→raw; false→0 */
    padding?: string | number | boolean;
    class?: string;
    /** 根元素自定义内联样式（透传，叠加在 padding 之后）。 */
    style?: string;
    /** 可访问性标签（透传到根元素 aria-label）。 */
    ariaLabel?: string;
    /** 可访问性 role（透传到根元素，覆盖默认 main 语义）。 */
    role?: string;
    children?: Snippet;
  }

  let {
    padding = false,
    class: className = '',
    style,
    ariaLabel,
    role,
    children,
  }: Props = $props();

  const paddingCss = $derived.by(() => {
    if (padding === true) return 'var(--cd-layout-content-padding)';
    if (padding === false) return '0';
    return typeof padding === 'number' ? `${padding}px` : padding;
  });

  const cls = $derived(['cd-layout-content', className].filter(Boolean).join(' '));

  // padding 派生样式在前，用户 style 在后（可覆盖）。
  const inlineStyle = $derived([`padding:${paddingCss}`, style ?? ''].filter(Boolean).join(';'));
</script>

<main class={cls} style={inlineStyle} aria-label={ariaLabel} {role}>
  {@render children?.()}
</main>

<style>
  .cd-layout-content {
    flex: 1;
    min-height: 0;
    background: var(--cd-layout-content-bg);
  }
</style>
