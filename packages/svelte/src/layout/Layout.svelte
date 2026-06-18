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
    children?: Snippet;
  }

  let { hasSider, class: className = '', children }: Props = $props();

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

<section class={cls}>
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
