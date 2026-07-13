<!--
  ScrollItem — 严格对齐 Semi Design（semi-ui/scrollList/scrollItem.tsx）。
  一列滚动选择：mode='wheel'（滚轮，中线吸附居中）| 'normal'（普通列表，点击选中）。

  对齐要点：
  - DOM/class 镜像 Semi：wheel → -item-wheel > -shade-pre/-selector/-shade-post/-list-outer>ul>li；
    normal → -item > ul>li（选中 li 加 -item-sel）。
  - wheel 滚动落定：找选区中线最近的非禁用节点 → 吸附居中 + 加 -item-selected 类 + onSelect。
  - cycled（仅 wheel）：渲染重复份，滚动落定后无缝重定位回中段（等价 Semi adjustInfiniteList 的节点搬移）。
  - selectedIndex 受控变化 → 缓动滚动到该项居中（motion=true 用 rAF ease-out，对齐 semi-animation；false 直达）。
  - transform：选中项文案变换（item.transform 优先于公共 transform，对齐 Semi renderItemList）。
  - onSelect 载荷 {...item, value, type, index}（对齐 Semi notifySelectItem）。
  所有 scroll/rAF 监听命令式 + cleanup；纯几何/文案复用 @chenzy-design/core。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import {
    resolveItemText,
    centerOffset,
    nearestIndex,
    wrapIndex,
    scrollFrame,
    repeatCount,
    SCROLL_LIST_DEFAULT_ITEM_HEIGHT,
    SCROLL_LIST_DEFAULT_SCROLL_DURATION,
    type ScrollItemMode,
    type ScrollItemData,
    type ScrollItemSelectPayload,
  } from '@chenzy-design/core';

  interface Props {
    /** 模式：wheel（滚轮吸附）| normal（点击选中）。对齐 Semi mode，默认 wheel。 */
    mode?: ScrollItemMode;
    /** 无限循环，仅 mode='wheel' 生效。对齐 Semi cycled。 */
    cycled?: boolean;
    /** 列表数据。对齐 Semi list。 */
    list?: ScrollItemData[];
    /** 选中项索引。对齐 Semi selectedIndex。 */
    selectedIndex?: number;
    /** 是否开启滚动动画。对齐 Semi motion。 */
    motion?: boolean;
    /** 公共文案变换（选中项）。对齐 Semi transform。 */
    transform?: (value: unknown, text: string) => string;
    /** 列标识，透传回 onSelect 供外层区分列。对齐 Semi type。 */
    type?: string | number;
    /** 选中回调。对齐 Semi onSelect。 */
    onSelect?: (data: ScrollItemSelectPayload) => void;
    /** 列样式类名。对齐 Semi className。 */
    class?: string;
    /** 列内联样式。对齐 Semi style。 */
    style?: string;
    /** 列无障碍标签。对齐 Semi aria-label。 */
    ariaLabel?: string;
  }

  let {
    mode = 'wheel',
    cycled = false,
    list = [],
    selectedIndex = 0,
    motion = true,
    transform,
    type,
    onSelect,
    class: className,
    style,
    ariaLabel,
  }: Props = $props();

  const count = $derived(list.length);
  const isWheel = $derived(mode === 'wheel');
  // 真正循环：wheel + cycled + 数据非空。
  const isCyclic = $derived(isWheel && cycled && count > 0);

  // 项高（对齐 Semi $height-scrollList_item）。
  const ITEM_HEIGHT = SCROLL_LIST_DEFAULT_ITEM_HEIGHT;

  // list-outer 实际高度：默认 300（对齐 Semi $height-scrollList，SSR/首帧），mount 后按真实
  // offsetHeight 测量（对齐 Semi scrollToNode 读 wrapper.offsetHeight，支持 bodyHeight 收窄）。
  let wheelHeight = $state(300);

  // ul 顶部 :before 空白（对齐 Semi ($height-scrollList - $height-scrollList_item)*0.5），随实测高变化。
  const TOP_PADDING = $derived((wheelHeight - ITEM_HEIGHT) / 2);

  // cycled 重复份数（奇数，保证中段两侧各有缓冲）。ratio=2 对齐 Semi init shouldPrepend/Append。
  const REPEAT = $derived(
    isCyclic ? Math.max(3, (repeatCount(count, ITEM_HEIGHT, wheelHeight, 2) * 2 + 1) | 1) : 1,
  );
  const virtualCount = $derived(isCyclic ? count * REPEAT : count);

  // 逻辑 index ↔ 虚拟 index（cycled 落到正中那份）。
  function toVirtual(logical: number): number {
    if (!isCyclic || count <= 0) return logical;
    const mid = Math.floor(REPEAT / 2);
    return mid * count + wrapIndex(logical, count);
  }
  function toLogical(virtual: number): number {
    return isCyclic ? wrapIndex(virtual, count) : virtual;
  }

  // 渲染行（虚拟）：cycled 铺 REPEAT 份，否则原 list。
  const rendered = $derived.by(() => {
    const out: Array<{ v: number; logical: number; item: ScrollItemData }> = [];
    for (let v = 0; v < virtualCount; v += 1) {
      const logical = toLogical(v);
      const item = list[logical];
      if (item) out.push({ v, logical, item });
    }
    return out;
  });

  function isDisabledLogical(logical: number): boolean {
    return Boolean(list[logical]?.disabled);
  }

  // --- DOM 引用 ---
  let listOuterEl = $state<HTMLElement | null>(null); // wheel: 滚动容器

  // 当前落定的虚拟 index（用于高亮 -item-selected）。
  let currentVIndex = $state(untrack(() => toVirtual(selectedIndex)));
  const currentLogical = $derived(toLogical(currentVIndex));

  // 命令式控制变量（非 $state）。
  let suppressSelect = false; // 程序化滚动时抑制 scroll 落定
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let rafId = 0;

  function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function cancelAnim(): void {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  // 把某虚拟 index 居中所需 scrollTop（对齐 Semi scrollToNode，含 ul :before 顶部空白）。
  function offsetForV(virtual: number): number {
    return centerOffset(virtual, ITEM_HEIGHT, wheelHeight, TOP_PADDING);
  }

  // 缓动滚动到目标 scrollTop（对齐 Semi scrollTo.ts）。duration=0 或 reduced-motion 直达。
  function animateScrollTo(el: HTMLElement, to: number, duration: number): void {
    cancelAnim();
    if (duration <= 0 || !motion || prefersReducedMotion()) {
      el.scrollTop = to;
      return;
    }
    const from = el.scrollTop;
    if (from === to) return;
    let start = performance.now();
    const tick = (now: number): void => {
      const elapsed = now - start;
      el.scrollTop = scrollFrame(from, to, elapsed, duration);
      if (elapsed >= duration) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  // 程序化滚动到虚拟 index 居中（wheel）。
  function scrollToV(virtual: number, duration: number): void {
    const el = listOuterEl;
    if (!el) return;
    suppressSelect = true;
    animateScrollTo(el, offsetForV(virtual), duration);
  }

  // 构造 onSelect 载荷（对齐 Semi notifySelectItem：展开 item + value + type + index）。
  // type 仅在传入时才带上（exactOptionalPropertyTypes：不显式赋 undefined）。
  function selectPayload(item: ScrollItemData, logical: number): ScrollItemSelectPayload {
    return {
      ...item,
      value: item.value,
      index: logical,
      ...(type !== undefined ? { type } : {}),
    };
  }

  // 提交选中（虚拟 index → 逻辑）：更新高亮 + onSelect（对齐 Semi selectNode/notifySelectItem）。
  function commitV(virtual: number, notify: boolean): void {
    const logical = toLogical(virtual);
    const item = list[logical];
    if (!item || item.disabled) return;
    const changed = logical !== currentLogical;
    currentVIndex = virtual;
    if (notify && changed) {
      onSelect?.(selectPayload(item, logical));
    }
  }

  // cycled：落定后若滚出安全中段则无动画重定位（等价 Semi adjustInfiniteList）。
  function maybeRecenter(virtual: number): void {
    if (!isCyclic) return;
    const total = virtualCount;
    // 安全区 [count, total-count)。
    if (virtual >= count && virtual < total - count) return;
    const mid = Math.floor(REPEAT / 2);
    const re = mid * count + wrapIndex(virtual, count);
    requestAnimationFrame(() => {
      const el = listOuterEl;
      if (!el) return;
      suppressSelect = true;
      el.scrollTop = offsetForV(re);
      currentVIndex = re;
    });
  }

  // wheel scroll 落定：中线找最近非禁用节点 → 吸附居中 + 选中（对齐 getNearestNodeInfo + debouncedSelect）。
  function settle(): void {
    const el = listOuterEl;
    if (!el) return;
    const nearest = nearestIndex(
      el.scrollTop,
      ITEM_HEIGHT,
      wheelHeight,
      virtualCount,
      (v) => isDisabledLogical(toLogical(v)),
      TOP_PADDING,
    );
    if (nearest < 0) return;
    scrollToV(nearest, SCROLL_LIST_DEFAULT_SCROLL_DURATION);
    commitV(nearest, true);
    maybeRecenter(nearest);
  }

  // --- wheel scroll 监听（命令式 + debounce 落定）---
  $effect(() => {
    if (!isWheel) return;
    const el = listOuterEl;
    if (!el) return;

    function onScroll(): void {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (suppressSelect) {
          suppressSelect = false;
          return;
        }
        if (rafId) return; // 缓动中不抢落定
        settle();
      }, (1000 / 60) * 2);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (settleTimer) clearTimeout(settleTimer);
    };
  });

  // --- 测量 list-outer 实际高度（对齐 Semi 读 wrapper.offsetHeight；支持 bodyHeight 收窄）---
  $effect(() => {
    if (!isWheel) return;
    const el = listOuterEl;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = (): void => {
      const h = el.clientHeight;
      if (h > 0 && h !== wheelHeight) wheelHeight = h;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  });

  // --- 初始定位（wheel：滚到 selectedIndex 居中）---
  $effect(() => {
    if (!isWheel) return;
    const el = listOuterEl;
    if (!el) return;
    // 依赖 wheelHeight：实测高度变化后重新居中定位。
    void wheelHeight;
    untrack(() => {
      const initV = toVirtual(selectedIndex);
      suppressSelect = true;
      el.scrollTop = offsetForV(initV);
      currentVIndex = initV;
    });
  });

  // --- selectedIndex 受控变化 → 缓动滚动（对齐 Semi componentDidUpdate）---
  let lastSelectedIndex = untrack(() => selectedIndex);
  $effect(() => {
    const si = selectedIndex;
    if (!isWheel) {
      lastSelectedIndex = si;
      return;
    }
    const el = listOuterEl;
    if (!el) return;
    untrack(() => {
      if (si === lastSelectedIndex) return;
      lastSelectedIndex = si;
      if (rafId) return;
      const targetV = toVirtual(si);
      scrollToV(targetV, SCROLL_LIST_DEFAULT_SCROLL_DURATION);
      currentVIndex = targetV;
    });
  });

  // --- wheel 点击选中（点非居中项 → 吸附居中 + 选中，对齐 clickToSelectItem）---
  function onWheelItemClick(virtual: number): void {
    const item = list[toLogical(virtual)];
    if (!item || item.disabled) return;
    cancelAnim();
    scrollToV(virtual, SCROLL_LIST_DEFAULT_SCROLL_DURATION);
    commitV(virtual, true);
    maybeRecenter(virtual);
  }

  // --- normal 点击选中（对齐 Semi selectIndex）---
  function onNormalItemClick(logical: number): void {
    const item = list[logical];
    if (!item || item.disabled) return;
    currentVIndex = logical;
    onSelect?.(selectPayload(item, logical));
  }

  const outerCls = $derived(
    ['cd-scrolllist-list-outer', !cycled && 'cd-scrolllist-list-outer-nocycle']
      .filter(Boolean)
      .join(' '),
  );
  const wheelCls = $derived(['cd-scrolllist-item-wheel', className].filter(Boolean).join(' '));
  const normalCls = $derived(['cd-scrolllist-item', className].filter(Boolean).join(' '));

  function itemText(item: ScrollItemData, selected: boolean): string {
    return resolveItemText(item, selected, transform);
  }
</script>

{#if isWheel}
  <!-- wheel 模式：shade + selector + list-outer（滚动）> ul > li。对齐 Semi renderInfiniteList。 -->
  <div class={wheelCls} {style}>
    <div class="cd-scrolllist-shade cd-scrolllist-shade-pre" aria-hidden="true"></div>
    <div class="cd-scrolllist-selector" aria-hidden="true"></div>
    <div class="cd-scrolllist-shade cd-scrolllist-shade-post" aria-hidden="true"></div>
    <div class={outerCls} bind:this={listOuterEl} style="--cd-sl-top-pad: {TOP_PADDING}px">
      <ul role="listbox" aria-multiselectable="false" aria-label={ariaLabel}>
        {#each rendered as row (row.v)}
          {@const selected = row.logical === currentLogical}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            role="option"
            class:cd-scrolllist-item-selected={selected}
            class:cd-scrolllist-item-disabled={row.item.disabled}
            aria-selected={selected}
            aria-disabled={row.item.disabled || undefined}
            onclick={() => onWheelItemClick(row.v)}
          >
            {itemText(row.item, selected)}
          </li>
        {/each}
      </ul>
    </div>
  </div>
{:else}
  <!-- normal 模式：item（滚动）> ul > li，点击选中。对齐 Semi renderNormalList。 -->
  <div class={normalCls} {style}>
    <ul role="listbox" aria-multiselectable="false" aria-label={ariaLabel}>
      {#each list as item, index (index)}
        {@const selected = selectedIndex === index}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          role="option"
          class:cd-scrolllist-item-sel={selected}
          class:cd-scrolllist-item-disabled={item.disabled}
          aria-selected={selected}
          aria-disabled={item.disabled || undefined}
          onclick={() => onNormalItemClick(index)}
        >
          {itemText(item, selected)}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  /* 对齐 Semi scrollList.scss `.#{$module}-body` 内 item 部分。 */

  /* normal: -item */
  .cd-scrolllist-item {
    position: relative;
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .cd-scrolllist-item::-webkit-scrollbar {
    display: none;
  }
  .cd-scrolllist-item:not(:last-child) {
    border-inline-end: var(--cd-width-scroll-list-item-border) solid var(--cd-color-scroll-list-border);
  }

  /* wheel: -item-wheel */
  .cd-scrolllist-item-wheel {
    position: relative;
    flex: 1;
    overflow: hidden;
  }
  .cd-scrolllist-item-wheel:not(:last-child) {
    border-inline-end: var(--cd-width-scroll-list-item-wheel-border) solid var(--cd-color-scroll-list-border);
  }
  .cd-scrolllist-item-wheel .cd-scrolllist-item-selected {
    font-weight: var(--cd-font-scroll-list-item-wheel-item-selected-fontweight);
    color: var(--cd-color-primary) !important;
  }

  /* list-outer（wheel 滚动容器）*/
  .cd-scrolllist-list-outer {
    overflow-x: hidden;
    overflow-y: auto;
    block-size: 100%;
    inline-size: 100%;
    padding-inline-end: var(--cd-spacing-scroll-list-item-wheel-list-outer-paddingright);
    scrollbar-width: none;
  }
  .cd-scrolllist-list-outer::-webkit-scrollbar {
    display: none;
  }

  /* shade（wheel 上下渐隐遮罩）*/
  .cd-scrolllist-shade {
    inline-size: 100%;
    block-size: 50%;
    pointer-events: none;
    position: absolute;
  }
  .cd-scrolllist-shade-pre {
    inset-block-start: 0;
    margin-block-start: var(--cd-spacing-scroll-list-item-wheel-list-shade-pre-margintop);
    background: var(--cd-color-scroll-list-bg);
    opacity: 0.5;
  }
  .cd-scrolllist-shade-post {
    inset-block-start: 50%;
    margin-block-start: var(--cd-spacing-scroll-list-item-wheel-list-shade-post-margintop);
    background: var(--cd-color-scroll-list-bg);
    opacity: 0.5;
  }

  /* selector（wheel 中线选区）*/
  .cd-scrolllist-selector {
    pointer-events: none;
    position: absolute;
    inset-block-start: 50%;
    border-block-start: var(--cd-width-scroll-list-item-wheel-selector-border) solid var(--cd-color-scroll-list-border);
    border-block-end: var(--cd-width-scroll-list-item-wheel-selector-border) solid var(--cd-color-scroll-list-border);
    block-size: var(--cd-height-scroll-list-item);
    inline-size: 100%;
    transform: translateY(-50%);
  }

  /* ul（对齐 Semi item / list-outer 下的 ul）*/
  .cd-scrolllist-item > ul,
  .cd-scrolllist-list-outer > ul {
    box-sizing: border-box;
    inline-size: 100%;
    margin: var(--cd-spacing-scroll-list-item-ul-margin);
    padding: var(--cd-spacing-scroll-list-item-ul-padding);
    list-style: none;
  }
  /* normal：底部 padding 固定（对齐 Semi ul-paddingBottom），顶部 :before 固定空白居中首项 */
  .cd-scrolllist-item > ul {
    padding-block-end: var(--cd-spacing-scroll-list-item-ul-paddingbottom);
  }
  .cd-scrolllist-item > ul::before {
    content: '';
    display: block;
    inline-size: 100%;
    block-size: calc((var(--cd-height-scroll-list) - var(--cd-height-scroll-list-item)) * 0.5);
  }
  /* nocycle wheel：上下留白按实测高度自适应（--cd-sl-top-pad = (wheelHeight - itemHeight)/2），
     支持 bodyHeight 收窄；cycled wheel 铺满不需要留白。 */
  .cd-scrolllist-list-outer-nocycle > ul {
    padding-block-end: var(--cd-sl-top-pad);
  }
  .cd-scrolllist-list-outer-nocycle > ul::before {
    content: '';
    display: block;
    inline-size: 100%;
    block-size: var(--cd-sl-top-pad);
  }

  /* li（对齐 Semi item li）*/
  .cd-scrolllist-item > ul > li,
  .cd-scrolllist-list-outer > ul > li {
    list-style: none;
    block-size: var(--cd-height-scroll-list-item);
    box-sizing: border-box;
    color: var(--cd-color-scroll-list-item-text);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: var(--cd-color-scroll-list-item-bg);
    transition: background-color var(--cd-transition-duration-scroll-list-selected-item-bg)
      var(--cd-transition-function-scroll-list-selected-item-bg)
      var(--cd-transition-delay-scroll-list-selected-item-bg);
  }
  /* normal 选中态 -item-sel（含选中图标 svg 钩子）*/
  .cd-scrolllist-item > ul > li.cd-scrolllist-item-sel,
  .cd-scrolllist-list-outer > ul > li.cd-scrolllist-item-sel {
    background: var(--cd-color-scroll-list-selected-item-bg);
    color: var(--cd-color-scroll-list-selected-item-text);
  }
  .cd-scrolllist-item > ul > li.cd-scrolllist-item-sel > :global(svg),
  .cd-scrolllist-list-outer > ul > li.cd-scrolllist-item-sel > :global(svg) {
    color: var(--cd-color-scroll-list-selected-item-icon);
    inline-size: var(--cd-width-scroll-list-item-sel-svg);
    block-size: var(--cd-width-scroll-list-item-sel-svg);
    margin-inline-end: var(--cd-spacing-scroll-list-item-sel-svg-marginright);
  }
  /* hover / active（非禁用、非选中）*/
  .cd-scrolllist-item > ul > li:not(.cd-scrolllist-item-disabled):not(.cd-scrolllist-item-sel):not(.cd-scrolllist-item-selected):hover,
  .cd-scrolllist-list-outer > ul > li:not(.cd-scrolllist-item-disabled):not(.cd-scrolllist-item-sel):not(.cd-scrolllist-item-selected):hover {
    background-color: var(--cd-color-scroll-list-item-text-hover);
  }
  .cd-scrolllist-item > ul > li:not(.cd-scrolllist-item-disabled):not(.cd-scrolllist-item-sel):not(.cd-scrolllist-item-selected):active,
  .cd-scrolllist-list-outer > ul > li:not(.cd-scrolllist-item-disabled):not(.cd-scrolllist-item-sel):not(.cd-scrolllist-item-selected):active {
    background-color: var(--cd-color-scroll-list-item-bg-active);
  }
  /* disabled */
  .cd-scrolllist-item > ul > li.cd-scrolllist-item-disabled,
  .cd-scrolllist-list-outer > ul > li.cd-scrolllist-item-disabled {
    color: var(--cd-color-scroll-list-disabled-item-text);
    cursor: not-allowed;
  }
</style>
