<!--
  CardGroup — 卡片组容器，对齐 Semi CardGroup。
  基于 Space（inline-flex wrap）排布多个 Card，仅透传 spacing / wrap / class / style / ...rest：
  - 普通型：spacing 控制卡片等间距（默认 16，同 Semi）。
  - 网格型（type='grid'）：Space spacing=0，卡片 border-radius:0 且以 -1px 负边距拼接边框，覆盖 spacing。
  对齐 Semi：不向 Space 传 block/align/role/ariaLabel（Semi CardGroup 无这些）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Space } from '../space/index.js';

  export type CardGroupType = 'grid';

  export interface Props {
    /** 卡片间距：number 统一，[x, y] 分别指定水平/垂直（网格型下被忽略）。 */
    spacing?: number | number[];
    /** 卡片组类型；grid 为网格型，将覆盖 spacing。 */
    type?: CardGroupType;
    /** 根节点自定义类名。 */
    class?: string;
    /** 根节点自定义内联样式。 */
    style?: string;
    /** 子 Card。 */
    children?: Snippet;
    /** 其余原生属性透传到根节点（对齐 Semi ...others）。 */
    [key: string]: unknown;
  }

  let {
    spacing = 16,
    type,
    class: className,
    style,
    children,
    ...rest
  }: Props = $props();

  const isGrid = $derived(type === 'grid');

  // Semi：网格型 spacing 恒为 0，靠 -1px 负边距拼接；否则透传 spacing。
  // number[] → [x, y] tuple 以对齐我们 Space 的 spacing 类型。
  const spaceSpacing = $derived.by<number | [number, number]>(() => {
    if (isGrid) return 0;
    if (Array.isArray(spacing)) {
      const x = spacing[0] ?? 0;
      const y = spacing.length > 1 ? (spacing[1] ?? x) : x;
      return [x, y];
    }
    return spacing;
  });

  const cls = $derived(
    ['cd-card-group', isGrid && 'cd-card-group--grid', className]
      .filter(Boolean)
      .join(' '),
  );
</script>

<Space spacing={spaceSpacing} wrap class={cls} style={style ?? ''} {...rest}>
  {@render children?.()}
</Space>

<style>
  /*
    网格型：子 Card 去圆角，以 -1px 负边距使相邻边框重叠为单线（对齐 Semi）。
    .cd-card-group--grid 作用在 Space 渲染的根节点（非本组件模板内），子 .cd-card 亦为外部组件，
    故整条走 :global，否则 Svelte scoped 会因找不到静态匹配而剪掉规则、样式失效。
  */
  :global(.cd-card-group--grid .cd-card) {
    border-radius: 0;
    margin-inline-start: var(--cd-cardgroup-card-margin);
    margin-block-start: var(--cd-cardgroup-card-margin);
  }
</style>
