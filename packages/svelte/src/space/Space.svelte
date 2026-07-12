<!--
  Space — see specs/components/basic/Space.spec.md
  Flex spacing container. Token-driven gap.
  Aligns with Semi Design's Space (vertical/spacing/align/wrap) while adding our
  superset: `block`/`tag`/`style` passthrough.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type SpacingItem = 'tight' | 'medium' | 'loose' | number;
  type SpaceSpacing = SpacingItem | [SpacingItem, SpacingItem];
  type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';

  interface Props {
    /** Vertical layout. When true, items stack in a column. */
    vertical?: boolean;
    /**
     * Gap between items. Accepts a preset step, a number (px), or a
     * `[horizontal, vertical]` tuple where each element is a step or number.
     */
    spacing?: SpaceSpacing;
    align?: SpaceAlign;
    wrap?: boolean;
    block?: boolean;
    tag?: keyof HTMLElementTagNameMap;
    /** ARIA role passthrough for the container element. */
    role?: string | undefined;
    /** ARIA label passthrough for the container element. */
    ariaLabel?: string | undefined;
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let {
    vertical = false,
    spacing = 'tight',
    align = 'center',
    wrap = false,
    block = false,
    tag = 'div',
    role,
    ariaLabel,
    class: className = '',
    style = '',
    children,
  }: Props = $props();

  const stepVar: Record<Exclude<SpacingItem, number>, string> = {
    tight: 'var(--cd-space-tight)',
    medium: 'var(--cd-space-medium)',
    loose: 'var(--cd-space-loose)',
  };

  const resolveItem = (item: SpacingItem): string =>
    typeof item === 'number' ? `${item}px` : stepVar[item];

  // Semi: wrap is meaningless in the vertical direction, so force it off.
  const isWrap = $derived(vertical ? false : wrap);

  const gapCss = $derived.by(() => {
    if (Array.isArray(spacing)) {
      const [horizontalGap, verticalGap] = spacing;
      // spacing[0] → horizontal → column-gap, spacing[1] → vertical → row-gap.
      return `row-gap:${resolveItem(verticalGap)};column-gap:${resolveItem(horizontalGap)}`;
    }
    return `gap:${resolveItem(spacing)}`;
  });

  const alignItems = $derived(align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align);

  const cls = $derived(
    [
      'cd-space',
      vertical ? 'cd-space--vertical' : 'cd-space--horizontal',
      isWrap && 'cd-space--wrap',
      block && 'cd-space--block',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const inlineStyle = $derived(
    [gapCss, `align-items:${alignItems}`, style].filter(Boolean).join(';'),
  );
</script>

<svelte:element
  this={tag}
  class={cls}
  style={inlineStyle || undefined}
  {role}
  aria-label={ariaLabel}
>
  {@render children?.()}
</svelte:element>

<style>
  .cd-space {
    display: inline-flex;
  }
  .cd-space--block {
    display: flex;
  }
  .cd-space--horizontal {
    flex-direction: row;
  }
  .cd-space--vertical {
    flex-direction: column;
  }
  .cd-space--wrap {
    flex-wrap: wrap;
  }
</style>
