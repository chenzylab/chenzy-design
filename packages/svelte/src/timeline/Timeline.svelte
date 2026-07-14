<!--
  Timeline — 严格对齐 Semi timeline/index.tsx。
  两种用法（对齐 Semi）：
    - dataSource：传节点数据数组，父直接映射为 <Timeline.Item> 并按 mode 计算位置类（含 idx 奇偶）。
    - 声明式：在 children 内写 <Timeline.Item>，各项经 context 拿父 mode 与自身顺序索引自算位置类。
  DOM：<ul class="cd-timeline cd-timeline-{mode} {class}" aria-label style>{items}</ul>（对齐 Semi）。
  mode 决定各节点相对位置：left（默认）/right/center/alternate。无 direction/reverse/pending/size/
  lineStyle/virtualized/interactive —— Semi Timeline 无此能力，破坏性移除。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import TimelineItem from './TimelineItem.svelte';
  import { setTimelineContext, type TimelineMode } from './context.js';
  import type { TimelineItemData } from './types.js';

  interface Props {
    /** 通过 mode 改变时间轴和内容的相对位置。 */
    mode?: TimelineMode;
    class?: string;
    style?: string;
    /** 时间轴数据源，支持 content 属性及 Timeline.Item 的所有属性。 */
    dataSource?: TimelineItemData[];
    /** 无障碍标签。 */
    'aria-label'?: string;
    /** 声明式用法：内嵌 <Timeline.Item> 列表（未传 dataSource 时生效）。 */
    children?: Snippet;
  }

  let {
    mode = 'left',
    class: className,
    style,
    dataSource,
    'aria-label': ariaLabel,
    children,
  }: Props = $props();

  const useDataSource = $derived(Array.isArray(dataSource) && dataSource.length > 0);

  // dataSource 模式：父直接按 mode + idx 计算位置类（对齐 Semi getPosCls）。
  function posClassFor(item: TimelineItemData, idx: number): string {
    if (mode === 'alternate') {
      if (item.position) return `cd-timeline-item-${item.position}`;
      return idx % 2 === 0 ? 'cd-timeline-item-left' : 'cd-timeline-item-right';
    }
    if (mode === 'center') {
      if (item.position) return `cd-timeline-item-${item.position}`;
      return 'cd-timeline-item-left';
    }
    if (mode === 'left' || mode === 'right') {
      return `cd-timeline-item-${mode}`;
    }
    if (item.position) return `cd-timeline-item-${item.position}`;
    return '';
  }

  // 声明式子项登记：按挂载顺序维护 id 序列，getIndex 返回当前位序（version 触发响应）。
  let seq = 0;
  const order: number[] = [];
  let version = $state(0);
  setTimelineContext({
    getMode: () => mode,
    registerItem: () => {
      const id = seq;
      seq += 1;
      order.push(id);
      version += 1;
      return {
        getIndex: () => {
          void version;
          return order.indexOf(id);
        },
        unregister: () => {
          const i = order.indexOf(id);
          if (i >= 0) order.splice(i, 1);
          version += 1;
        },
      };
    },
  });

  const cls = $derived(
    ['cd-timeline', `cd-timeline-${mode}`, className].filter(Boolean).join(' '),
  );
</script>

<ul class={cls} {style} aria-label={ariaLabel}>
  {#if useDataSource}
    {#each dataSource as item, idx (item.key ?? idx)}
      <TimelineItem
        posClass={posClassFor(item, idx)}
        color={item.color}
        time={item.time}
        type={item.type ?? 'default'}
        dot={item.dot}
        extra={item.extra}
        class={item.class}
        style={item.style}
        onClick={item.onClick}
      >
        {#if typeof item.content === 'string'}{item.content}{:else if item.content}{@render item.content()}{/if}
      </TimelineItem>
    {/each}
  {:else}
    {@render children?.()}
  {/if}
</ul>

<style>
  /* 严格对齐 semi-foundation/timeline/timeline.scss，前缀 cd-timeline、值引 var(--cd-*)。
     根 <ul> 保留组件作用域哈希，后代 .cd-timeline-item-* 用 :global 包裹以覆盖
     <Timeline.Item> 子组件渲染的 <li>（跨组件边界）。 */
  .cd-timeline {
    margin: var(--cd-spacing-timeline-margin);
    padding: var(--cd-spacing-timeline-padding);
    width: var(--cd-width-timeline);
    list-style: none;
  }
  .cd-timeline :global(.cd-timeline-item) {
    position: relative;
    margin: var(--cd-spacing-timeline-item-margin);
    padding: var(--cd-spacing-none) var(--cd-spacing-none)
      var(--cd-spacing-timeline-item-paddingbottom) var(--cd-spacing-none);
    list-style: none;
  }
  .cd-timeline :global(.cd-timeline-item-tail) {
    position: absolute;
    top: var(--cd-spacing-timeline-tail-top);
    left: var(--cd-spacing-timeline-tail-left);
    height: var(--cd-height-timeline-tail);
    border-left: var(--cd-width-timeline-tail-border) solid var(--cd-color-timeline-tail-border);
  }
  .cd-timeline :global(.cd-timeline-item-head) {
    position: absolute;
    top: var(--cd-spacing-timeline-head-top);
    width: var(--cd-width-timeline-dot);
    height: var(--cd-width-timeline-dot);
    border-radius: var(--cd-radius-timeline-head);
  }
  .cd-timeline :global(.cd-timeline-item-head-ongoing) {
    background-color: var(--cd-color-timeline-dot-default-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-head-default) {
    background-color: var(--cd-color-timeline-dot-info-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-head-success) {
    background-color: var(--cd-color-timeline-dot-success-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-head-warning) {
    background-color: var(--cd-color-timeline-dot-warning-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-head-error) {
    background-color: var(--cd-color-timeline-dot-error-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-head-custom) {
    position: absolute;
    display: flex;
    align-self: center;
    top: var(--cd-spacing-timeline-head-custom-top);
    left: var(--cd-spacing-timeline-head-custom-left);
    width: var(--cd-width-timeline-head-custom);
    height: var(--cd-height-timeline-head-custom);
    border: var(--cd-width-timeline-head-custom-border);
    border-radius: var(--cd-radius-timeline-head-custom);
    transform: var(--cd-motion-timeline-head-custom-transform);
  }
  /* 自定义图标节点背景透明，图标继承语义色（对齐 Semi head-custom + head-{type}）。 */
  .cd-timeline :global(.cd-timeline-item-head-custom.cd-timeline-item-head-ongoing) {
    background-color: var(--cd-color-timeline-item-head-bg);
    color: var(--cd-color-timeline-dot-default-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-head-custom.cd-timeline-item-head-success) {
    background-color: var(--cd-color-timeline-item-head-bg);
    color: var(--cd-color-timeline-dot-success-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-head-custom.cd-timeline-item-head-warning) {
    background-color: var(--cd-color-timeline-item-head-bg);
    color: var(--cd-color-timeline-dot-warning-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-head-custom.cd-timeline-item-head-error) {
    background-color: var(--cd-color-timeline-item-head-bg);
    color: var(--cd-color-timeline-dot-error-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-head-custom.cd-timeline-item-head-default) {
    background-color: var(--cd-color-timeline-item-head-bg);
    color: var(--cd-color-timeline-dot-info-bg-default);
  }
  .cd-timeline :global(.cd-timeline-item-content) {
    position: relative;
    margin: var(--cd-spacing-none) var(--cd-spacing-none) var(--cd-spacing-none)
      var(--cd-spacing-timeline-content-marginleft);
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
    word-break: break-word;
    color: var(--cd-color-timeline-item-content-text-default);
  }
  .cd-timeline :global(.cd-timeline-item-content-extra),
  .cd-timeline :global(.cd-timeline-item-content-time) {
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    color: var(--cd-color-timeline-time-default-text-default);
    margin-top: var(--cd-spacing-timeline-time-margintop);
  }
  .cd-timeline :global(.cd-timeline-item:last-child > .cd-timeline-item-tail) {
    border-left: none;
  }

  /* alternate / right / center 共用：轴线居中，节点圆点/连线水平居中定位 */
  .cd-timeline-alternate :global(.cd-timeline-item-tail),
  .cd-timeline-alternate :global(.cd-timeline-item-head),
  .cd-timeline-alternate :global(.cd-timeline-item-head-custom),
  .cd-timeline-right :global(.cd-timeline-item-tail),
  .cd-timeline-right :global(.cd-timeline-item-head),
  .cd-timeline-right :global(.cd-timeline-item-head-custom),
  .cd-timeline-center :global(.cd-timeline-item-tail),
  .cd-timeline-center :global(.cd-timeline-item-head),
  .cd-timeline-center :global(.cd-timeline-item-head-custom) {
    left: var(--cd-spacing-timeline-item-head-custom-left);
  }
  .cd-timeline-alternate :global(.cd-timeline-item-head.cd-timeline-item-head-custom),
  .cd-timeline-right :global(.cd-timeline-item-head.cd-timeline-item-head-custom),
  .cd-timeline-center :global(.cd-timeline-item-head.cd-timeline-item-head-custom) {
    margin-left: 0;
  }
  .cd-timeline-alternate :global(.cd-timeline-item-head),
  .cd-timeline-right :global(.cd-timeline-item-head),
  .cd-timeline-center :global(.cd-timeline-item-head) {
    margin-left: var(--cd-spacing-timeline-item-head-marginleft);
  }
  .cd-timeline-alternate :global(.cd-timeline-item-left .cd-timeline-item-content),
  .cd-timeline-right :global(.cd-timeline-item-left .cd-timeline-item-content),
  .cd-timeline-center :global(.cd-timeline-item-left .cd-timeline-item-content) {
    left: var(--cd-spacing-timeline-item-left-item-content-left);
    width: var(--cd-width-timeline-item-left-item-content);
    text-align: left;
  }
  .cd-timeline-alternate :global(.cd-timeline-item-right .cd-timeline-item-content),
  .cd-timeline-right :global(.cd-timeline-item-right .cd-timeline-item-content),
  .cd-timeline-center :global(.cd-timeline-item-right .cd-timeline-item-content) {
    width: var(--cd-width-timeline-item-right-item-content);
    margin: var(--cd-spacing-timeline-item-right-item-content);
    text-align: right;
  }

  /* center：时间文本绝对定位到轴另一侧 */
  .cd-timeline-center :global(.cd-timeline-item-content-time) {
    position: absolute;
    top: var(--cd-spacing-timeline-time-top);
    margin-left: var(--cd-spacing-timeline-item-content-time-marginleft);
    width: var(--cd-width-timeline-item-content-time);
    text-align: right;
  }

  /* right：整条轴线靠右，右侧项圆点/连线定位到 100%-9px、内容宽度收窄 */
  .cd-timeline-right :global(.cd-timeline-item-right .cd-timeline-item-tail),
  .cd-timeline-right :global(.cd-timeline-item-right .cd-timeline-item-head),
  .cd-timeline-right :global(.cd-timeline-item-right .cd-timeline-item-head-custom) {
    left: var(--cd-spacing-timeline-item-right-item-left);
  }
  .cd-timeline-right :global(.cd-timeline-item-right .cd-timeline-item-content) {
    width: var(--cd-width-timeline-item-right-content);
  }
</style>
