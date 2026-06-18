<!--
  OverflowList — see specs/components/show/OverflowList.spec.md
  基础子集：collapse 折叠模式 + end 方向（尾部溢出收纳进 +N 折叠节点）。
  复用 @chenzy-design/core 收纳算法（computeVisibleCount / applyHysteresis）。
  TODO(延后):
    - scroll 模式（横向滚动而非折叠）
    - vertical 纵向方向
    - start 方向折叠（把头部溢出项收进折叠节点）
    - 命令式方法（forceMeasure / scrollTo 等）

  ⚠️ 三条死循环红线（本组件最易爆，严格遵守）：
    1. onOverflowChange 去重：只在 overflowCount/visibleCount 实际变化时调，
       用普通变量 prevReported* 记录上次值比较，避免重复触发。
    2. render 绝不读「effect/RO 写入的几何 $state」再触发循环：visibleCount 是
       $state，由 RO 回调 + rAF 计算后写入，render 读它渲染可见层——这是安全的单向流。
       绝对禁止：render 期读 measure layer 的 DOM 宽度、或用 $derived 读 getBoundingClientRect。
       测量只在命令式 RO 回调/effect 里做。
    3. ResizeObserver 必须命令式：$effect 内 new ResizeObserver、observe(rootEl)、
       cleanup disconnect。测量项宽度也命令式：在 measure() 里遍历 measure layer 子元素
       读 offsetWidth，算 itemSizes，调 computeVisibleCount，写 visibleCount $state。
       用 rAF 合批（RO 回调里 cancelAnimationFrame 上一个 + requestAnimationFrame(measure)），
       cleanup 里 cancelAnimationFrame + disconnect。

  关键防循环点：measure() 只由 RO（容器尺寸变）和 items 变（内容变）触发，
  绝不依赖 visibleCount。measure 读 DOM → 写 visibleCount $state → render 重渲可见层，
  但 render 不会回触发 measure（measure 不是 $derived、不在依赖 visibleCount 的 $effect 里），
  RO 只在容器真实尺寸变化时回调——故零循环。
-->
<script lang="ts" generics="T">
  // 泛型组件 props 用内联匿名类型而非具名 interface Props：在 declaration:true 下，
  // 引用泛型参数 T 的具名 interface 会被当作私有名泄漏进生成的 .d.ts 公共签名而报错。
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { computeVisibleCount, applyHysteresis } from '@chenzy-design/core';

  let {
    items = [],
    size = 'default',
    gap,
    minVisibleItems = 0,
    alwaysVisibleIndexes = [],
    threshold = 8,
    item,
    overflow,
    onOverflowChange,
    ariaLabel,
    class: className = '',
  }: {
    items?: T[];
    size?: 'small' | 'default' | 'large';
    gap?: number;
    minVisibleItems?: number;
    alwaysVisibleIndexes?: number[];
    threshold?: number;
    item?: Snippet<[{ item: T; index: number }]>;
    overflow?: Snippet<[{ overflowItems: T[]; overflowCount: number }]>;
    onOverflowChange?: (info: {
      overflowCount: number;
      visibleCount: number;
      overflowItems: T[];
    }) => void;
    ariaLabel?: string;
    class?: string;
  } = $props();

  // DOM 引用（bind:this），普通引用，不参与响应式几何读取。
  // containerEl = 最外层根容器（block，宽度随父）。RO 观测它，clientWidth 当 containerSize。
  // 内层可见层 .cd-overflow-list__visible 是 flex + overflow:hidden，其 border-box 不随父宽
  // 变化上报 RO（bug 根因），故几何测量改用根容器。
  let containerEl = $state<HTMLElement | null>(null); // 根容器，RO 观测对象 + containerSize 来源
  let measureEl = $state<HTMLElement | null>(null); // 离屏测量层容器

  // 几何 $state：仅由命令式 measure()（RO 回调 / effect）写入，render 期只读。
  // 初值全显（SSR / 首帧降级，避免闪烁）。用 untrack 读取初始快照长度——这里只需要
  // 一次性初值，不需要响应式追踪（items 变化由专门的 $effect 触发重测），
  // 故消除 state_referenced_locally。
  let visibleCount = $state(untrack(() => items.length));
  let overflowCount = $state(0);

  // 普通（非响应式）变量：rAF 句柄、hysteresis 上次容器尺寸、回调去重记录。
  let rafId = 0;
  let prevContainerSize = 0;
  let prevReportedVisible = -1;
  let prevReportedOverflow = -1;

  // size → 默认 gap（px）；显式 gap prop 优先。CSS 实际像素与传给 core 的数值必须一致。
  const gapPx = $derived(
    gap ?? (size === 'small' ? 4 : size === 'large' ? 12 : 8),
  );

  // 可见层切片：纯 $derived，仅依赖 items + visibleCount（render-safe，不读 DOM）。
  const visibleItems = $derived(items.slice(0, Math.max(0, visibleCount)));
  const overflowItems = $derived(items.slice(Math.max(0, visibleCount)));

  const cls = $derived(
    ['cd-overflow-list', `cd-overflow-list--${size}`, className]
      .filter(Boolean)
      .join(' '),
  );

  /**
   * 命令式测量（普通函数，绝不是 $derived，绝不在依赖 visibleCount 的 effect 里）。
   * 只由 RO 回调（容器尺寸变）和 items effect（内容变）通过 rAF 调用。
   */
  function measure(): void {
    const container = containerEl;
    const measureRoot = measureEl;
    if (!container || !measureRoot) return;

    // 1. 容器主轴可用尺寸：读根容器 clientWidth（block，随父宽变化；已扣 padding）。
    const containerSize = container.clientWidth;

    // 2. 遍历测量层项子元素，读真实宽度 → itemSizes[]。
    const itemNodes = measureRoot.querySelectorAll<HTMLElement>(
      '[data-cd-measure-item]',
    );
    const itemSizes: number[] = [];
    for (const node of itemNodes) itemSizes.push(node.offsetWidth);

    // 3. 折叠节点样本宽度 → overflowSize。
    const overflowNode = measureRoot.querySelector<HTMLElement>(
      '[data-cd-measure-overflow]',
    );
    const overflowSize = overflowNode ? overflowNode.offsetWidth : 0;

    // 4. 复用 core 收纳算法。
    const r = computeVisibleCount({
      itemSizes,
      containerSize,
      overflowSize,
      gap: gapPx,
      alwaysVisible: alwaysVisibleIndexes,
      minVisibleItems,
    });

    // 5. hysteresis 防边界抖动（prevContainerSize 普通变量）。
    const next = applyHysteresis(
      visibleCount,
      r.visibleCount,
      prevContainerSize,
      containerSize,
      threshold,
    );
    prevContainerSize = containerSize;

    const nextOverflow = Math.max(0, items.length - next);

    // 6. 仅在真实变化时写 $state（写 $state 触发 render 重渲，但不回触发 measure）。
    if (next !== visibleCount) visibleCount = next;
    if (nextOverflow !== overflowCount) overflowCount = nextOverflow;

    // 7. 去重通知 onOverflowChange（与上次上报值比较）。
    if (
      onOverflowChange &&
      (next !== prevReportedVisible || nextOverflow !== prevReportedOverflow)
    ) {
      prevReportedVisible = next;
      prevReportedOverflow = nextOverflow;
      onOverflowChange({
        overflowCount: nextOverflow,
        visibleCount: next,
        overflowItems: items.slice(next),
      });
    }
  }

  function scheduleMeasure(): void {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      measure();
    });
  }

  // ResizeObserver：命令式创建 + observe(containerEl)，容器尺寸变 → rAF 合批 measure。
  // 观测根容器（block，随父宽变化，RO 必 fire）而非内层 flex/overflow 可见层（bug 根因：
  // 其 border-box 不随父变化上报 RO）。依赖 containerEl 就绪；cleanup disconnect + cancelAnimationFrame。
  // 不依赖 visibleCount，故 render 写 visibleCount 不会重跑此 effect。
  $effect(() => {
    const container = containerEl;
    if (!container) return;

    // 立即测一次（命令式，非 render 期）。
    measure();

    const ro = new ResizeObserver(() => scheduleMeasure());
    ro.observe(container);

    return () => {
      ro.disconnect();
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  });

  // items 内容变化时重测：effect 仅依赖 items（读 items.length / items），
  // 绝不依赖 visibleCount，故 measure 写 visibleCount 不会重跑此 effect → 零循环。
  $effect(() => {
    // 显式建立对 items 的依赖（长度/内容变即重测）；不依赖 visibleCount。
    void items.length;
    scheduleMeasure();
  });
</script>

<div class={cls} role="group" aria-label={ariaLabel} bind:this={containerEl}>
  <!-- 可见层：实际渲染，用户所见。 -->
  <div class="cd-overflow-list__visible">
    {#each visibleItems as it, i (i)}
      <div class="cd-overflow-list__item">
        {#if item}{@render item({ item: it, index: i })}{/if}
      </div>
    {/each}
    {#if overflowCount > 0}
      {#if overflow}
        {@render overflow({ overflowItems, overflowCount })}
      {:else}
        <button
          type="button"
          class="cd-overflow-list__more"
          aria-label={`显示其余 ${overflowCount} 项`}
        >
          +{overflowCount}
        </button>
      {/if}
    {/if}
  </div>

  <!-- 离屏测量层：渲染全部 items + 折叠节点样本，仅用于测宽，永不进可视布局/Tab 序。 -->
  <div class="cd-overflow-list__measure" bind:this={measureEl} aria-hidden="true">
    {#each items as it, i (i)}
      <div class="cd-overflow-list__item" data-cd-measure-item>
        {#if item}{@render item({ item: it, index: i })}{/if}
      </div>
    {/each}
    <button
      type="button"
      class="cd-overflow-list__more"
      data-cd-measure-overflow
      tabindex="-1"
    >
      +{items.length}
    </button>
  </div>
</div>

<style>
  .cd-overflow-list {
    --cd-overflow-list-gap: var(--cd-spacing-2, 8px);
    --cd-overflow-list-gap-small: var(--cd-spacing-1, 4px);
    --cd-overflow-list-gap-large: var(--cd-spacing-3, 12px);
    --cd-overflow-list-overflow-color: var(--cd-color-text-1, #4e5969);
    --cd-overflow-list-overflow-color-hover: var(--cd-color-text-0, #1d2129);
    --cd-overflow-list-overflow-bg: var(--cd-color-fill-0, #f2f3f5);
    --cd-overflow-list-overflow-bg-hover: var(--cd-color-fill-1, #e5e6eb);
    --cd-overflow-list-overflow-radius: var(--cd-radius-default, 4px);
    --cd-overflow-list-focus-ring: var(--cd-color-primary, #165dff);

    position: relative;
    display: block;
    inline-size: 100%;
    box-sizing: border-box;
  }

  /* 可见层：单行 flex，超出裁剪；折叠节点不被裁。 */
  .cd-overflow-list__visible {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: var(--cd-overflow-list-gap);
    inline-size: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }

  .cd-overflow-list--small .cd-overflow-list__visible {
    gap: var(--cd-overflow-list-gap-small);
  }
  .cd-overflow-list--large .cd-overflow-list__visible {
    gap: var(--cd-overflow-list-gap-large);
  }

  /* 单项不收缩，保持真实宽度（测量与可见层一致）。 */
  .cd-overflow-list__item {
    flex: 0 0 auto;
    min-inline-size: 0;
  }

  /* 折叠节点：永远显示在末尾、不被裁剪。 */
  .cd-overflow-list__more {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-inline: 8px;
    block-size: 24px;
    border: none;
    border-radius: var(--cd-overflow-list-overflow-radius);
    background: var(--cd-overflow-list-overflow-bg);
    color: var(--cd-overflow-list-overflow-color);
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    box-sizing: border-box;
  }
  .cd-overflow-list__more:hover {
    background: var(--cd-overflow-list-overflow-bg-hover);
    color: var(--cd-overflow-list-overflow-color-hover);
  }
  .cd-overflow-list__more:focus-visible {
    outline: 2px solid var(--cd-overflow-list-focus-ring);
    outline-offset: 1px;
  }

  /* 离屏测量层：渲染全部项，不可见、不可点、不进 Tab 序、不参与可视布局。 */
  .cd-overflow-list__measure {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: var(--cd-overflow-list-gap);
    visibility: hidden;
    pointer-events: none;
    z-index: -1;
    box-sizing: border-box;
  }
  .cd-overflow-list--small .cd-overflow-list__measure {
    gap: var(--cd-overflow-list-gap-small);
  }
  .cd-overflow-list--large .cd-overflow-list__measure {
    gap: var(--cd-overflow-list-gap-large);
  }
</style>
