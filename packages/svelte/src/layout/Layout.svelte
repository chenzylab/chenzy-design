<!--
  Layout — root flex container. Column by default; row when a Sider is present.
  Sider auto-detection: Sider registers itself via context on mount, flipping the
  direction to row. Explicit `hasSider` always wins.
  NOTE: child onMount runs after the parent, so SSR/first frame may render column
  then switch to row. For SSR correctness pass `hasSider` explicitly.
-->
<script lang="ts" module>
  export const LAYOUT_CONTEXT_KEY = Symbol('cd-layout');

  export interface LayoutContext {
    registerSider: () => void;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';

  interface Props {
    hasSider?: boolean;
    class?: string;
    /** 根元素自定义内联样式（透传）。Layout 不附带背景/尺寸样式，按需自定义。 */
    style?: string;
    /** 可访问性标签（透传到根元素 aria-label）。 */
    ariaLabel?: string;
    /** 可访问性 role（透传到根元素，覆盖默认语义）。 */
    role?: string;
    children?: Snippet;
  }

  let {
    hasSider,
    class: className = '',
    style,
    ariaLabel,
    role,
    children,
  }: Props = $props();

  let hasSiderDetected = $state(false);

  setContext<LayoutContext>(LAYOUT_CONTEXT_KEY, {
    registerSider: () => {
      hasSiderDetected = true;
    },
  });

  const isRow = $derived(hasSider ?? hasSiderDetected);

  const cls = $derived(
    ['cd-layout', isRow ? 'cd-layout--has-sider' : 'cd-layout--column', className]
      .filter(Boolean)
      .join(' '),
  );
</script>

<section class={cls} {style} aria-label={ariaLabel} {role}>
  {@render children?.()}
</section>

<style>
  .cd-layout {
    display: flex;
    flex: auto;
    flex-direction: column;
    min-height: 0;
    background: var(--cd-layout-bg);
  }
  .cd-layout--has-sider {
    flex-direction: row;
  }
</style>
