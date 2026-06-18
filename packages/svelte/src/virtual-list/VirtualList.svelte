<!--
  VirtualList — see specs/components/show/VirtualList.spec.md
  基础子集：fixed 定高 + vertical + overscan + 内部容器滚动（scrollTarget='self'）。
  TODO(延后):
    - dynamic 不定高测量（估算高度 + ResizeObserver 实测回填 + 偏移补偿）
    - horizontal 横向虚拟化
    - scrollTarget='window' / 外层容器宿主
    - paddingStart 顶部留白
    - scrollToIndex / scrollToKey 命令式 API + 对齐方式

  ⚠️ 死循环红线：
    - 滚动监听用 $effect 内命令式 addEventListener('scroll', ..., {passive:true})
      + rAF 节流，cleanup 时 removeEventListener + cancelAnimationFrame。
    - scrollTop 仅在 scroll 回调（非 render 期）写入本地 $state。
    - 可视区计算全部基于本地 $state（scrollTop/viewportH）的纯 $derived，render 期不读 DOM。
    - 高度测量（仅 height 为字符串时）用 ResizeObserver，在 $effect 内创建 + disconnect。
    - 绝不使用响应式 attachment 读取 DOM 几何。
-->
<script lang="ts" generics="T">
  // 泛型组件 props 用内联匿名类型而非具名 interface Props：在 declaration:true 下，
  // 引用泛型参数 T 的具名 interface 会被当作私有名泄漏进生成的 .d.ts 公共签名而报错。
  import type { Snippet } from 'svelte';

  let {
    data = [],
    getKey = (_item: T, index: number) => index,
    itemSize = 40,
    overscan = 3,
    height = 400,
    renderItem,
    class: className = '',
  }: {
    data?: T[];
    getKey?: (item: T, index: number) => string | number;
    itemSize?: number;
    overscan?: number;
    height?: number | string;
    renderItem: Snippet<[item: T, index: number]>;
    class?: string;
  } = $props();

  // viewport 元素普通引用（bind:this），不参与响应式几何读取。
  let viewportEl = $state<HTMLDivElement | null>(null);

  // 本地响应式状态：仅由命令式回调 / ResizeObserver 写入，render 期只读。
  let scrollTop = $state(0);
  // 测量得到的视口高度（仅 height 为字符串时由 ResizeObserver 回填）。
  let measuredH = $state(0);
  // 有效视口高度：height 为数字时直接用 prop，否则用测量值（纯 $derived）。
  const viewportH = $derived(typeof height === 'number' ? height : measuredH);

  // 普通（非响应式）变量：rAF 节流句柄。
  let rafId = 0;

  const heightStyle = $derived(typeof height === 'number' ? `${height}px` : height);

  // 总撑高占位。fixed 定高下为 O(1)。
  const totalHeight = $derived(data.length * itemSize);

  // 可视区间：纯 $derived，仅依赖本地 $state，render-safe（不读 DOM）。
  const startIndex = $derived(
    Math.max(0, Math.floor(scrollTop / itemSize) - overscan),
  );
  const endIndex = $derived(
    Math.min(
      data.length,
      Math.ceil((scrollTop + viewportH) / itemSize) + overscan,
    ),
  );
  const visible = $derived(data.slice(startIndex, endIndex));

  // 滚动监听（命令式 + rAF 节流 + cleanup）。
  $effect(() => {
    const el = viewportEl;
    if (!el) return;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        // scrollTop 读取发生在回调中（非 render 期）。
        if (el) scrollTop = el.scrollTop;
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

    // 立即测一次（命令式，非 render 期）。
    measuredH = el.clientHeight;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        measuredH = entry.contentRect.height;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  const cls = $derived(['cd-virtual-list', className].filter(Boolean).join(' '));
</script>

<div
  class={cls}
  bind:this={viewportEl}
  role="list"
  style="block-size:{heightStyle}; overflow:auto"
>
  <div class="cd-virtual-list__spacer" style="block-size:{totalHeight}px">
    {#each visible as item, i (getKey(item, startIndex + i))}
      <div
        class="cd-virtual-list__item"
        role="listitem"
        aria-setsize={data.length}
        aria-posinset={startIndex + i + 1}
        style="transform:translateY({(startIndex + i) * itemSize}px); block-size:{itemSize}px"
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
</style>
