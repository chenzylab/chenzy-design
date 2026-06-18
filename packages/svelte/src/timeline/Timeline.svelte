<!--
  Timeline — see specs/components/show/Timeline.spec.md
  基础子集: vertical 方向、left/alternate mode、dataSource、pending、reverse、lineStyle。
  TODO(延后): horizontal、center mode、声明式 Item、virtualized、interactive 键盘漫游。
-->
<script lang="ts">
  import type { TimelineItemData } from './types.js';

  type Mode = 'left' | 'alternate';
  type Size = 'small' | 'default' | 'large';
  type LineStyle = 'solid' | 'dashed';

  interface Props {
    dataSource?: TimelineItemData[];
    mode?: Mode;
    reverse?: boolean;
    pending?: boolean | string;
    size?: Size;
    lineStyle?: LineStyle;
    class?: string;
  }

  let {
    dataSource = [],
    mode = 'left',
    reverse = false,
    pending = false,
    size = 'default',
    lineStyle = 'solid',
    class: className = '',
  }: Props = $props();

  // TODO(i18n): 接 locale 包默认 loading 文案
  const PENDING_TEXT = '加载中…';

  const hasPending = $derived(pending !== false);
  const pendingText = $derived(typeof pending === 'string' ? pending : PENDING_TEXT);

  const ordered = $derived(reverse ? [...dataSource].reverse() : dataSource);

  const cls = $derived(
    [
      'cd-timeline',
      `cd-timeline--${mode}`,
      `cd-timeline--${size}`,
      `cd-timeline--${lineStyle}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  function dotStyle(item: TimelineItemData): string | undefined {
    const color = item.dotColor ?? item.color;
    return color ? `--cd-timeline-dot-current: ${color};` : undefined;
  }
</script>

<ul class={cls}>
  {#each ordered as item, index (item.key ?? index)}
    <li class="cd-timeline__item">
      <span class="cd-timeline__tail" aria-hidden="true"></span>
      <span class="cd-timeline__dot" style={dotStyle(item)} aria-hidden="true"></span>
      <div class="cd-timeline__body">
        <div class="cd-timeline__content">{item.content}</div>
        {#if item.time}
          <div class="cd-timeline__time">{item.time}</div>
        {/if}
      </div>
    </li>
  {/each}
  {#if hasPending}
    <li class="cd-timeline__item cd-timeline__item--pending">
      <span class="cd-timeline__dot cd-timeline__dot--pending" aria-hidden="true"></span>
      <div class="cd-timeline__body">
        <div class="cd-timeline__content">{pendingText}</div>
      </div>
    </li>
  {/if}
</ul>

<style>
  .cd-timeline {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-timeline__item {
    position: relative;
    display: flex;
    gap: var(--cd-timeline-gap);
    padding-block-end: var(--cd-timeline-gap);
    padding-inline-start: var(--cd-timeline-dot-size);
  }
  .cd-timeline__item:last-child {
    padding-block-end: 0;
  }
  .cd-timeline__dot {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: var(--cd-timeline-dot-size);
    block-size: var(--cd-timeline-dot-size);
    border-radius: var(--cd-radius-full);
    background: var(--cd-timeline-dot-current, var(--cd-timeline-dot-color));
  }
  .cd-timeline__dot--pending {
    background: transparent;
    border: 1px dashed var(--cd-timeline-dot-color);
  }
  .cd-timeline__tail {
    position: absolute;
    inset-block: var(--cd-timeline-dot-size) 0;
    inset-inline-start: calc(var(--cd-timeline-dot-size) / 2);
    inline-size: 0;
    border-inline-start: 1px solid var(--cd-timeline-line-color);
  }
  .cd-timeline--dashed .cd-timeline__tail {
    border-inline-start-style: dashed;
  }
  .cd-timeline__item:last-child .cd-timeline__tail {
    display: none;
  }
  .cd-timeline__item--pending .cd-timeline__tail,
  .cd-timeline__item:nth-last-child(2):has(~ .cd-timeline__item--pending) .cd-timeline__tail {
    border-inline-start-style: dashed;
  }
  .cd-timeline__body {
    flex: 1 1 auto;
    min-inline-size: 0;
  }
  .cd-timeline__content {
    color: var(--cd-timeline-content-color);
  }
  .cd-timeline__time {
    margin-block-start: var(--cd-spacing-1);
    color: var(--cd-timeline-time-color);
    font-size: var(--cd-font-size-1);
  }

  /* alternate: 奇偶项左右交替 */
  .cd-timeline--alternate .cd-timeline__item {
    inline-size: 50%;
  }
  .cd-timeline--alternate .cd-timeline__item:nth-child(odd) {
    margin-inline-start: auto;
  }
  .cd-timeline--alternate .cd-timeline__item:nth-child(even) {
    flex-direction: row-reverse;
    text-align: end;
    padding-inline: 0 var(--cd-timeline-dot-size);
  }
  .cd-timeline--alternate .cd-timeline__item:nth-child(even) .cd-timeline__dot {
    inset-inline: auto 0;
  }
  .cd-timeline--alternate .cd-timeline__item:nth-child(even) .cd-timeline__tail {
    inset-inline: auto calc(var(--cd-timeline-dot-size) / 2);
  }
</style>
