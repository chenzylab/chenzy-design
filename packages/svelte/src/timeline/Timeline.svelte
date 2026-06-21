<!--
  Timeline — see specs/components/show/Timeline.spec.md
  基础子集: vertical/horizontal 方向、left/right/alternate/center mode、dataSource、pending、reverse、lineStyle。
  两种用法择一：
    - 数据驱动：传 dataSource 数组（向后兼容，行为不变）。
    - 声明式：不传 dataSource，改在 children 内写 <Timeline.Item>（更灵活，可放富内容）。
  交替布局（alternate/center）由纯 CSS :nth-child 决定，两种模式渲染同一套 .cd-timeline__item
  结构，故声明式无需在父级计算索引即可复用同一交替样式。reverse 仅作用于 dataSource 模式
  （声明式下顺序由作者书写顺序决定）。

  进阶子集：
    - virtualized（boolean + itemHeight + maxHeight）：长时间轴只渲染视口内项，复用 core
      fixedRange/scrollOffsetForIndex（与 List/VirtualList 同一套区间数学）。命令式滚动监听 +
      rAF 节流 + cleanup（红线 #3）；区间/总高纯 $derived 仅依赖本地 $state（红线 #2）。
      轴线连续性：spacer 撑满总高、项绝对定位 translateY，固定 itemHeight 下相邻项的 tail
      天然衔接；tail 显隐按数据索引判定（非 :nth-child）。仅在 dataSource 模式生效（声明式
      children 无法纯切片/测高）。virtualized 强制 vertical 列布局。
    - interactive（boolean）：roving tabindex（WAI-ARIA）。项可聚焦，↑↓/←→ 在项间移动焦点，
      Home/End 跳首尾，Enter/Space 触发项 onClick。焦点索引为本地 $state，roving 由纯函数
      nextRovingIndex 派生；命令式 focus()/scrollToIndex（红线 #2/#3）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { TimelineItemData } from './types.js';
  import {
    fixedRange,
    scrollOffsetForIndex,
    rovingKeyFromEvent,
    nextRovingIndex,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { setTimelineContext } from './context.js';

  type Mode = 'left' | 'right' | 'alternate' | 'center';
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
    /** 虚拟化：长时间轴只渲染视口内项（仅 dataSource 模式生效，强制 vertical）。 */
    virtualized?: boolean;
    /** 虚拟化固定项高（px），默认 56。 */
    itemHeight?: number;
    /** 虚拟化视口最大高（px 数字或 CSS 字符串），默认 400。 */
    maxHeight?: number | string;
    /** 虚拟化上下缓冲项数，默认 3。 */
    overscan?: number;
    /** interactive：项可聚焦 + 方向键 roving 漫游 + Enter/Space 触发 onClick。 */
    interactive?: boolean;
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
    virtualized = false,
    itemHeight = 56,
    maxHeight = 400,
    overscan = 3,
    interactive = false,
    children,
  }: Props = $props();

  const loc = useLocale();

  // 声明式优先级低于 dataSource：仅在未传 dataSource 时渲染 children。
  const useDeclarative = $derived(dataSource.length === 0 && children != null);

  // 通过 context 向 <Timeline.Item> 暴露父级 lineStyle + interactive 状态（getter 保持响应性）。
  // 焦点登记：声明式项在挂载时领号，roving 索引由父持有；项不写 $state（红线 #2）。
  setTimelineContext({
    getLineStyle: () => lineStyle,
    getInteractive: () => interactive,
    registerItem: registerDeclItem,
    isFocused: (id) => interactive && effectiveDeclFocusId === id,
    onItemKeydown: (id, e) => onDeclItemKeydown(id, e),
    onItemFocus: (id) => {
      declFocusedId = id;
    },
  });

  const hasPending = $derived(pending !== false);
  const pendingText = $derived(
    typeof pending === 'string' ? pending : loc().t('Timeline.pending'),
  );

  const ordered = $derived(reverse ? [...dataSource].reverse() : dataSource);

  // --- virtualized：仅 dataSource 模式生效（声明式 children 无法纯切片/测高）。 ---
  const virtualOn = $derived(virtualized && !useDeclarative && ordered.length > 0);
  const vItemHeight = $derived(itemHeight > 0 ? itemHeight : 56);
  const vOverscan = $derived(Math.max(0, overscan));
  const vMaxHeightStyle = $derived(
    typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
  );

  // viewport 普通引用（bind:this），不参与响应式几何读取。
  let viewportEl = $state<HTMLDivElement | null>(null);
  // 本地响应式状态：仅由命令式回调 / ResizeObserver 写入，render 期只读。
  let vScrollTop = $state(0);
  let vMeasuredH = $state(0);
  let vRafId = 0;

  const vTotalHeight = $derived(ordered.length * vItemHeight);
  const vRange = $derived(
    fixedRange(vScrollTop, vMeasuredH, vItemHeight, ordered.length, vOverscan),
  );
  const vStart = $derived(vRange.startIndex);
  const vEnd = $derived(vRange.endIndex);
  const vVisible = $derived(ordered.slice(vStart, vEnd));

  // 虚拟化滚动监听（命令式 + rAF 节流 + cleanup；红线 #3）。
  $effect(() => {
    const el = viewportEl;
    if (!el || !virtualOn) return;
    vMeasuredH = el.clientHeight;
    function onScroll() {
      if (vRafId) return;
      vRafId = requestAnimationFrame(() => {
        vRafId = 0;
        if (el) vScrollTop = el.scrollTop;
      });
    }
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) vMeasuredH = entry.contentRect.height;
    });
    ro.observe(el);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      if (vRafId) {
        cancelAnimationFrame(vRafId);
        vRafId = 0;
      }
    };
  });

  /** 命令式滚动到指定索引项（红线 #3：直接写 DOM scrollTop，非 render 期）。 */
  function vScrollToIndex(index: number): void {
    const el = viewportEl;
    if (!el || !virtualOn) return;
    const i = Math.max(0, Math.min(ordered.length - 1, Math.floor(index)));
    const target = scrollOffsetForIndex(
      i * vItemHeight,
      vItemHeight,
      el.clientHeight,
      vTotalHeight,
      'start',
    );
    el.scrollTop = target;
    vScrollTop = target;
  }

  // --- interactive：roving tabindex（焦点索引本地 $state，移动由纯函数派生）。 ---
  // dataSource 模式用数值索引；声明式模式用挂载顺序生成的 id。
  let focusedIndex = $state(0);

  // tabindex 派生：roving — 焦点项 0，其余 -1（无焦点项时首项为 0 接收 Tab）。
  function dsTabindex(index: number): 0 | -1 {
    if (!interactive) return -1;
    const fi = focusedIndex < 0 ? 0 : Math.min(focusedIndex, ordered.length - 1);
    return index === fi ? 0 : -1;
  }

  function focusDsIndex(index: number): void {
    const i = Math.max(0, Math.min(ordered.length - 1, index));
    focusedIndex = i;
    // 虚拟化下目标可能未渲染：先滚入视口，下一帧 DOM 就绪再 focus。
    if (virtualOn) {
      vScrollToIndex(i);
      requestAnimationFrame(() => {
        viewportEl
          ?.querySelector<HTMLElement>(`[data-tindex="${i}"]`)
          ?.focus();
      });
    } else {
      const root = rootEl;
      root?.querySelector<HTMLElement>(`[data-tindex="${i}"]`)?.focus();
    }
  }

  let rootEl = $state<HTMLElement | null>(null);

  function onDsItemKeydown(e: KeyboardEvent, index: number, item: TimelineItemData): void {
    if (!interactive) return;
    const intent = rovingKeyFromEvent(e.key);
    if (intent) {
      e.preventDefault();
      const next = nextRovingIndex(index, ordered.length, intent, false);
      if (next >= 0) focusDsIndex(next);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.onClick?.();
    }
  }

  function onDsItemActivate(item: TimelineItemData, index: number): void {
    if (!interactive) return;
    focusedIndex = index;
    item.onClick?.();
  }

  // --- 声明式 interactive 焦点登记（仿 Tabs：簿记用普通数组，render 重建仅由 version 触发）---
  // 子项在 $effect 内 register/unregister，只 bump version；render 读快照不写 $state（红线 #2），
  // 避免「子注册 effect 既读又写同一 $state 数组」自循环。
  let declSeq = 0;
  const declOrder: number[] = []; // 普通数组：按挂载顺序的 id 序列
  let declVersion = $state(0);
  let declFocusedId = $state(-1); // 由 onItemFocus / roving 写入，render-safe 派生兜底

  // render 期只读快照：roving 序列（id 数组），仅依赖 version 重建。
  const declIds = $derived.by<number[]>(() => {
    void declVersion;
    return [...declOrder];
  });
  // 有效焦点 id：当前 declFocusedId 仍在序列内则用之，否则回退首项（接收 Tab）。
  const effectiveDeclFocusId = $derived(
    declIds.includes(declFocusedId) ? declFocusedId : (declIds[0] ?? -1),
  );

  function registerDeclItem(): { id: number; unregister: () => void } {
    const id = declSeq;
    declSeq += 1;
    declOrder.push(id);
    declVersion += 1;
    return {
      id,
      unregister: () => {
        const i = declOrder.indexOf(id);
        if (i >= 0) declOrder.splice(i, 1);
        declVersion += 1;
      },
    };
  }

  function focusDeclId(id: number): void {
    declFocusedId = id;
    rootEl?.querySelector<HTMLElement>(`[data-tid="${id}"]`)?.focus();
  }

  function onDeclItemKeydown(id: number, e: KeyboardEvent): void {
    if (!interactive) return;
    const intent = rovingKeyFromEvent(e.key);
    if (!intent) return; // Enter/Space 的 onClick 由 Timeline.Item 自身处理。
    e.preventDefault();
    const ids = declIds;
    const cur = ids.indexOf(id);
    const next = nextRovingIndex(cur, ids.length, intent, false);
    const nextId = ids[next];
    if (nextId !== undefined) focusDeclId(nextId);
  }

  const cls = $derived(
    [
      'cd-timeline',
      `cd-timeline--${virtualOn ? 'left' : mode}`,
      `cd-timeline--${virtualOn ? 'vertical' : direction}`,
      `cd-timeline--${size}`,
      `cd-timeline--${lineStyle}`,
      virtualOn && 'cd-timeline--virtual',
      interactive && 'cd-timeline--interactive',
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

{#snippet itemBody(item: TimelineItemData)}
  <span class="cd-timeline__dot" style={dotStyle(item)} aria-hidden="true"></span>
  <div class="cd-timeline__body">
    <div class="cd-timeline__content">{item.content}</div>
    {#if item.time}
      <div class="cd-timeline__time">{item.time}</div>
    {/if}
  </div>
{/snippet}

{#if virtualOn}
  <!-- 虚拟化：视口自身滚动，spacer 撑满总高 + 项绝对定位 translateY，轴线靠固定项高天然衔接。 -->
  <div
    bind:this={rootEl}
    class={cls}
    role="list"
    style={`max-block-size:${vMaxHeightStyle}; overflow:auto`}
    bind:this={viewportEl}
  >
    <div class="cd-timeline__virtual-spacer" style={`block-size:${vTotalHeight}px`}>
      {#each vVisible as item, i (item.key ?? vStart + i)}
        {@const index = vStart + i}
        {@const isLastData = index === ordered.length - 1 && !hasPending}
        {#if interactive}
          <div
            class="cd-timeline__item cd-timeline__virtual-item"
            class:cd-timeline__item--last={isLastData}
            class:cd-timeline__item--interactive={true}
            role="button"
            tabindex={dsTabindex(index)}
            data-tindex={index}
            aria-label={item.content}
            style={`transform:translateY(${index * vItemHeight}px); block-size:${vItemHeight}px`}
            onclick={() => onDsItemActivate(item, index)}
            onkeydown={(e) => onDsItemKeydown(e, index, item)}
          >
            <span class="cd-timeline__tail" aria-hidden="true"></span>
            {@render itemBody(item)}
          </div>
        {:else}
          <div
            class="cd-timeline__item cd-timeline__virtual-item"
            class:cd-timeline__item--last={isLastData}
            role="listitem"
            style={`transform:translateY(${index * vItemHeight}px); block-size:${vItemHeight}px`}
          >
            <span class="cd-timeline__tail" aria-hidden="true"></span>
            {@render itemBody(item)}
          </div>
        {/if}
      {/each}
    </div>
  </div>
{:else}
  <ul bind:this={rootEl} class={cls}>
    {#if useDeclarative}
      {@render children?.()}
    {:else}
      {#each ordered as item, index (item.key ?? index)}
        {#if interactive}
          <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
          <li
            class="cd-timeline__item cd-timeline__item--interactive"
            role="button"
            tabindex={dsTabindex(index)}
            data-tindex={index}
            aria-label={item.content}
            onclick={() => onDsItemActivate(item, index)}
            onkeydown={(e) => onDsItemKeydown(e, index, item)}
          >
            <span class="cd-timeline__tail" aria-hidden="true"></span>
            {@render itemBody(item)}
          </li>
        {:else}
          <li class="cd-timeline__item">
            <span class="cd-timeline__tail" aria-hidden="true"></span>
            {@render itemBody(item)}
          </li>
        {/if}
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
{/if}

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

  /* right: left 的镜像——轴线在右侧，内容靠右对齐排在轴左侧。
     复用 alternate even-child 的镜像手法（row-reverse + 内边距/dot/tail 翻转），
     但应用到全部 item 而非交替项。 */
  .cd-timeline--right :global(.cd-timeline__item) {
    flex-direction: row-reverse;
    text-align: end;
    padding-inline: 0 var(--cd-timeline-dot-size);
  }
  .cd-timeline--right :global(.cd-timeline__dot) {
    inset-inline: auto 0;
  }
  .cd-timeline--right :global(.cd-timeline__tail) {
    inset-inline: auto calc(var(--cd-timeline-dot-size) / 2);
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

  /* --- virtualized：视口自身滚动，spacer 撑满总高 + 项绝对定位（固定项高保证轴线衔接）。 --- */
  .cd-timeline--virtual {
    position: relative;
    display: block;
    scrollbar-color: var(--cd-virtual-list-scrollbar, currentColor) transparent;
  }
  .cd-timeline__virtual-spacer {
    position: relative;
    inline-size: 100%;
  }
  .cd-timeline :global(.cd-timeline__virtual-item) {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    /* 固定项高：取消 last-child 兜底，由内联 block-size 控制；padding 不参与高度计算 */
    box-sizing: border-box;
    padding-block-end: 0;
    overflow: hidden;
  }
  /* 虚拟化下 tail 默认贯穿整个项高，保证滚动中轴线连续；末项（无 pending）隐藏 */
  .cd-timeline :global(.cd-timeline__virtual-item .cd-timeline__tail) {
    inset-block: var(--cd-timeline-dot-size) calc(var(--cd-timeline-dot-size) * -1);
  }
  .cd-timeline :global(.cd-timeline__item--last .cd-timeline__tail) {
    display: none;
  }

  /* --- interactive：roving 焦点项可聚焦，焦点高亮。 --- */
  .cd-timeline--interactive :global(.cd-timeline__item--interactive) {
    cursor: pointer;
    outline: none;
    border-radius: var(--cd-radius-small, 4px);
  }
  .cd-timeline--interactive :global(.cd-timeline__item--interactive:hover) {
    background: var(--cd-color-fill-0, rgba(0, 0, 0, 0.03));
  }
  .cd-timeline--interactive :global(.cd-timeline__item--interactive:focus-visible) {
    box-shadow: inset 0 0 0 2px var(--cd-focus-ring, var(--cd-color-primary, #0066ff));
  }
</style>
