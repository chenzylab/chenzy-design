<!--
  VirtualList — see specs/components/show/VirtualList.spec.md
  子集：vertical + overscan + 内部容器滚动（scrollTarget='self'）。
    - fixed 定高：itemSize 为 number（默认）。区间 O(1)。
    - dynamic 不定高：itemSize='auto'（或不传 itemSize 时用 estimatedItemSize 估算）。
      用 estimatedItemSize 估算初始高度/总高，渲染后 ResizeObserver 实测每项真实高度，
      缓存到 heights 表，据此（前缀和 offsets）修正各项偏移与可视区间；
      实测与估算不同导致当前可视项偏移变化时做偏移补偿，滚动不跳动。
  horizontal: 横向虚拟化沿 x 轴——itemSize 作列宽、横向排列、读/写 scrollLeft、
    可视区间按宽度算；方向无关的 core 区间纯函数（fixedRange/buildOffsets/…）直接复用，
    仅把 height→width、scrollTop→scrollLeft 抽象。horizontal 仅支持 fixed 定宽
    （dynamic+horizontal 暂不支持：dynamic 用 itemSize='auto'，与 horizontal 组合时
    退化为 fixed，按 estimatedItemSize 列宽渲染——见下方 dynamic 判定）。
  scrollToIndex(index, opts?): 命令式 API——根据该 index 的 offset（fixed 用
    index*itemSize；dynamic 用 offsets 前缀和）+ align 计算目标滚动位置，直接写
    滚动容器 scrollTop（horizontal 则 scrollLeft）。放导出函数（非 render），属命令式 DOM 写。
  TODO(延后): scrollTarget='window'。

  ⚠️ 死循环红线：
    - 滚动监听用 $effect 内命令式 addEventListener('scroll', ..., {passive:true})
      + rAF 节流，cleanup 时 removeEventListener + cancelAnimationFrame。
    - 几何测量（视口高度 + dynamic 行高）一律 ResizeObserver / getBoundingClientRect，
      在 $effect 内创建 observer + 绑定，cleanup 里 disconnect。绝不用响应式 attachment。
    - 测量结果写入本地 $state（measuredH / heights），render 期只读派生；
      render 不触发新测量、不读 effect 写的状态形成新一轮测量循环。
    - 受控 prop（itemSize/estimatedItemSize/data…）不回写。
-->
<script lang="ts" generics="T">
  // 泛型组件 props 用内联匿名类型而非具名 interface Props：在 declaration:true 下，
  // 引用泛型参数 T 的具名 interface 会被当作私有名泄漏进生成的 .d.ts 公共签名而报错。
  import type { Snippet } from 'svelte';
  import {
    fixedRange,
    buildOffsets,
    totalFromOffsets,
    dynamicRange,
    scrollOffsetForIndex,
    type ScrollAlign,
  } from '@chenzy-design/core';

  let {
    data = [],
    getKey = (_item: T, index: number) => index,
    itemSize = 40,
    estimatedItemSize = 40,
    overscan = 3,
    height = 400,
    horizontal = false,
    renderItem,
    class: className = '',
  }: {
    data?: T[];
    getKey?: (item: T, index: number) => string | number;
    /** 固定行高/列宽（px）；传 'auto' 启用 dynamic 不定高测量（horizontal 暂不支持 dynamic）。 */
    itemSize?: number | 'auto';
    /** dynamic 模式初始估算行高（px），用于首屏占位与总高估算。 */
    estimatedItemSize?: number;
    overscan?: number;
    /** 视口主轴尺寸（vertical 为高度、horizontal 为宽度）；数字按 px，字符串用 ResizeObserver 测量。 */
    height?: number | string;
    /** 横向虚拟化：沿 x 轴排列、读/写 scrollLeft。默认 false（vertical）。 */
    horizontal?: boolean;
    renderItem: Snippet<[item: T, index: number]>;
    class?: string;
  } = $props();

  // dynamic 模式判定：itemSize='auto'。horizontal 暂不支持 dynamic，强制走 fixed。
  const dynamic = $derived(itemSize === 'auto' && !horizontal);
  // fixed 路径行高（dynamic 时该值不参与几何）。
  const fixedSize = $derived(typeof itemSize === 'number' ? itemSize : estimatedItemSize);

  // viewport 元素普通引用（bind:this），不参与响应式几何读取。
  let viewportEl = $state<HTMLDivElement | null>(null);

  // 本地响应式状态：仅由命令式回调 / ResizeObserver 写入，render 期只读。
  // 主轴滚动偏移：vertical 为 scrollTop、horizontal 为 scrollLeft（方向无关命名沿用 scrollTop）。
  let scrollTop = $state(0);
  // 测量得到的视口主轴尺寸（仅 height 为字符串时由 ResizeObserver 回填）。
  let measuredH = $state(0);
  // 有效视口主轴尺寸：height 为数字时直接用 prop，否则用测量值（纯 $derived）。
  const viewportH = $derived(typeof height === 'number' ? height : measuredH);

  // dynamic：实测行高缓存表。索引 → 真实高度（px）；未测得为 undefined（用估算）。
  // 普通对象 $state，由 ResizeObserver 命令式写入；render 期只读。
  let heights = $state<Record<number, number>>({});

  // 普通（非响应式）变量：rAF 节流句柄。
  let rafId = 0;

  const heightStyle = $derived(typeof height === 'number' ? `${height}px` : height);

  // dynamic：合并实测/估算的每项高度数组 → 前缀和 offsets（render-safe，仅依赖 $state）。
  const offsets = $derived.by(() => {
    if (!dynamic) return [] as number[];
    const arr = new Array<number>(data.length);
    for (let i = 0; i < data.length; i += 1) {
      arr[i] = heights[i] ?? estimatedItemSize;
    }
    return buildOffsets(arr);
  });

  // 总撑高占位。fixed 为 O(1)；dynamic 取 offsets 末项（估算+实测混合）。
  const totalHeight = $derived(
    dynamic ? totalFromOffsets(offsets) : data.length * fixedSize,
  );

  // 可视区间：纯 $derived，仅依赖本地 $state，render-safe（不读 DOM）。
  const range = $derived(
    dynamic
      ? dynamicRange(offsets, scrollTop, viewportH, overscan)
      : fixedRange(scrollTop, viewportH, fixedSize, data.length, overscan),
  );
  const startIndex = $derived(range.startIndex);
  const endIndex = $derived(range.endIndex);
  const visible = $derived(data.slice(startIndex, endIndex));

  // 某项的主轴偏移：fixed 为 index*size；dynamic 查 offsets 前缀和。
  function itemOffset(index: number): number {
    if (dynamic) return offsets[index] ?? index * estimatedItemSize;
    return index * fixedSize;
  }

  // 某项的主轴尺寸：dynamic 查实测/估算高度；fixed 为定尺寸。
  function itemMainSize(index: number): number {
    if (dynamic) return heights[index] ?? estimatedItemSize;
    return fixedSize;
  }

  /**
   * 命令式滚动到指定索引项（红线 #3：直接写 DOM scrollTop/scrollLeft 的命令式操作，
   * 不在 render 期执行，由父组件 bind 后主动调用）。
   * @param index 目标索引（自动 clamp 到 [0, data.length - 1]）
   * @param opts.align 'start'（默认）| 'center' | 'end'：目标项在视口内的对齐方式
   */
  export function scrollToIndex(
    index: number,
    opts?: { align?: ScrollAlign },
  ): void {
    const el = viewportEl;
    if (!el || data.length === 0) return;
    const i = Math.max(0, Math.min(data.length - 1, Math.floor(index)));
    // 总主轴尺寸：dynamic 取 offsets 末项；fixed 为 count*size。
    const totalMain = dynamic ? totalFromOffsets(offsets) : data.length * fixedSize;
    const target = scrollOffsetForIndex(
      itemOffset(i),
      itemMainSize(i),
      // 视口主轴尺寸：优先读实时 DOM，回退派生值。
      horizontal ? el.clientWidth : el.clientHeight,
      totalMain,
      opts?.align ?? 'start',
    );
    if (horizontal) el.scrollLeft = target;
    else el.scrollTop = target;
    // 同步本地 state（DOM 滚动事件随后也会触发，这里立即更新避免一帧延迟）。
    scrollTop = target;
  }

  // 滚动监听（命令式 + rAF 节流 + cleanup）。
  $effect(() => {
    const el = viewportEl;
    if (!el) return;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        // 主轴滚动读取发生在回调中（非 render 期）；horizontal 读 scrollLeft。
        if (el) scrollTop = horizontal ? el.scrollLeft : el.scrollTop;
      });
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  });

  // 视口高度测量：仅当 height 非数字（字符串/百分比）时启用 ResizeObserver。
  $effect(() => {
    const el = viewportEl;
    if (!el || typeof height === 'number') return;

    // 立即测一次主轴尺寸（命令式，非 render 期）；horizontal 测 clientWidth。
    measuredH = horizontal ? el.clientWidth : el.clientHeight;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        measuredH = horizontal ? entry.contentRect.width : entry.contentRect.height;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // dynamic 行高实测 + 偏移补偿（命令式 ResizeObserver，cleanup disconnect）。
  // 每个已渲染行元素带 data-vindex，observer 实测真实高度回写 heights；
  // 若变更的行位于当前滚动位置之上，则总高/偏移随之变化——补偿 scrollTop 保持视图稳定。
  $effect(() => {
    const el = viewportEl;
    if (!el || !dynamic) return;
    // 依赖 visible：渲染行集合变化（滚动/数据更新）后重建 observer，observe 新行。
    // 读取仅作依赖追踪，不在此读 DOM 几何。
    void visible;

    function measure(node: Element) {
      const idx = Number((node as HTMLElement).dataset.vindex);
      if (Number.isNaN(idx)) return;
      const h = (node as HTMLElement).getBoundingClientRect().height;
      if (h <= 0) return;
      const prev = heights[idx];
      if (prev !== undefined && Math.abs(prev - h) < 0.5) return;

      // 估算→实测差值；该行若在当前 scrollTop 之上，需补偿避免视图跳动。
      const before = prev ?? estimatedItemSize;
      const delta = h - before;
      heights[idx] = h;

      if (delta !== 0 && el && itemOffset(idx) < el.scrollTop) {
        // 命令式调整 scrollTop（非 render 期），下一帧 onScroll 会同步本地 state。
        el.scrollTop += delta;
        scrollTop = el.scrollTop;
      }
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) measure(entry.target);
    });

    // 命令式遍历当前已渲染行并 observe（render 期不读几何，这里在 effect 内）。
    const rows = el.querySelectorAll<HTMLElement>('[data-vindex]');
    rows.forEach((node) => {
      measure(node);
      ro.observe(node);
    });

    return () => ro.disconnect();
  });

  const cls = $derived(
    ['cd-virtual-list', horizontal && 'cd-virtual-list--horizontal', className]
      .filter(Boolean)
      .join(' '),
  );

  // 视口主轴尺寸样式：vertical 用高度（width 由 CSS 撑满）；horizontal 用宽度。
  const viewportStyle = $derived(
    horizontal ? `inline-size:${heightStyle}; overflow:auto` : `block-size:${heightStyle}; overflow:auto`,
  );
  // 撑高/撑宽占位主轴尺寸样式。
  const spacerStyle = $derived(
    horizontal ? `inline-size:${totalHeight}px` : `block-size:${totalHeight}px`,
  );

  // 每项主轴定位/尺寸样式（render 期只读派生，不触发测量）。
  function itemStyle(idx: number): string {
    const off = itemOffset(idx);
    if (horizontal) {
      // 横向：translateX 定位 + 列宽（fixed），高度撑满视口。
      return `transform:translateX(${off}px); inline-size:${fixedSize}px`;
    }
    if (dynamic) return `transform:translateY(${off}px)`;
    return `transform:translateY(${off}px); block-size:${fixedSize}px`;
  }
</script>

<div class={cls} bind:this={viewportEl} role="list" style={viewportStyle}>
  <div class="cd-virtual-list__spacer" style={spacerStyle}>
    {#each visible as item, i (getKey(item, startIndex + i))}
      <div
        class="cd-virtual-list__item"
        role="listitem"
        data-vindex={startIndex + i}
        aria-setsize={data.length}
        aria-posinset={startIndex + i + 1}
        style={itemStyle(startIndex + i)}
      >
        {@render renderItem(item, startIndex + i)}
      </div>
    {/each}
  </div>
</div>

<style>
  .cd-virtual-list {
    position: relative;
    inline-size: 100%;
    background: var(--cd-virtual-list-bg);
    scrollbar-color: var(--cd-virtual-list-scrollbar) transparent;
  }
  .cd-virtual-list__spacer {
    position: relative;
    inline-size: 100%;
  }
  .cd-virtual-list__item {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
  }
  /* horizontal：视口主轴为宽度（block-size 撑满父容器高度）；项沿 x 轴绝对定位、纵向撑满。 */
  .cd-virtual-list--horizontal {
    block-size: 100%;
  }
  .cd-virtual-list--horizontal .cd-virtual-list__spacer {
    block-size: 100%;
    inline-size: auto;
  }
  .cd-virtual-list--horizontal .cd-virtual-list__item {
    inset-block: 0;
    inset-inline-start: 0;
    inset-inline-end: auto;
  }
</style>
