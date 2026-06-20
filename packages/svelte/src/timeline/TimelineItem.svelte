<!--
  Timeline.Item — 声明式单项，与 dataSource 模式渲染同一套 .cd-timeline__item 结构，
  从而复用父 Timeline 的 :nth-child 交替布局 CSS（alternate/center）与方向样式，无需索引计算。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getTimelineContext, type TimelineLineStyle } from './context.js';

  interface Props {
    /** 圆点颜色（等价 dataSource 项的 dotColor/color）。 */
    dotColor?: string;
    /** 单项连接线样式，覆盖父 Timeline 的 lineStyle。 */
    lineStyle?: TimelineLineStyle;
    /** 时间文本，渲染在内容下方（horizontal 模式同 dataSource）。 */
    time?: string;
    children?: Snippet;
  }

  let { dotColor, lineStyle, time, children }: Props = $props();

  const ctx = getTimelineContext();

  // 未显式指定时回退到父 Timeline 的 lineStyle。
  const effectiveLine = $derived<TimelineLineStyle>(lineStyle ?? ctx?.getLineStyle() ?? 'solid');

  const dotInline = $derived(dotColor ? `--cd-timeline-dot-current: ${dotColor};` : undefined);
</script>

<li class={['cd-timeline__item', effectiveLine === 'dashed' && 'cd-timeline__item--dashed']}>
  <span class="cd-timeline__tail" aria-hidden="true"></span>
  <span class="cd-timeline__dot" style={dotInline} aria-hidden="true"></span>
  <div class="cd-timeline__body">
    <div class="cd-timeline__content">{@render children?.()}</div>
    {#if time}
      <div class="cd-timeline__time">{time}</div>
    {/if}
  </div>
</li>

<style>
  /* 单项 dashed 覆盖：作用于自身 tail，优先于父级 solid。 */
  .cd-timeline__item--dashed .cd-timeline__tail {
    border-inline-start-style: dashed;
  }
  :global(.cd-timeline--horizontal) .cd-timeline__item--dashed .cd-timeline__tail {
    border-inline-start: none;
    border-block-start-style: dashed;
  }
</style>
