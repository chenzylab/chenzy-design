<!--
  Space — see specs/components/basic/Space.spec.md
  间距布局容器，破坏性严格对齐 Semi Design（semi-ui/space + semi-foundation/space）。
  - props 仅：vertical / spacing / align / wrap / class / style / children，外加 ...rest 透传
    （data-* / aria-* / on* 到根 <div>，对齐 Semi getDataAttr）。根元素恒 <div>。
  - gap 与 align 由 class 驱动（不用 inline style），完整镜像 Semi scss；仅 number/array 中
    的 number 元素走 inline rowGap/columnGap。gap 值消费 --cd-spacing-space-tight/medium/loose。
  - 无超集：不再有 block / tag / role / ariaLabel。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type SpacingStep = 'tight' | 'medium' | 'loose';
  type SpacingItem = SpacingStep | number;
  type SpaceSpacing = SpacingItem | [SpacingItem, SpacingItem];
  type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';

  interface Props {
    /** 是否竖向排列（对齐 Semi）。false→row，true→column。 */
    vertical?: boolean;
    /**
     * 间距档位或自定义值：档位（tight/medium/loose）→ 对应 gap class；
     * number → inline px；数组 [水平, 垂直] 分别控制 column-gap / row-gap，
     * 元素为档位走 class、为 number 走 inline px（完全对齐 Semi index.tsx）。
     */
    spacing?: SpaceSpacing;
    /** 交叉轴对齐，映射 align-items（对齐 Semi）。 */
    align?: SpaceAlign;
    /** 横向自动换行（vertical 时强制不换行，对齐 Semi）。 */
    wrap?: boolean;
    /** 透传到根节点的自定义类名。 */
    class?: string;
    /** 透传到根节点的内联样式。 */
    style?: string;
    children?: Snippet;
    /** 其余原生属性透传到根 div（data-* / aria-* / on* 等，对齐 Semi getDataAttr）。 */
    [key: string]: unknown;
  }

  let {
    vertical = false,
    spacing = 'tight',
    align = 'center',
    wrap = false,
    class: className = '',
    style = '',
    children,
    ...rest
  }: Props = $props();

  const isStep = (v: SpacingItem): v is SpacingStep => typeof v === 'string';

  // Semi：vertical 时 wrap 无意义，强制关闭。
  const isWrap = $derived(wrap && vertical ? false : wrap);

  // 解析 spacing：得到 horizontalType/verticalType（档位 → class）与 inline gap（number）。
  const resolved = $derived.by(() => {
    let horizontalType: SpacingStep | undefined;
    let verticalType: SpacingStep | undefined;
    let columnGap: string | undefined;
    let rowGap: string | undefined;

    if (Array.isArray(spacing)) {
      const [h, v] = spacing;
      if (isStep(h)) horizontalType = h;
      else columnGap = `${h}px`;
      if (isStep(v)) verticalType = v;
      else rowGap = `${v}px`;
    } else if (isStep(spacing)) {
      horizontalType = spacing;
      verticalType = spacing;
    } else {
      columnGap = `${spacing}px`;
      rowGap = `${spacing}px`;
    }

    return { horizontalType, verticalType, columnGap, rowGap };
  });

  const cls = $derived(
    [
      'cd-space',
      vertical ? 'cd-space-vertical' : 'cd-space-horizontal',
      `cd-space-align-${align}`,
      isWrap && 'cd-space-wrap',
      resolved.horizontalType && `cd-space-${resolved.horizontalType}-horizontal`,
      resolved.verticalType && `cd-space-${resolved.verticalType}-vertical`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const inlineStyle = $derived(
    [
      resolved.columnGap && `column-gap:${resolved.columnGap}`,
      resolved.rowGap && `row-gap:${resolved.rowGap}`,
      style,
    ]
      .filter(Boolean)
      .join(';'),
  );
</script>

<div class={cls} style={inlineStyle || undefined} {...rest}>
  {@render children?.()}
</div>

<style>
  .cd-space {
    display: inline-flex;
  }
  .cd-space-vertical {
    flex-direction: column;
  }
  .cd-space-horizontal {
    flex-direction: row;
  }
  .cd-space-align-center {
    align-items: center;
  }
  .cd-space-align-end {
    align-items: flex-end;
  }
  .cd-space-align-start {
    align-items: flex-start;
  }
  .cd-space-align-baseline {
    align-items: baseline;
  }
  .cd-space-wrap {
    flex-wrap: wrap;
  }
  .cd-space-tight-horizontal {
    column-gap: var(--cd-spacing-space-tight);
  }
  .cd-space-tight-vertical {
    row-gap: var(--cd-spacing-space-tight);
  }
  .cd-space-medium-horizontal {
    column-gap: var(--cd-spacing-space-medium);
  }
  .cd-space-medium-vertical {
    row-gap: var(--cd-spacing-space-medium);
  }
  .cd-space-loose-horizontal {
    column-gap: var(--cd-spacing-space-loose);
  }
  .cd-space-loose-vertical {
    row-gap: var(--cd-spacing-space-loose);
  }
  /* RTL（对齐 Semi rtl.scss） */
  :global(.cd-rtl) .cd-space,
  :global(.cd-portal-rtl) .cd-space {
    direction: rtl;
  }
</style>
