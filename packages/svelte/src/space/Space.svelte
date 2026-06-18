<!--
  Space — see specs/components/basic/Space.spec.md
  Flex spacing container. Token-driven gap.
  NOTE: `split` slot (separator between items) is intentionally omitted in this
  iteration; to be added later alongside per-item iteration support.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type SpaceDirection = 'horizontal' | 'vertical';
  type SpaceSpacing = 'tight' | 'medium' | 'loose' | number | [number, number];
  type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';

  interface Props {
    direction?: SpaceDirection;
    spacing?: SpaceSpacing;
    align?: SpaceAlign;
    wrap?: boolean;
    block?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    direction = 'horizontal',
    spacing = 'medium',
    align,
    wrap = false,
    block = false,
    class: className = '',
    children,
  }: Props = $props();

  const presetGap: Record<string, string> = {
    tight: 'var(--cd-space-tight)',
    medium: 'var(--cd-space-medium)',
    loose: 'var(--cd-space-loose)',
  };

  const gapCss = $derived.by(() => {
    if (Array.isArray(spacing)) {
      const [row, col] = spacing;
      return `${row}px ${col}px`;
    }
    if (typeof spacing === 'number') {
      return `${spacing}px`;
    }
    return presetGap[spacing];
  });

  const alignItems = $derived.by(() => {
    if (!align) return undefined;
    if (align === 'start') return 'flex-start';
    if (align === 'end') return 'flex-end';
    return align;
  });

  const isPreset = $derived(typeof spacing === 'string');

  const cls = $derived(
    [
      'cd-space',
      `cd-space--${direction}`,
      isPreset && `cd-space--gap-${spacing}`,
      wrap && 'cd-space--wrap',
      block && 'cd-space--block',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const inlineStyle = $derived(
    [!isPreset && `gap:${gapCss}`, alignItems && `align-items:${alignItems}`]
      .filter(Boolean)
      .join(';'),
  );
</script>

<div class={cls} style={inlineStyle || undefined}>
  {@render children?.()}
</div>

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
  .cd-space--gap-tight {
    gap: var(--cd-space-tight);
  }
  .cd-space--gap-medium {
    gap: var(--cd-space-medium);
  }
  .cd-space--gap-loose {
    gap: var(--cd-space-loose);
  }
</style>
