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
    /** 根元素自定义内联样式（透传，叠加在 height 之后）。 */
    style?: string;
    /** 可访问性标签（透传到根元素 aria-label）。 */
    ariaLabel?: string;
    /** 可访问性 role（透传到根元素）。 */
    role?: string;
    children?: Snippet;
  }

  let {
    sticky = false,
    height,
    class: className = '',
    style,
    ariaLabel,
    role,
    children,
  }: Props = $props();

  const heightCss = $derived.by(() => {
    if (height === undefined) return undefined;
    return typeof height === 'number' ? `${height}px` : height;
  });

  const cls = $derived(
    ['cd-layout-footer', sticky && 'cd-layout-footer--sticky', className].filter(Boolean).join(' '),
  );

  // height 派生样式在前，用户 style 在后（可覆盖）。
  const inlineStyle = $derived(
    [heightCss ? `height:${heightCss}` : '', style ?? ''].filter(Boolean).join(';') || undefined,
  );
</script>

<footer class={cls} style={inlineStyle} aria-label={ariaLabel} {role}>
  {@render children?.()}
</footer>

<style>
  .cd-layout-footer {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    padding-block: var(--cd-spacing-base);
    padding-inline: var(--cd-spacing-loose);
    background: var(--cd-layout-footer-bg);
    color: var(--cd-layout-footer-color);
    text-align: center;
  }
  .cd-layout-footer--sticky {
    position: sticky;
    inset-block-end: 0;
  }
</style>
