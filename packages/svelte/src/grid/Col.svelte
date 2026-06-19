<!--
  Col — child of Row in the 24-column grid.
  Reads Row's gutter via context for matching horizontal padding.
  响应式断点 props xs/sm/md/lg/xl/xxl：值为 number(span) 或
  { span, offset, order, push, pull, flex }，按当前视口断点降级解析后覆盖基础 props。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { resolveResponsiveValue, type Breakpoint } from '@chenzy-design/core';
  import { ROW_CONTEXT_KEY, type RowContext } from './Row.svelte';
  import { useBreakpoint } from './use-breakpoint.svelte.js';

  const COLUMNS = 24;

  type ColConfig = {
    span?: number;
    offset?: number;
    order?: number;
    push?: number;
    pull?: number;
    flex?: string | number;
  };
  type ColResponsive = number | ColConfig;

  interface Props {
    /** 0-24; 0 hides the column */
    span?: number;
    offset?: number;
    order?: number;
    push?: number;
    pull?: number;
    /** when set, takes precedence over `span` (the column uses raw flex) */
    flex?: string | number;
    xs?: ColResponsive;
    sm?: ColResponsive;
    md?: ColResponsive;
    lg?: ColResponsive;
    xl?: ColResponsive;
    xxl?: ColResponsive;
    class?: string;
    children?: Snippet;
  }

  let {
    span,
    offset = 0,
    order = 0,
    push = 0,
    pull = 0,
    flex,
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
    class: className = '',
    children,
  }: Props = $props();

  // Touch context so Col stays coupled to Row (padding comes from inherited var).
  getContext<RowContext>(ROW_CONTEXT_KEY);

  const bp = useBreakpoint();

  // 当前断点解析出的响应式覆盖（降级取值），叠加到基础 props 上。
  const resolved = $derived.by(() => {
    const byBp: Record<Breakpoint, ColResponsive | undefined> = { xs, sm, md, lg, xl, xxl };
    const r = resolveResponsiveValue<ColResponsive | undefined>(byBp, bp.current, undefined);
    const rc: ColConfig = r === undefined ? {} : typeof r === 'number' ? { span: r } : r;
    return {
      span: rc.span ?? span,
      offset: rc.offset ?? offset,
      order: rc.order ?? order,
      push: rc.push ?? push,
      pull: rc.pull ?? pull,
      flex: rc.flex ?? flex,
    };
  });

  function pct(units: number): string {
    return `${(units / COLUMNS) * 100}%`;
  }

  const hidden = $derived(resolved.span === 0);

  const sizeStyle = $derived.by(() => {
    const rSpan = resolved.span;
    const rFlex = resolved.flex;
    if (rFlex !== undefined) {
      // flex takes precedence over span (span is ignored when flex is set).
      const value = typeof rFlex === 'number' ? `${rFlex} ${rFlex} auto` : rFlex;
      return [`flex:${value}`];
    }
    if (rSpan !== undefined && rSpan > 0) {
      return [`flex:0 0 ${pct(rSpan)}`, `max-width:${pct(rSpan)}`];
    }
    // auto column: grow/shrink naturally.
    return ['flex:1 1 0'];
  });

  const rOffset = $derived(resolved.offset ?? 0);
  const rOrder = $derived(resolved.order ?? 0);
  const rPush = $derived(resolved.push ?? 0);
  const rPull = $derived(resolved.pull ?? 0);

  const inlineStyle = $derived(
    [
      ...sizeStyle,
      rOffset > 0 && `margin-inline-start:${pct(rOffset)}`,
      rOrder !== 0 && `order:${rOrder}`,
      rPush > 0 && `inset-inline-start:${pct(rPush)}`,
      rPull > 0 && `inset-inline-end:${pct(rPull)}`,
    ]
      .filter(Boolean)
      .join(';'),
  );

  const relative = $derived(rPush > 0 || rPull > 0);

  const cls = $derived(['cd-col', relative && 'cd-col--relative', className].filter(Boolean).join(' '));
</script>

{#if !hidden}
  <div class={cls} style={inlineStyle}>
    {@render children?.()}
  </div>
{/if}

<style>
  .cd-col {
    min-width: 0;
    /* border-box so the gutter padding is included in the flex-basis %,
       otherwise 4×span-6 (=24) overflows 100% and wraps to a new line. */
    box-sizing: border-box;
    padding-inline: calc(var(--cd-grid-gutter-x) / 2);
  }
  .cd-col--relative {
    position: relative;
  }
</style>
