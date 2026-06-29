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
    ['cd-layout-header', sticky && 'cd-layout-header--sticky', className].filter(Boolean).join(' '),
  );

  // height 派生样式在前，用户 style 在后（可覆盖）。
  const inlineStyle = $derived(
    [heightCss ? `height:${heightCss}` : '', style ?? ''].filter(Boolean).join(';') || undefined,
  );
</script>

<header class={cls} style={inlineStyle} aria-label={ariaLabel} {role}>
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
