<!--
  ScrollItem — 严格对齐 Semi Design（semi-ui/scrollList/scrollItem.tsx）。
  一列滚动选择：mode='wheel'（滚轮，中线吸附居中）| 'normal'（普通列表，点击选中）。

  对齐要点：
  - DOM/class 镜像 Semi：wheel → -item-wheel > -shade-pre/-selector/-shade-post/-list-outer>ul>li；
    normal → -item > ul>li（选中 li 加 -item-sel）。
  - wheel 滚动落定：找选区中线最近的非禁用节点 → 吸附居中 + 加 -item-selected 类 + onSelect。
  - cycled（仅 wheel）：渲染 prepend+基准+append 份（份数对齐 Semi），滚动中环绕平移 scrollTop 维持
    上下缓冲（等价 Semi adjustInfiniteList 的 prepend/append 节点搬移净效果，DOM 节点数守恒）。
  - selectedIndex 受控变化 → 缓动滚动到该项居中（motion=true 用 rAF 线性缓动，对齐 semi-animation；false 直达）。
  - transform：选中项文案变换（item.transform 优先于公共 transform，对齐 Semi renderItemList）。
  - onSelect 载荷 {...item, value, type, index}（对齐 Semi notifySelectItem）。
  所有 scroll/rAF 监听命令式 + cleanup；纯几何/文案复用 @chenzy-design/core。
-->
<script lang="ts">
  import { untrack, tick } from 'svelte';
  import {
    resolveItemText,
    centerOffset,
    nearestIndex,
    wrapIndex,
    scrollFrame,
    shouldPrepend,
    shouldAppend,
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
  // 仅 nocycle wheel 的 ul 有此 :before（见样式 `-nocycle > ul::before`）；cycled ul 铺满、无顶部空白。
  const TOP_PADDING = $derived((wheelHeight - ITEM_HEIGHT) / 2);

  // 几何基线：nocycle 首项 offsetTop = TOP_PADDING；cycled 首项 offsetTop = 0（ul 无 :before）。
  // centerOffset / nearestIndex 必须用与真实 DOM 一致的基线，否则 cycled 落定永远差半格、不吸附。
  const GEOM_TOP_PADDING = $derived(isCyclic ? 0 : TOP_PADDING);

  // cycled 头/尾补的「份数」（对齐 Semi state.prependCount / appendCount，决定 DOM 节点数）。渲染 =
  // prepend 份 + 基准 1 份 + append 份，init 用 shouldPrepend/Append(ratio=2) 定值（节点数与 Semi 一致）。
  // 每份都是完整 list 循环 → 无限滚动靠 adjustInfiniteList 环绕平移 scrollTop（内容循环、视觉无感），
  // 无需运行时增删份，故 prependCount/appendCount 定后不变（对齐 Semi 总节点数守恒的净效果）。
  let prependCount = $state(0);
  let appendCount = $state(0);
  const parts = $derived(isCyclic ? prependCount + 1 + appendCount : 1);
  const virtualCount = $derived(isCyclic ? count * parts : count);

  // 逻辑 index ↔ 虚拟 index。每份都是完整 list 顺序 → 逻辑 = wrapIndex(virtual, count)（与 scrollTop
  // 无关，环绕平移不影响此映射）。基准份（对齐 selectedIndex 的那份）起点虚拟 index = prependCount*count。
  function toVirtual(logical: number): number {
    if (!isCyclic || count <= 0) return logical;
    return prependCount * count + wrapIndex(logical, count);
  }
  function toLogical(virtual: number): number {
    return isCyclic ? wrapIndex(virtual, count) : virtual;
  }

  // 渲染行（虚拟）：cycled 铺 parts 份，否则原 list。
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
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let rafId = 0;
  let animTarget = Number.NaN; // 进行中吸附动画的目标 scrollTop（用于避免同目标重启）
  let adjustThrottled = false; // cycled 重定位的 rAF 节流闸（对齐 Semi throttledAdjustList）

  function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function cancelAnim(): void {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    animTarget = Number.NaN;
  }

  // 把某虚拟 index 居中所需 scrollTop（对齐 Semi scrollToNode）。
  // 基线用 GEOM_TOP_PADDING：cycled ul 无 :before → 0；nocycle → TOP_PADDING。
  function offsetForV(virtual: number): number {
    return centerOffset(virtual, ITEM_HEIGHT, wheelHeight, GEOM_TOP_PADDING);
  }

  // 缓动滚动到目标 scrollTop（照搬 Semi scrollTo.ts：线性 from→to over duration=120ms）。
  // duration=0 / motion=false / reduced-motion 直达。曲线为线性（见 core scrollFrame 注释）。
  function animateScrollTo(el: HTMLElement, to: number, duration: number): void {
    // 进行中动画的目标与新目标一致 → 不重启，让原动画自然跑完（对齐 Semi scrollTop===targetTop
    // 的稳定性：吸附动画途中掉帧触发的二次 settle 会算出同一 target，不该打断/重置动画进度）。
    if (rafId && Math.abs(animTarget - to) < 0.5) return;
    cancelAnim();
    // duration=0 / motion=false / reduced-motion / 页面不可见（rAF 被浏览器节流挂起，动画会卡在
    // 半途）→ 直接落定，保证吸附始终精确到位。
    const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    if (duration <= 0 || !motion || prefersReducedMotion() || hidden) {
      el.scrollTop = to;
      return;
    }
    const from = el.scrollTop;
    // 已到位（含浮点/亚像素误差）直接落定，避免无谓 rAF 与来回抖动。
    if (Math.abs(from - to) < 0.5) {
      el.scrollTop = to;
      return;
    }
    animTarget = to;
    const start = performance.now();
    const tick = (now: number): void => {
      const elapsed = now - start;
      el.scrollTop = scrollFrame(from, to, elapsed, duration);
      if (elapsed >= duration) {
        rafId = 0;
        animTarget = Number.NaN;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  // 程序化滚动到虚拟 index 居中（wheel）。落定是幂等的：若已居中，animateScrollTo 直接返回，
  // 后续 scroll→settle 也只会算出同一 nearest、同一 offset，不产生抖动或重复 notify。
  function scrollToV(virtual: number, duration: number): void {
    const el = listOuterEl;
    if (!el) return;
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

  // cycled 无缝无限滚动（对齐 Semi adjustInfiniteList 的净效果）：滚动中读首/尾 li 相对视窗的位置，
  // 用 shouldPrepend/shouldAppend(ratio=1) 判断上/下缓冲是否不足（各需再补几份）。因每份都是完整
  // list 循环，补份等价于「环绕平移」：上缓冲不足 → scrollTop += k*listHeight（内容相对下移、上方露出
  // 更多循环份）；下缓冲不足 → scrollTop -= k*listHeight。平移量是 listHeight 的整数倍 → 视觉完全
  // 无感、无露白（已 Node 逐步滚动实测两侧缓冲恒 >= wheelHeight）。currentVIndex 同步平移保持高亮。
  function adjustInfiniteList(): void {
    if (!isCyclic) return;
    const el = listOuterEl;
    if (!el) return;
    const listHeight = count * ITEM_HEIGHT;
    if (listHeight <= 0) return;
    // 首/尾 li 顶相对视窗顶的偏移（相对坐标，wrapperTop=0）。首份起点 = ul 顶 = -scrollTop
    // （cycled ul 无 :before）；尾份最后一项顶 = 首 + (virtualCount-1)*ITEM_HEIGHT。
    const firstTop = -el.scrollTop;
    const lastTop = firstTop + (virtualCount - 1) * ITEM_HEIGHT;
    const needPrepend = shouldPrepend(firstTop, count, ITEM_HEIGHT, wheelHeight, 1);
    const needAppend = shouldAppend(lastTop, count, ITEM_HEIGHT, wheelHeight, 1);
    if (needPrepend > 0) {
      el.scrollTop += needPrepend * listHeight;
      currentVIndex += needPrepend * count;
    } else if (needAppend > 0) {
      el.scrollTop -= needAppend * listHeight;
      currentVIndex -= needAppend * count;
    }
  }

  // wheel scroll 落定（照搬 Semi debouncedSelect→selectNode）：中线找最近非禁用节点 →
  // scrollToCenter 吸附居中 + notify。幂等交给 scrollToPos/animateScrollTo（scrollTop≈target 即跳过）。
  function settle(): void {
    const el = listOuterEl;
    if (!el) return;
    const nearest = nearestIndex(
      el.scrollTop,
      ITEM_HEIGHT,
      wheelHeight,
      virtualCount,
      (v) => isDisabledLogical(toLogical(v)),
      GEOM_TOP_PADDING,
    );
    if (nearest < 0) return;
    scrollToV(nearest, SCROLL_LIST_DEFAULT_SCROLL_DURATION);
    commitV(nearest, true);
  }

  // --- wheel scroll 监听（照搬 Semi scrollToSelectItem：throttled adjust + debounced select）---
  $effect(() => {
    if (!isWheel) return;
    const el = listOuterEl;
    if (!el) return;

    function onScroll(): void {
      // throttle：滚动过程中持续维持 cycled 缓冲（对齐 Semi throttledAdjustList，每帧 ~16ms）。
      if (!adjustThrottled) {
        adjustThrottled = true;
        requestAnimationFrame(() => {
          adjustThrottled = false;
          adjustInfiniteList();
        });
      }
      // debounce：滚动停顿 ~33ms 后吸附落定（对齐 Semi debouncedSelect，msPerFrame*2）。
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, (1000 / 60) * 2);
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
    // cycled：先按 Semi initWheelList(ratio=2) 定初始 prepend/append 份数——设想「基准份 selected
    // 居中」的布局，算首/尾项相对视窗的位置，求头尾各需补多少份填满 2× 视窗缓冲。改份数会触发 ul
    // 重渲染出 parts 份，必须 await tick() 等 DOM 扩展后再设 scrollTop，否则容器 scrollHeight 仍是
    // 单份高、offsetForV 的目标被 clamp（导致 cycled 首屏不居中、中线偏半格）。
    let cancelled = false;
    void untrack(async () => {
      if (isCyclic && count > 0) {
        const baseFirstTop = (wheelHeight - ITEM_HEIGHT) / 2 - selectedIndex * ITEM_HEIGHT;
        const baseLastTop = baseFirstTop + (count - 1) * ITEM_HEIGHT;
        prependCount = shouldPrepend(baseFirstTop, count, ITEM_HEIGHT, wheelHeight, 2);
        appendCount = shouldAppend(baseLastTop, count, ITEM_HEIGHT, wheelHeight, 2);
        await tick();
        if (cancelled) return;
      }
      const initV = toVirtual(selectedIndex);
      el.scrollTop = offsetForV(initV);
      currentVIndex = initV;
    });
    return () => {
      cancelled = true;
    };
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
    // 点击落点若冲出安全中段，随后由吸附动画触发的 scroll→adjustInfiniteList 会重定位维持缓冲。
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
