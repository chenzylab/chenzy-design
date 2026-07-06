<!--
  CardGroup — see specs/components/show/CardGroup.spec.md
  把多个 Card 以网格方式成组排布，统一间距（spacing）。纯 CSS 布局，无运行时。
  对标 Semi CardGroup（type='grid' + spacing: number | [x, y]）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type CardGroupType = 'grid';

  export interface Props {
    /** 卡片间距：number 统一水平/垂直；[x, y] 分别指定水平/垂直间距。 */
    spacing?: number | number[];
    /** 排布类型（当前仅 grid）。 */
    type?: CardGroupType;
    /** 组语义标签（aria-label）。 */
    ariaLabel?: string;
    /** 根节点自定义类名。 */
    class?: string;
    /** 根节点自定义内联样式。 */
    style?: string;
    /** 子 Card。 */
    children?: Snippet;
  }

  let {
    spacing,
    type = 'grid',
    ariaLabel,
    class: className,
    style,
    children,
  }: Props = $props();

  // spacing → [columnGap, rowGap]。number 统一；[x, y] 分别取值（缺省回退 x）。
  const gaps = $derived.by<[string, string] | undefined>(() => {
    if (spacing === undefined) return undefined;
    if (Array.isArray(spacing)) {
      const x = spacing[0];
      const y = spacing.length > 1 ? spacing[1] : spacing[0];
      if (x === undefined) return undefined;
      return [`${x}px`, `${y ?? x}px`];
    }
    return [`${spacing}px`, `${spacing}px`];
  });

  const gapStyle = $derived(
    gaps
      ? `--cd-cardgroup-column-gap:${gaps[0]};--cd-cardgroup-row-gap:${gaps[1]};`
      : '',
  );

  const rootStyle = $derived([gapStyle, style].filter(Boolean).join(''));
</script>

<div
  class={['cd-card-group', `cd-card-group--${type}`, className]
    .filter(Boolean)
    .join(' ')}
  style={rootStyle || undefined}
  role="group"
  aria-label={ariaLabel}
>
  {@render children?.()}
</div>

<style>
  .cd-card-group {
    display: grid;
    column-gap: var(--cd-cardgroup-column-gap, var(--cd-cardgroup-spacing));
    row-gap: var(--cd-cardgroup-row-gap, var(--cd-cardgroup-spacing));
  }
  .cd-card-group--grid {
    grid-template-columns: repeat(
      auto-fill,
      minmax(min(var(--cd-cardgroup-min-column), 100%), 1fr)
    );
  }
</style>
