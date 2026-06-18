<!--
  Row — 24-column flex grid container. Pairs with Col.
  Token-driven gutter via negative-margin technique. No hardcoded colors.
  NOTE: responsive object gutter (e.g. { md: 16 }) is intentionally not
  implemented this iteration; passing an object degrades to 0 gutter. TODO.
-->
<script lang="ts" module>
  export const ROW_CONTEXT_KEY = Symbol('cd-row');

  export interface RowContext {
    getGutterX: () => number;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';

  type RowAlign = 'top' | 'middle' | 'bottom' | 'baseline' | 'stretch';
  type RowJustify = 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

  interface Props {
    gutter?: number | [number, number];
    align?: RowAlign;
    justify?: RowJustify;
    wrap?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    gutter = 0,
    align = 'top',
    justify = 'start',
    wrap = true,
    class: className = '',
    children,
  }: Props = $props();

  const gutters = $derived.by<[number, number]>(() => {
    if (Array.isArray(gutter)) return [gutter[0], gutter[1]];
    if (typeof gutter === 'number') return [gutter, 0];
    // TODO: responsive object gutter not implemented — degrade to 0.
    return [0, 0];
  });

  const gutterX = $derived(gutters[0]);
  const gutterY = $derived(gutters[1]);

  // Col reads this to apply matching horizontal padding.
  setContext<RowContext>(ROW_CONTEXT_KEY, { getGutterX: () => gutterX });

  const alignItems = $derived.by(() => {
    switch (align) {
      case 'middle':
        return 'center';
      case 'bottom':
        return 'flex-end';
      case 'baseline':
        return 'baseline';
      case 'stretch':
        return 'stretch';
      default:
        return 'flex-start';
    }
  });

  const justifyContent = $derived.by(() => {
    switch (justify) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      case 'center':
        return 'center';
      default:
        return justify;
    }
  });

  const cls = $derived(['cd-row', className].filter(Boolean).join(' '));

  const inlineStyle = $derived(
    [
      `--cd-grid-gutter-x:${gutterX}px`,
      `--cd-grid-gutter-y:${gutterY}px`,
      `align-items:${alignItems}`,
      `justify-content:${justifyContent}`,
      `flex-wrap:${wrap ? 'wrap' : 'nowrap'}`,
    ].join(';'),
  );
</script>

<div class={cls} style={inlineStyle}>
  {@render children?.()}
</div>

<style>
  .cd-row {
    display: flex;
    flex-flow: row wrap;
    min-width: 0;
    margin-inline: calc(var(--cd-grid-gutter-x) / -2);
    row-gap: var(--cd-grid-gutter-y);
  }
</style>
