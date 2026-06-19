<!--
  Row — 24-column flex grid container. Pairs with Col.
  Token-driven gutter via negative-margin technique. No hardcoded colors.
  响应式 gutter：支持按断点对象 { xs, sm, md, lg, xl, xxl }，每档值可为
  number 或 [x, y]，按当前视口断点降级解析（mobile-first）。
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
  import { resolveResponsiveValue, type Breakpoint } from '@chenzy-design/core';
  import { useBreakpoint } from './use-breakpoint.svelte.js';

  type RowAlign = 'top' | 'middle' | 'bottom' | 'baseline' | 'stretch';
  type RowJustify = 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  type GutterValue = number | [number, number];
  type ResponsiveGutter = Partial<Record<Breakpoint, GutterValue>>;

  interface Props {
    gutter?: GutterValue | ResponsiveGutter;
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

  const bp = useBreakpoint();

  function toPair(v: GutterValue): [number, number] {
    return Array.isArray(v) ? [v[0], v[1]] : [v, 0];
  }

  const gutters = $derived.by<[number, number]>(() => {
    if (typeof gutter === 'number' || Array.isArray(gutter)) return toPair(gutter);
    // responsive object: resolve by current breakpoint (mobile-first cascade).
    const resolved = resolveResponsiveValue<GutterValue>(gutter, bp.current, 0);
    return toPair(resolved);
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
