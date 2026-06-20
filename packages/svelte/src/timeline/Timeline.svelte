<!--
  Timeline — see specs/components/show/Timeline.spec.md
  基础子集: vertical/horizontal 方向、left/alternate/center mode、dataSource、pending、reverse、lineStyle。
  两种用法择一：
    - 数据驱动：传 dataSource 数组（向后兼容，行为不变）。
    - 声明式：不传 dataSource，改在 children 内写 <Timeline.Item>（更灵活，可放富内容）。
  交替布局（alternate/center）由纯 CSS :nth-child 决定，两种模式渲染同一套 .cd-timeline__item
  结构，故声明式无需在父级计算索引即可复用同一交替样式。reverse 仅作用于 dataSource 模式
  （声明式下顺序由作者书写顺序决定）。
  TODO(延后): right mode、virtualized、interactive 键盘漫游。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { TimelineItemData } from './types.js';
  import { useLocale } from '../locale-provider/index.js';
  import { setTimelineContext } from './context.js';

  type Mode = 'left' | 'alternate' | 'center';
  type Direction = 'vertical' | 'horizontal';
  type Size = 'small' | 'default' | 'large';
  type LineStyle = 'solid' | 'dashed';

  interface Props {
    dataSource?: TimelineItemData[];
    mode?: Mode;
    direction?: Direction;
    reverse?: boolean;
    pending?: boolean | string;
    size?: Size;
    lineStyle?: LineStyle;
    class?: string;
    /** 声明式用法：内嵌 <Timeline.Item> 列表（不传 dataSource 时生效）。 */
    children?: Snippet;
  }

  let {
    dataSource = [],
    mode = 'left',
    direction = 'vertical',
    reverse = false,
    pending = false,
    size = 'default',
    lineStyle = 'solid',
    class: className = '',
    children,
  }: Props = $props();

  const loc = useLocale();

  // 声明式优先级低于 dataSource：仅在未传 dataSource 时渲染 children。
  const useDeclarative = $derived(dataSource.length === 0 && children != null);

  // 通过 context 向 <Timeline.Item> 暴露父级 lineStyle（getter 保持响应性）。
  setTimelineContext({ getLineStyle: () => lineStyle });

  const hasPending = $derived(pending !== false);
  const pendingText = $derived(
    typeof pending === 'string' ? pending : loc().t('Timeline.pending'),
  );

  const ordered = $derived(reverse ? [...dataSource].reverse() : dataSource);

  const cls = $derived(
    [
      'cd-timeline',
      `cd-timeline--${mode}`,
      `cd-timeline--${direction}`,
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
  {#if useDeclarative}
    {@render children?.()}
  {:else}
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
  {/if}
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
  /*
    .cd-timeline 根（<ul>）保留组件作用域哈希；其下各 .cd-timeline__* 后代用 :global 包裹，
    使同一套结构样式既覆盖本组件 dataSource 渲染的 <li>，也覆盖 <Timeline.Item> 在子组件中
    渲染的 <li>（跨组件边界）。交替布局靠 :nth-child，两种模式天然共用。
  */
  .cd-timeline {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-timeline :global(.cd-timeline__item) {
    position: relative;
    display: flex;
    gap: var(--cd-timeline-gap);
    padding-block-end: var(--cd-timeline-gap);
    padding-inline-start: var(--cd-timeline-dot-size);
  }
  .cd-timeline :global(.cd-timeline__item:last-child) {
    padding-block-end: 0;
  }
  .cd-timeline :global(.cd-timeline__dot) {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: var(--cd-timeline-dot-size);
    block-size: var(--cd-timeline-dot-size);
    border-radius: var(--cd-radius-full);
    background: var(--cd-timeline-dot-current, var(--cd-timeline-dot-color));
  }
  .cd-timeline :global(.cd-timeline__dot--pending) {
    background: transparent;
    border: 1px dashed var(--cd-timeline-dot-color);
  }
  .cd-timeline :global(.cd-timeline__tail) {
    position: absolute;
    inset-block: var(--cd-timeline-dot-size) 0;
    inset-inline-start: calc(var(--cd-timeline-dot-size) / 2);
    inline-size: 0;
    border-inline-start: 1px solid var(--cd-timeline-line-color);
  }
  .cd-timeline--dashed :global(.cd-timeline__tail) {
    border-inline-start-style: dashed;
  }
  .cd-timeline :global(.cd-timeline__item:last-child .cd-timeline__tail) {
    display: none;
  }
  .cd-timeline :global(.cd-timeline__item--pending .cd-timeline__tail),
  .cd-timeline
    :global(.cd-timeline__item:nth-last-child(2):has(~ .cd-timeline__item--pending) .cd-timeline__tail) {
    border-inline-start-style: dashed;
  }
  .cd-timeline :global(.cd-timeline__body) {
    flex: 1 1 auto;
    min-inline-size: 0;
  }
  .cd-timeline :global(.cd-timeline__content) {
    color: var(--cd-timeline-content-color);
  }
  .cd-timeline :global(.cd-timeline__time) {
    margin-block-start: var(--cd-spacing-1);
    color: var(--cd-timeline-time-color);
    font-size: var(--cd-font-size-1);
  }

  /* alternate / center: 轴线居中，奇偶项左右交替 */
  .cd-timeline--alternate :global(.cd-timeline__item),
  .cd-timeline--center :global(.cd-timeline__item) {
    inline-size: 50%;
  }
  .cd-timeline--alternate :global(.cd-timeline__item:nth-child(odd)),
  .cd-timeline--center :global(.cd-timeline__item:nth-child(odd)) {
    margin-inline-start: auto;
  }
  .cd-timeline--alternate :global(.cd-timeline__item:nth-child(even)),
  .cd-timeline--center :global(.cd-timeline__item:nth-child(even)) {
    flex-direction: row-reverse;
    text-align: end;
    padding-inline: 0 var(--cd-timeline-dot-size);
  }
  .cd-timeline--alternate :global(.cd-timeline__item:nth-child(even) .cd-timeline__dot),
  .cd-timeline--center :global(.cd-timeline__item:nth-child(even) .cd-timeline__dot) {
    inset-inline: auto 0;
  }
  .cd-timeline--alternate :global(.cd-timeline__item:nth-child(even) .cd-timeline__tail),
  .cd-timeline--center :global(.cd-timeline__item:nth-child(even) .cd-timeline__tail) {
    inset-inline: auto calc(var(--cd-timeline-dot-size) / 2);
  }
  /* center 与 alternate 的差异：center 下两侧内容均朝轴线对齐，
     左侧内容右对齐、右侧内容左对齐，形成关于中轴对称的居中观感；
     alternate 则保留各侧自然阅读方向（左侧左对齐）。 */
  .cd-timeline--center :global(.cd-timeline__item:nth-child(odd)) {
    text-align: end;
  }
  .cd-timeline--center :global(.cd-timeline__item:nth-child(even)) {
    text-align: start;
  }

  /* horizontal: 节点横向一行，连接线水平，内容在节点下方 */
  .cd-timeline--horizontal {
    flex-direction: row;
    align-items: flex-start;
  }
  .cd-timeline--horizontal :global(.cd-timeline__item) {
    flex: 1 1 0;
    inline-size: auto;
    flex-direction: column;
    margin-inline-start: 0;
    text-align: start;
    padding-block-start: var(--cd-timeline-dot-size);
    padding-block-end: 0;
    padding-inline: 0;
  }
  .cd-timeline--horizontal :global(.cd-timeline__dot) {
    inset-block-start: 0;
    inset-inline-start: 0;
  }
  /* 水平轴线：从节点圆心向右延伸至下一节点 */
  .cd-timeline--horizontal :global(.cd-timeline__tail) {
    inset-block: calc(var(--cd-timeline-dot-size) / 2) auto;
    inset-inline: var(--cd-timeline-dot-size) 0;
    inline-size: auto;
    block-size: 0;
    border-inline-start: none;
    border-block-start: 1px solid var(--cd-timeline-line-color);
  }
  .cd-timeline--horizontal.cd-timeline--dashed :global(.cd-timeline__tail) {
    border-block-start-style: dashed;
  }
  .cd-timeline--horizontal
    :global(.cd-timeline__item:nth-last-child(2):has(~ .cd-timeline__item--pending) .cd-timeline__tail) {
    border-block-start-style: dashed;
  }
  .cd-timeline--horizontal :global(.cd-timeline__body) {
    margin-block-start: var(--cd-timeline-gap);
  }
</style>
