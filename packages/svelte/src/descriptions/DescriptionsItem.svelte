<!--
  Descriptions.Item — 声明式单项，与 data 模式渲染同一套 .cd-descriptions__item 结构，
  从而复用父 Descriptions 的 grid 布局、bordered/方向样式。span 跨列由 grid-column: span 自排，
  span 钳制（不超过父 column 列数）经 context 读取父 column 完成——父级无需预先收集 children。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getDescriptionsContext } from './context.js';

  interface Props {
    /** 字段标签。 */
    label: string;
    /** 跨列数（钳制到父 column 列数，默认 1）。 */
    span?: number;
    children?: Snippet;
  }

  let { label, span, children }: Props = $props();

  const ctx = getDescriptionsContext();

  const direction = $derived(ctx?.getDirection() ?? 'horizontal');
  const colon = $derived(ctx?.getColon() ?? true);

  const clampedSpan = $derived.by(() => {
    const column = ctx?.getColumn() ?? 1;
    if (!span || span < 1) return 1;
    return Math.min(span, column);
  });

  // children 为空时回退到父 emptyText 占位（与 data 模式 displayValue 一致）。
  const emptyText = $derived(ctx?.getEmptyText() ?? '-');
</script>

<div class="cd-descriptions__item" style="grid-column: span {clampedSpan};">
  <dt class="cd-descriptions__label">
    {label}{#if colon && direction === 'horizontal'}<span
        class="cd-descriptions__colon"
        aria-hidden="true">:</span
      >{/if}
  </dt>
  <dd class="cd-descriptions__value">{#if children}{@render children()}{:else}{emptyText}{/if}</dd>
</div>
