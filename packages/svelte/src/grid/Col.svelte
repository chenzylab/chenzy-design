<!--
  Col — child of Row in the 24-column grid.
  Reads Row's gutter via context for matching horizontal padding.
  NOTE: responsive breakpoint props (xs/sm/md/lg/xl/xxl) are intentionally not
  implemented this iteration. TODO: add responsive span/offset objects.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { ROW_CONTEXT_KEY, type RowContext } from './Row.svelte';

  const COLUMNS = 24;

  interface Props {
    /** 0-24; 0 hides the column */
    span?: number;
    offset?: number;
    order?: number;
    push?: number;
    pull?: number;
    /** when set, takes precedence over `span` (the column uses raw flex) */
    flex?: string | number;
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
    class: className = '',
    children,
  }: Props = $props();

  // Touch context so Col stays coupled to Row (padding comes from inherited var).
  getContext<RowContext>(ROW_CONTEXT_KEY);

  function pct(units: number): string {
    return `${(units / COLUMNS) * 100}%`;
  }

  const hidden = $derived(span === 0);

  const sizeStyle = $derived.by(() => {
    if (flex !== undefined) {
      // flex takes precedence over span (span is ignored when flex is set).
      const value = typeof flex === 'number' ? `${flex} ${flex} auto` : flex;
      return [`flex:${value}`];
    }
    if (span !== undefined && span > 0) {
      return [`flex:0 0 ${pct(span)}`, `max-width:${pct(span)}`];
    }
    // auto column: grow/shrink naturally.
    return ['flex:1 1 0'];
  });

  const inlineStyle = $derived(
    [
      ...sizeStyle,
      offset > 0 && `margin-inline-start:${pct(offset)}`,
      order !== 0 && `order:${order}`,
      push > 0 && `inset-inline-start:${pct(push)}`,
      pull > 0 && `inset-inline-end:${pct(pull)}`,
    ]
      .filter(Boolean)
      .join(';'),
  );

  const relative = $derived(push > 0 || pull > 0);

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
