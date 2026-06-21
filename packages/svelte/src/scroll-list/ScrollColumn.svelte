<!--
  ScrollColumn — 单列滚轮（ScrollList 的内部子组件，不单独导出）。
  封装一列的：JS 主导定位吸附居中、点击/键盘选中、disabled 跳过、
  cyclic 循环、惯性物理（pointer 拖拽 + 减速）、虚拟化、loadMore、status。
  受控 value 不回写（红线 #1）：父层只透传当前 index，本列变更仅 onSelect 通知。
  所有 pointer/inertia/scroll/loadMore 监听命令式 + cleanup（红线 #3）；
  循环索引/虚拟窗口派生纯函数（红线 #2，复用 core）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    offsetToIndex,
    indexToOffset,
    indexOfValue,
    firstEnabledIndex,
    nextEnabledIndex,
    keyboardTarget,
    wrapIndex,
    cyclicVirtualCount,
    cyclicCenterIndex,
    cyclicRecenter,
    momentumStep,
    projectSettleIndex,
    fixedRange,
    type ScrollListItem,
    type ScrollListKey,
  } from '@chenzy-design/core';

  type Status = 'idle' | 'loading' | 'empty';

  interface Props {
    data: ScrollListItem[];
    /** 受控当前逻辑 index（已在父层解析，-1 表示无选中）。 */
    index: number;
    /** 是否受控：受控时本列不写内部 index，仅 onSelect。 */
    controlled: boolean;
    itemHeight: number;
    rows: number;
    disabled: boolean;
    cyclic: boolean;
    virtualized: boolean;
    overscan: number;
    status: Status;
    emptyText: string;
    loadingText: string;
    ariaLabel: string;
    itemIdPrefix: string;
    renderItem?: Snippet<[{ item: ScrollListItem; selected: boolean; index: number }]> | undefined;
    /** 选中逻辑 index 变化（落定/点击/键盘/惯性）。父层据此回调外部。 */
    onSelect: (logicalIndex: number) => void;
    /** 滚到末尾触发（非 cyclic 时有效）。 */
    onLoadMore?: (() => void) | undefined;
  }

  let {
    data,
    index,
    controlled,
    itemHeight,
    rows,
    disabled,
    cyclic,
    virtualized,
    overscan,
    status,
    emptyText,
    loadingText,
    ariaLabel,
    itemIdPrefix,
    renderItem,
    onSelect,
    onLoadMore,
  }: Props = $props();

  const count = $derived(data.length);
  const pad = $derived(Math.max(0, Math.floor((rows - 1) / 2)));
  const viewportHeight = $derived(itemHeight * rows);

  // cyclic 重复份数（奇数）：保证中段两侧各有完整一份缓冲。
  const REPEAT = 5;
  // 是否真正循环：cyclic 且 count 足够（>=rows，避免极短列循环视觉异常）。
  const isCyclic = $derived(cyclic && count >= Math.max(2, pad + 1));

  // 「虚拟总行数」：cyclic 时 count*REPEAT，否则 count。渲染/几何都以它为准。
  const virtualCount = $derived(isCyclic ? cyclicVirtualCount(count, REPEAT) : count);

  // 把逻辑 index 映射到虚拟 index（cyclic 落到中段，普通即原值）。
  function toVirtual(logical: number): number {
    if (count <= 0) return 0;
    const safe = logical < 0 ? Math.max(0, firstEnabledIndex(data)) : logical;
    return isCyclic ? cyclicCenterIndex(safe, count, REPEAT) : safe;
  }
  function toLogical(virtual: number): number {
    return isCyclic ? wrapIndex(virtual, count) : virtual;
  }

  // 非受控内部虚拟 index。
  let innerVIndex = $state(untrack(() => toVirtual(index)));
  // 当前虚拟 index：受控派生自 props.index；非受控读 inner。
  const currentVIndex = $derived(controlled ? toVirtual(index) : innerVIndex);
  // 当前逻辑 index（高亮用）。
  const currentLogical = $derived(toLogical(currentVIndex));

  // --- DOM 引用 ---
  let columnEl = $state<HTMLElement | null>(null);

  // 命令式控制变量（非 $state，避免触发重渲染循环）。
  let suppressCommit = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let lastSyncedV = -1;
  let loadMoreFired = false;

  // 惯性 / 拖拽状态（速度/偏移存 $state 以便调试，但驱动用命令式 rAF）。
  let rafId = 0;
  let dragging = $state(false);
  let velocity = 0; // px/ms
  let lastPointerY = 0;
  let lastPointerTs = 0;
  let pointerId = -1;

  function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function cancelInertia(): void {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  // 当前 scrollTop（scroll/drag/inertia 时命令式写入），驱动虚拟窗口派生。
  let scrollTopState = $state(0);

  // --- 虚拟化窗口（纯函数派生）---
  const vrange = $derived.by(() => {
    if (!virtualized) return { startIndex: 0, endIndex: virtualCount };
    // scroll 时由副作用更新 scrollTopState。
    return fixedRange(scrollTopState, viewportHeight, itemHeight, virtualCount, overscan);
  });

  // 渲染行：虚拟化时只渲染窗口内，否则全量；映射回逻辑项。
  const rendered = $derived.by(() => {
    const start = virtualized ? vrange.startIndex : 0;
    const end = virtualized ? vrange.endIndex : virtualCount;
    const out: Array<{ v: number; logical: number; item: ScrollListItem }> = [];
    for (let v = start; v < end; v += 1) {
      const logical = toLogical(v);
      const item = data[logical];
      if (item) out.push({ v, logical, item });
    }
    return out;
  });
  // 虚拟化时用上下 spacer 撑出总高度，使 scrollbar / 几何正确。
  const topSpacer = $derived(
    virtualized ? indexToOffset(vrange.startIndex, itemHeight) : 0,
  );
  const bottomSpacer = $derived(
    virtualized
      ? indexToOffset(Math.max(0, virtualCount - vrange.endIndex), itemHeight)
      : 0,
  );

  // 程序化滚动到虚拟 index。
  function scrollToV(virtual: number, smooth: boolean): void {
    const el = columnEl;
    if (!el) return;
    suppressCommit = true;
    el.scrollTo({
      top: indexToOffset(virtual, itemHeight),
      behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto',
    });
    lastSyncedV = virtual;
    scrollTopState = indexToOffset(virtual, itemHeight);
  }

  // 提交选中（逻辑 index）：非受控写 inner，受控只回调（红线 #1）。
  function commitV(virtual: number): void {
    const logical = toLogical(virtual);
    const item = data[logical];
    if (!item || item.disabled) return;
    if (!controlled) innerVIndex = virtual;
    lastSyncedV = virtual;
    onSelect(logical);
  }

  // 落定吸附：算最近 enabled 虚拟行 → 命令式吸附 → commit。
  function settleToOffset(scrollTop: number): void {
    const rawV = offsetToIndex(scrollTop, itemHeight, virtualCount);
    let targetV = rawV;
    const rawLogical = toLogical(rawV);
    if (data[rawLogical]?.disabled) {
      // 在逻辑空间找最近 enabled，再映回虚拟（保持 cyclic 中段附近）。
      const down = nextEnabledIndex(data, rawLogical, 1);
      const up = nextEnabledIndex(data, rawLogical, -1);
      const pickDown =
        Math.abs(down - rawLogical) <= Math.abs(rawLogical - up) && !data[down]?.disabled;
      const targetLogical = pickDown ? down : up;
      if (data[targetLogical]?.disabled) return; // 全 disabled
      targetV = rawV + (targetLogical - rawLogical);
    }
    scrollToV(targetV, true);
    if (toLogical(targetV) !== currentLogical) commitV(targetV);
    maybeRecenter(targetV);
  }

  // cyclic：落定后若滚出安全区，无动画跳回中段同余位置。
  function maybeRecenter(virtual: number): void {
    if (!isCyclic) return;
    const re = cyclicRecenter(virtual, count, REPEAT);
    if (re !== virtual) {
      // 下一帧无动画跳，避免与 smooth 吸附打架。
      requestAnimationFrame(() => {
        scrollToV(re, false);
        if (!controlled) innerVIndex = re;
      });
    }
  }

  // loadMore：非 cyclic，滚到接近末尾触发一次。
  function maybeLoadMore(scrollTop: number): void {
    if (isCyclic || !onLoadMore || status === 'loading') return;
    const max = indexToOffset(virtualCount, itemHeight) - viewportHeight;
    if (scrollTop >= max - itemHeight * 2) {
      if (!loadMoreFired) {
        loadMoreFired = true;
        onLoadMore();
      }
    } else {
      loadMoreFired = false;
    }
  }

  // --- scroll 监听 + 落定节流（命令式，红线 #3）---
  $effect(() => {
    const el = columnEl;
    if (!el || disabled) return;

    function onScroll(): void {
      const node = columnEl;
      if (!node) return;
      scrollTopState = node.scrollTop;
      maybeLoadMore(node.scrollTop);
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const n = columnEl;
        if (!n) return;
        if (suppressCommit) {
          suppressCommit = false;
          return;
        }
        if (dragging || rafId) return; // 拖拽/惯性中不抢落定
        settleToOffset(n.scrollTop);
      }, 120);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (settleTimer) clearTimeout(settleTimer);
    };
  });

  // --- pointer 拖拽 + 惯性（命令式 + cleanup，红线 #3）---
  $effect(() => {
    const el = columnEl;
    if (!el || disabled) return;

    function onPointerDown(e: PointerEvent): void {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      cancelInertia();
      dragging = true;
      velocity = 0;
      pointerId = e.pointerId;
      lastPointerY = e.clientY;
      lastPointerTs = e.timeStamp;
      try {
        el!.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    function onPointerMove(e: PointerEvent): void {
      if (!dragging || e.pointerId !== pointerId) return;
      const dy = e.clientY - lastPointerY;
      const dt = e.timeStamp - lastPointerTs || 16;
      // 拖拽：手指下移 → 内容上移（scrollTop 减），故减 dy。
      el!.scrollTop -= dy;
      scrollTopState = el!.scrollTop;
      // 速度（px/ms，正=scrollTop 增大方向）。
      velocity = -dy / dt;
      lastPointerY = e.clientY;
      lastPointerTs = e.timeStamp;
    }

    function endDrag(e: PointerEvent): void {
      if (e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = -1;
      try {
        el!.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      startInertia();
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
      cancelInertia();
    };
  });

  // 释放后惯性减速（命令式 rAF），减速到阈值后吸附到预测目标行。
  function startInertia(): void {
    const el = columnEl;
    if (!el) return;
    if (prefersReducedMotion() || Math.abs(velocity) < 0.02) {
      settleToOffset(el.scrollTop);
      return;
    }
    let prev = performance.now();
    const tick = (now: number): void => {
      const node = columnEl;
      if (!node) {
        rafId = 0;
        return;
      }
      const dt = Math.min(48, now - prev);
      prev = now;
      const step = momentumStep(velocity, dt);
      velocity = step.velocity;
      node.scrollTop += step.delta;
      scrollTopState = node.scrollTop;
      if (step.done) {
        rafId = 0;
        // 预测落点 → 平滑吸附（虚拟空间）。
        const targetV = projectSettleIndex(
          node.scrollTop,
          velocity,
          itemHeight,
          virtualCount,
        );
        // 跳过 disabled：复用 settle 逻辑。
        suppressCommit = false;
        settleToOffsetV(targetV);
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  // 由虚拟目标行落定（惯性结束用），跳 disabled。
  function settleToOffsetV(rawV: number): void {
    let targetV = rawV;
    const rawLogical = toLogical(rawV);
    if (data[rawLogical]?.disabled) {
      const down = nextEnabledIndex(data, rawLogical, 1);
      const up = nextEnabledIndex(data, rawLogical, -1);
      const pickDown =
        Math.abs(down - rawLogical) <= Math.abs(rawLogical - up) && !data[down]?.disabled;
      const targetLogical = pickDown ? down : up;
      if (data[targetLogical]?.disabled) return;
      targetV = rawV + (targetLogical - rawLogical);
    }
    scrollToV(targetV, true);
    if (toLogical(targetV) !== currentLogical) commitV(targetV);
    maybeRecenter(targetV);
  }

  // --- 初始定位 ---
  $effect(() => {
    const el = columnEl;
    if (!el) return;
    untrack(() => {
      const initV = toVirtual(index);
      el.scrollTo({ top: indexToOffset(initV, itemHeight), behavior: 'auto' });
      lastSyncedV = initV;
      scrollTopState = indexToOffset(initV, itemHeight);
    });
  });

  // --- 受控/状态变更 → 滚动同步（命令式）---
  $effect(() => {
    const target = currentVIndex;
    const el = columnEl;
    if (!el) return;
    untrack(() => {
      if (dragging || rafId) return;
      if (target === lastSyncedV) return;
      const actual = offsetToIndex(el.scrollTop, itemHeight, virtualCount);
      if (actual === target) {
        lastSyncedV = target;
        return;
      }
      scrollToV(target, true);
    });
  });

  // --- 点击选中 ---
  function selectV(virtual: number): void {
    if (disabled) return;
    const item = data[toLogical(virtual)];
    if (!item || item.disabled) return;
    cancelInertia();
    scrollToV(virtual, true);
    commitV(virtual);
    maybeRecenter(virtual);
  }

  // --- 键盘 ---
  function handleKey(e: KeyboardEvent): void {
    if (disabled || count === 0) return;
    const k = e.key as ScrollListKey;
    if (
      k !== 'ArrowUp' &&
      k !== 'ArrowDown' &&
      k !== 'PageUp' &&
      k !== 'PageDown' &&
      k !== 'Home' &&
      k !== 'End'
    ) {
      return;
    }
    e.preventDefault();
    cancelInertia();
    const targetLogical = keyboardTarget(data, currentLogical, k);
    if (targetLogical === currentLogical) return;
    // 在逻辑空间移动，映回虚拟（保持中段附近，cyclic 平滑）。
    const targetV = currentVIndex + (targetLogical - currentLogical);
    scrollToV(targetV, true);
    commitV(targetV);
    maybeRecenter(targetV);
  }

  function itemId(virtual: number): string {
    return `${itemIdPrefix}-${virtual}`;
  }
  const activeDescId = $derived(count > 0 ? itemId(currentVIndex) : undefined);
  const padList = $derived(Array.from({ length: pad }, (_, i) => i));
</script>

<div
  class="cd-scroll-list__col"
  class:cd-scroll-list__col--dragging={dragging}
  style="--cd-sl-item-height: {itemHeight}px; --cd-sl-viewport-height: {viewportHeight}px;"
>
  {#if status === 'empty'}
    <div class="cd-scroll-list__status" role="status">{emptyText}</div>
  {:else}
    <div
      class="cd-scroll-list__column"
      role="listbox"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      aria-activedescendant={activeDescId}
      aria-disabled={disabled || undefined}
      tabindex={disabled ? -1 : 0}
      bind:this={columnEl}
      onkeydown={handleKey}
    >
      {#each padList as p (`pad-top-${p}`)}
        <div class="cd-scroll-list__spacer" aria-hidden="true"></div>
      {/each}

      {#if virtualized && topSpacer > 0}
        <div class="cd-scroll-list__vspacer" style="height:{topSpacer}px" aria-hidden="true"></div>
      {/if}

      {#each rendered as row (row.v)}
        {@const selected = row.logical === currentLogical}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          id={itemId(row.v)}
          class="cd-scroll-list__item"
          class:cd-scroll-list__item--selected={selected}
          class:cd-scroll-list__item--disabled={row.item.disabled}
          role="option"
          tabindex={-1}
          aria-selected={selected}
          aria-disabled={row.item.disabled || undefined}
          onclick={() => selectV(row.v)}
        >
          {#if renderItem}
            {@render renderItem({ item: row.item, selected, index: row.logical })}
          {:else}
            {row.item.label}
          {/if}
        </div>
      {/each}

      {#if virtualized && bottomSpacer > 0}
        <div class="cd-scroll-list__vspacer" style="height:{bottomSpacer}px" aria-hidden="true"></div>
      {/if}

      {#if status === 'loading'}
        <div class="cd-scroll-list__loading" role="status">{loadingText}</div>
      {/if}

      {#each padList as p (`pad-bottom-${p}`)}
        <div class="cd-scroll-list__spacer" aria-hidden="true"></div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cd-scroll-list__col {
    position: relative;
    flex: 1 1 0;
    min-inline-size: 0;
    block-size: var(--cd-sl-viewport-height);
  }
  .cd-scroll-list__col--dragging {
    cursor: grabbing;
  }

  .cd-scroll-list__column {
    block-size: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    outline: none;
    touch-action: pan-y;
  }
  .cd-scroll-list__column::-webkit-scrollbar {
    display: none;
  }
  .cd-scroll-list__column:focus-visible {
    box-shadow: inset 0 0 0 2px var(--cd-focus-ring);
    border-radius: var(--cd-scrolllist-radius);
  }

  .cd-scroll-list__spacer {
    block-size: var(--cd-sl-item-height);
    flex: 0 0 auto;
  }
  .cd-scroll-list__vspacer {
    flex: 0 0 auto;
  }

  .cd-scroll-list__item {
    display: flex;
    align-items: center;
    justify-content: center;
    block-size: var(--cd-sl-item-height);
    padding-inline: var(--cd-spacing-2);
    cursor: pointer;
    color: var(--cd-scrolllist-color-text-adjacent);
    white-space: nowrap;
    transition: color var(--cd-scrolllist-transition);
  }
  .cd-scroll-list__item--selected {
    color: var(--cd-scrolllist-color-text);
    font-weight: 600;
  }
  .cd-scroll-list__item--disabled {
    color: var(--cd-scrolllist-color-text-disabled);
    cursor: not-allowed;
  }

  .cd-scroll-list__status,
  .cd-scroll-list__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-scrolllist-color-text-disabled);
    font-size: var(--cd-font-size-body);
  }
  .cd-scroll-list__status {
    block-size: 100%;
  }
  .cd-scroll-list__loading {
    block-size: var(--cd-sl-item-height);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-scroll-list__item {
      transition: none;
    }
  }
</style>
