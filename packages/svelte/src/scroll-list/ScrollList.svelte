<!--
  ScrollList — see specs/components/show/ScrollList.spec.md
  滚轮选择器（单列子集）：JS 主导定位吸附居中，中央选区遮罩 + 上下渐隐。
  点击/键盘选中、disabled 跳过；受控 value 不回写，仅 onChange 通知。
  复用 @chenzy-design/core 纯函数（offsetToIndex/indexToOffset/indexOfValue/keyboardTarget）。
  TODO(延后): 多列联动 / 惯性物理 / cyclic / 虚拟化 / loadMore / status。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    useId,
    offsetToIndex,
    indexToOffset,
    indexOfValue,
    firstEnabledIndex,
    nextEnabledIndex,
    keyboardTarget,
    type ScrollListValue,
    type ScrollListItem,
    type ScrollListKey,
  } from '@chenzy-design/core';

  type Size = 'small' | 'default' | 'large';
  type ChangeInfo = { value: ScrollListValue; item: ScrollListItem; index: number };

  interface Props {
    value?: ScrollListValue;
    defaultValue?: ScrollListValue;
    data?: ScrollListItem[];
    size?: Size;
    rows?: number;
    itemHeight?: number;
    disabled?: boolean;
    ariaLabel?: string;
    renderItem?: Snippet<[{ item: ScrollListItem; selected: boolean; index: number }]>;
    onChange?: (info: ChangeInfo) => void;
  }

  let {
    value,
    defaultValue,
    data = [],
    size = 'default',
    rows = 5,
    itemHeight,
    disabled = false,
    ariaLabel = '滚动选择',
    renderItem,
    onChange,
  }: Props = $props();

  const baseId = useId('cd-scroll-list-opt');
  function itemId(index: number): string {
    return `${baseId}-${index}`;
  }

  const ih = $derived(itemHeight ?? { small: 28, default: 36, large: 44 }[size]);
  const count = $derived(data.length);
  // 首尾留白行数，使首/尾项可滚到中心；rows 取奇数
  const pad = $derived(Math.max(0, Math.floor((rows - 1) / 2)));
  const padList = $derived(Array.from({ length: pad }, (_, i) => i));
  const viewportHeight = $derived(ih * rows);

  // --- 初始 index 解析（defaultValue / value），落到首个 enabled ---
  function resolveInitialIndex(): number {
    const seed = value !== undefined ? value : defaultValue;
    const i = indexOfValue(data, seed);
    if (i >= 0 && !data[i]?.disabled) return i;
    const fallback = firstEnabledIndex(data);
    return fallback === -1 ? 0 : fallback;
  }

  // --- 受控 value 不回写（红线 #1）：内部 $state + 派生当前 index ---
  const isControlled = $derived(value !== undefined);
  let innerIndex = $state(untrack(() => resolveInitialIndex()));
  const controlledIndex = $derived.by(() => {
    const i = indexOfValue(data, value);
    return i >= 0 ? i : 0;
  });
  const currentIndex = $derived(isControlled ? controlledIndex : innerIndex);

  // --- DOM 引用（命令式滚动，红线 #3）---
  let columnEl = $state<HTMLElement | null>(null);

  // suppressCommit：普通变量（非 $state），程序化 scrollTo 期间置 true，
  // 落定检测里若为 true 则只清 flag 不 commit —— 断开「程序滚动 ↔ 落定 commit」死循环。
  let suppressCommit = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let lastSyncedIndex = -1;

  function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // 程序化滚动到某 index（命令式），落定由 suppressCommit 抑制 commit
  function scrollToIndex(index: number, smooth: boolean): void {
    const el = columnEl;
    if (!el) return;
    suppressCommit = true;
    el.scrollTo({
      top: indexToOffset(index, ih),
      behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto',
    });
    lastSyncedIndex = index;
  }

  // 提交选中：仅非受控写 inner，受控只回调（红线 #1）
  function commitIndex(index: number): void {
    const item = data[index];
    if (!item || item.disabled) return;
    if (!isControlled) innerIndex = index;
    lastSyncedIndex = index;
    onChange?.({ value: item.value, item, index });
  }

  // 落定后吸附到最近 enabled 项。无 CSS scroll-snap，手动滚动停下会残留
  // 非整数 offset，必须 JS 命令式吸附到 target*ih，确保选中项精确居中。
  function settleToOffset(scrollTop: number): void {
    const raw = offsetToIndex(scrollTop, ih, count);
    let target = raw;
    if (data[raw]?.disabled) {
      const down = nextEnabledIndex(data, raw, 1);
      const up = nextEnabledIndex(data, raw, -1);
      // 取距离 raw 更近的 enabled 项
      target =
        Math.abs(down - raw) <= Math.abs(raw - up) && !data[down]?.disabled ? down : up;
      if (data[target]?.disabled) return; // 全 disabled，放弃
    }
    // 始终命令式吸附到 target*ih（消除手动滚动残留的非整数 offset）；
    // scrollToIndex 设 suppressCommit=true 防循环，commit 单独执行。
    scrollToIndex(target, true);
    if (target !== currentIndex) commitIndex(target);
  }

  // --- scroll 监听 + 落定节流（命令式，红线 #3）---
  $effect(() => {
    const el = columnEl;
    if (!el || disabled) return;

    function onScroll(): void {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const node = columnEl;
        if (!node) return;
        if (suppressCommit) {
          // 程序滚动落定：只清 flag，不 commit —— 闭环终止
          suppressCommit = false;
          return;
        }
        settleToOffset(node.scrollTop);
      }, 120);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (settleTimer) clearTimeout(settleTimer);
    };
  });

  // --- 初始定位：mount 时滚一次到初始 index（behavior auto），仅依赖 columnEl ---
  $effect(() => {
    const el = columnEl;
    if (!el) return;
    untrack(() => {
      const init = resolveInitialIndex();
      el.scrollTo({ top: indexToOffset(init, ih), behavior: 'auto' });
      lastSyncedIndex = init;
    });
  });

  // --- 受控 / 状态变更 → 滚动同步（命令式）。
  // 依赖 currentIndex，当它与 DOM 实际居中 index 不一致时 scrollTo 过去；
  // scrollTo 期间 suppressCommit=true，落定算出同一 idx 时只清 flag 不再 commit，闭环终止（红线 #3）。
  $effect(() => {
    const target = currentIndex;
    const el = columnEl;
    if (!el) return;
    untrack(() => {
      if (target === lastSyncedIndex) return;
      const actual = offsetToIndex(el.scrollTop, ih, count);
      if (actual === target) {
        lastSyncedIndex = target;
        return;
      }
      scrollToIndex(target, true);
    });
  });

  // --- 点击选中：disabled 跳过，否则命令式滚到该 index 并 commit ---
  function selectIndex(index: number): void {
    if (disabled) return;
    const item = data[index];
    if (!item || item.disabled) return;
    scrollToIndex(index, true);
    commitIndex(index);
  }

  // --- 键盘：core 解析目标 index，命令式滚动 + commit ---
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
    const target = keyboardTarget(data, currentIndex, k);
    if (target === currentIndex) return;
    scrollToIndex(target, true);
    commitIndex(target);
  }

  const activeDescId = $derived(count > 0 ? itemId(currentIndex) : undefined);

  const cls = $derived(
    ['cd-scroll-list', `cd-scroll-list--${size}`, disabled && 'cd-scroll-list--disabled']
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  class={cls}
  style="--cd-sl-item-height: {ih}px; --cd-sl-viewport-height: {viewportHeight}px;"
>
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

    {#each data as item, index (item.value)}
      {@const selected = index === currentIndex}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        id={itemId(index)}
        class="cd-scroll-list__item"
        class:cd-scroll-list__item--selected={selected}
        class:cd-scroll-list__item--disabled={item.disabled}
        role="option"
        tabindex={-1}
        aria-selected={selected}
        aria-disabled={item.disabled || undefined}
        onclick={() => selectIndex(index)}
      >
        {#if renderItem}
          {@render renderItem({ item, selected, index })}
        {:else}
          {item.label}
        {/if}
      </div>
    {/each}

    {#each padList as p (`pad-bottom-${p}`)}
      <div class="cd-scroll-list__spacer" aria-hidden="true"></div>
    {/each}
  </div>

  <div class="cd-scroll-list__mask" aria-hidden="true"></div>
  <div class="cd-scroll-list__gradient cd-scroll-list__gradient--top" aria-hidden="true"></div>
  <div class="cd-scroll-list__gradient cd-scroll-list__gradient--bottom" aria-hidden="true"></div>
</div>

<style>
  .cd-scroll-list {
    position: relative;
    inline-size: 100%;
    block-size: var(--cd-sl-viewport-height);
    overflow: hidden;
    border: 1px solid var(--cd-scrolllist-border-color);
    border-radius: var(--cd-scrolllist-radius);
    color: var(--cd-scrolllist-color-text-adjacent);
    font-size: var(--cd-font-size-body);
  }

  .cd-scroll-list__column {
    block-size: 100%;
    overflow-y: auto;
    /* 不使用 CSS scroll-snap：mandatory 吸附会劫持 JS smooth scrollTo，
       导致最终 scrollTop 非 index*ih 的整数倍，选中项与中央 mask 错位。
       改为纯 JS 主导定位（scrollToIndex + 落定 JS 吸附）。 */
    scrollbar-width: none;
    outline: none;
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

  .cd-scroll-list--disabled .cd-scroll-list__column {
    overflow: hidden;
  }
  .cd-scroll-list--disabled .cd-scroll-list__item {
    pointer-events: none;
    cursor: not-allowed;
  }

  /* 中央选区遮罩：居中一行，上下 1px 边框 */
  .cd-scroll-list__mask {
    position: absolute;
    inset-inline: 0;
    inset-block-start: calc(50% - var(--cd-sl-item-height) / 2);
    block-size: var(--cd-sl-item-height);
    background: var(--cd-scrolllist-mask-bg);
    border-block: 1px solid var(--cd-scrolllist-mask-border);
    pointer-events: none;
  }

  /* 上/下渐隐 */
  .cd-scroll-list__gradient {
    position: absolute;
    inset-inline: 0;
    block-size: calc((var(--cd-sl-viewport-height) - var(--cd-sl-item-height)) / 2);
    pointer-events: none;
  }
  .cd-scroll-list__gradient--top {
    inset-block-start: 0;
    background: linear-gradient(
      to bottom,
      var(--cd-scrolllist-gradient-color),
      transparent
    );
  }
  .cd-scroll-list__gradient--bottom {
    inset-block-end: 0;
    background: linear-gradient(to top, var(--cd-scrolllist-gradient-color), transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-scroll-list__item {
      transition: none;
    }
  }
</style>
