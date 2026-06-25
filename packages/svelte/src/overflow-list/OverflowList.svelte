<!--
  OverflowList — see specs/components/show/OverflowList.spec.md
  collapse 折叠模式（尾部 end / 头部 start 方向）+ scroll 滚动模式，
  horizontal 横向 / vertical 纵向两种排列。
  复用 @chenzy-design/core 收纳算法（computeOverflowPartition / applyHysteresis）。
  - mode='collapse'：容器放不下时把溢出项收纳进 +N 折叠节点（collapseFrom 决定从尾/头折叠）。
  - mode='scroll'：不折叠，可见层变可滚动容器，溢出项靠滚动查看。
  - direction='horizontal'|'vertical'：主轴方向；几何测量读对应维度（宽/高）。
  命令式方法（bind:this 暴露，红线 #3：方法内直接操作 DOM，非 render 期）：
  - forceMeasure()：强制立即重新测量 + 重算可见/溢出划分（容器尺寸变化未被
    ResizeObserver 捕获——如父级 display 切换、字体/缩放变化时手动触发）。
  - scrollTo(index, opts?)：scroll 模式下把指定项滚到可见层主轴位置（collapse 模式 no-op）。

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
  import { computeOverflowPartition, applyHysteresis } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  let {
    items = [],
    size = 'default',
    mode = 'collapse',
    direction = 'horizontal',
    collapseFrom = 'end',
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
    /** collapse 折叠溢出项为 +N（默认）；scroll 不折叠，可见层可滚动查看 */
    mode?: 'collapse' | 'scroll';
    /** 主轴方向：horizontal 横向（默认）/ vertical 纵向 */
    direction?: 'horizontal' | 'vertical';
    /** collapse 模式下从尾部（end，默认）还是头部（start）折叠 */
    collapseFrom?: 'end' | 'start';
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
  const loc = useLocale();

  let containerEl = $state<HTMLElement | null>(null); // 根容器，RO 观测对象 + containerSize 来源
  let visibleEl = $state<HTMLElement | null>(null); // 可见层（scroll 模式即滚动容器，scrollTo 目标）
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

  // scroll 模式：永不折叠，全部可见、可见层可滚动。collapse 模式才按几何收纳。
  const isScroll = $derived(mode === 'scroll');

  // 可见层切片：纯 $derived，仅依赖 items + visibleCount + collapseFrom + mode（render-safe，不读 DOM）。
  // collapseFrom='end'：可见 = 前 visibleCount 项，溢出 = 其余尾部项。
  // collapseFrom='start'：可见 = 后 visibleCount 项，溢出 = 其余头部项（折叠节点渲染在头部）。
  const vc = $derived(Math.max(0, visibleCount));
  const visibleItems = $derived(
    isScroll
      ? items
      : collapseFrom === 'start'
        ? items.slice(items.length - vc)
        : items.slice(0, vc),
  );
  const overflowItems = $derived(
    isScroll
      ? []
      : collapseFrom === 'start'
        ? items.slice(0, items.length - vc)
        : items.slice(vc),
  );
  // 首个可见项在原 items 中的索引：start 折叠时可见窗口在尾部，从此偏移开始；
  // 否则（end / scroll）从 0 开始。snippet 的 index 始终映射回原始下标。
  const visibleBaseIndex = $derived(
    !isScroll && collapseFrom === 'start' ? items.length - vc : 0,
  );

  const cls = $derived(
    [
      'cd-overflow-list',
      `cd-overflow-list--${size}`,
      `cd-overflow-list--${direction}`,
      `cd-overflow-list--${mode}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  /**
   * 命令式测量（普通函数，绝不是 $derived，绝不在依赖 visibleCount 的 effect 里）。
   * 只由 RO 回调（容器尺寸变）和 items effect（内容变）通过 rAF 调用。
   */
  function measure(): void {
    // scroll 模式不折叠：可见层渲染全部、靠滚动查看，无几何收纳计算。
    if (isScroll) {
      if (visibleCount !== items.length) visibleCount = items.length;
      if (overflowCount !== 0) overflowCount = 0;
      if (
        onOverflowChange &&
        (items.length !== prevReportedVisible || 0 !== prevReportedOverflow)
      ) {
        prevReportedVisible = items.length;
        prevReportedOverflow = 0;
        onOverflowChange({
          overflowCount: 0,
          visibleCount: items.length,
          overflowItems: [],
        });
      }
      return;
    }

    const container = containerEl;
    const measureRoot = measureEl;
    if (!container || !measureRoot) return;

    const vertical = direction === 'vertical';

    // 1. 容器主轴可用尺寸：横向读 clientWidth，纵向读 clientHeight（block，已扣 padding）。
    const containerSize = vertical ? container.clientHeight : container.clientWidth;

    // 2. 遍历测量层项子元素，读真实主轴尺寸 → itemSizes[]。
    const itemNodes = measureRoot.querySelectorAll<HTMLElement>(
      '[data-cd-measure-item]',
    );
    const itemSizes: number[] = [];
    for (const node of itemNodes)
      itemSizes.push(vertical ? node.offsetHeight : node.offsetWidth);

    // 3. 折叠节点样本主轴尺寸 → overflowSize。
    const overflowNode = measureRoot.querySelector<HTMLElement>(
      '[data-cd-measure-overflow]',
    );
    const overflowSize = overflowNode
      ? vertical
        ? overflowNode.offsetHeight
        : overflowNode.offsetWidth
      : 0;

    // 4. 复用 core 收纳算法（collapseFrom 决定从尾/头折叠；方向已折算进 itemSizes/containerSize）。
    const r = computeOverflowPartition({
      itemSizes,
      containerSize,
      overflowSize,
      gap: gapPx,
      alwaysVisible: alwaysVisibleIndexes,
      minVisibleItems,
      collapseFrom,
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
    //    start 折叠时溢出项在头部 [0, count-next)，end 折叠时在尾部 [next, count)。
    if (
      onOverflowChange &&
      (next !== prevReportedVisible || nextOverflow !== prevReportedOverflow)
    ) {
      prevReportedVisible = next;
      prevReportedOverflow = nextOverflow;
      onOverflowChange({
        overflowCount: nextOverflow,
        visibleCount: next,
        overflowItems:
          collapseFrom === 'start'
            ? items.slice(0, items.length - next)
            : items.slice(next),
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

  /**
   * 命令式方法：强制立即重新测量 + 重算可见/溢出划分（红线 #3：方法内直接调 measure 操作
   * DOM，非 render 期，由父组件 bind:this 后主动调用）。
   * 用于容器尺寸变化未被 ResizeObserver 捕获的场景：父级从 display:none 切回、字体加载完成、
   * 浏览器缩放、内容动态改变间距等。同步执行（不经 rAF），调用后 visibleCount/overflowCount
   * 立即反映最新几何，behavior 与 RO 自然触发完全一致（去重 onOverflowChange 同样生效）。
   */
  export function forceMeasure(): void {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    measure();
  }

  /**
   * 命令式方法：scroll 模式下把指定项滚动到可见层主轴位置（红线 #3：直接写 DOM
   * scrollLeft/scrollTop，非 render 期）。collapse 模式无滚动容器，为 no-op。
   * @param index 目标索引（自动 clamp 到 [0, items.length - 1]）
   * @param opts.align 'start'（默认）| 'center' | 'end'：目标项在视口主轴内的对齐方式
   */
  export function scrollTo(
    index: number,
    opts?: { align?: 'start' | 'center' | 'end' },
  ): void {
    const el = visibleEl;
    if (!el || !isScroll || items.length === 0) return;
    const i = Math.max(0, Math.min(items.length - 1, Math.floor(index)));
    const vertical = direction === 'vertical';

    // scroll 模式可见层渲染全部 items，直接读第 i 个 .cd-overflow-list__item 的几何。
    const nodes = el.querySelectorAll<HTMLElement>('.cd-overflow-list__item');
    const node = nodes[i];
    if (!node) return;

    // 目标项相对滚动内容起点的主轴偏移与尺寸：用 getBoundingClientRect 差值（不受
    // offsetParent 影响），再叠加当前滚动量还原内容坐标。命令式读几何，非 render 期。
    const elRect = el.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const itemStart = vertical
      ? nodeRect.top - elRect.top + el.scrollTop
      : nodeRect.left - elRect.left + el.scrollLeft;
    const itemSize = vertical ? nodeRect.height : nodeRect.width;
    const viewport = vertical ? el.clientHeight : el.clientWidth;
    const maxScroll =
      (vertical ? el.scrollHeight : el.scrollWidth) - viewport;

    const align = opts?.align ?? 'start';
    let target =
      align === 'center'
        ? itemStart - (viewport - itemSize) / 2
        : align === 'end'
          ? itemStart - (viewport - itemSize)
          : itemStart;
    target = Math.max(0, Math.min(maxScroll, target));

    if (vertical) el.scrollTop = target;
    else el.scrollLeft = target;
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

  // items 内容 / 模式参数变化时重测：effect 依赖 items.length + mode/direction/
  // collapseFrom/gap 等配置（render 安全，均非几何 $state），绝不依赖 visibleCount，
  // 故 measure 写 visibleCount 不会重跑此 effect → 零循环。
  $effect(() => {
    // 显式建立依赖：内容长度 + 影响收纳结果的配置项变化即重测。
    void items.length;
    void mode;
    void direction;
    void collapseFrom;
    void gapPx;
    void minVisibleItems;
    void threshold;
    scheduleMeasure();
  });
</script>

<div class={cls} role="group" aria-label={ariaLabel} bind:this={containerEl}>
  <!-- 可见层：实际渲染，用户所见。scroll 模式下可滚动；collapse 模式下溢出收纳为 +N。
       scroll 模式下可见层即滚动容器：设 tabindex=0 让键盘用户可聚焦后用方向键滚动
       （WCAG 2.1.1，浏览器对聚焦的滚动容器原生支持方向键滚动），并提供可访问名。
       group 角色为非交互元素，故 tabindex 显式抑制 lint（同 Card/Carousel/DatePicker）。 -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="cd-overflow-list__visible"
    bind:this={visibleEl}
    tabindex={isScroll ? 0 : undefined}
    role={isScroll ? 'group' : undefined}
    aria-label={isScroll ? (ariaLabel ?? loc().t('OverflowList.scrollAriaLabel')) : undefined}
  >
    <!-- start 折叠：折叠节点在头部（溢出项是前面的项）。scroll 模式 overflowCount 恒为 0。 -->
    {#if overflowCount > 0 && collapseFrom === 'start'}
      {#if overflow}
        {@render overflow({ overflowItems, overflowCount })}
      {:else}
        <button
          type="button"
          class="cd-overflow-list__more"
          aria-label={loc().t('OverflowList.moreAriaLabel', { count: overflowCount })}
        >
          +{overflowCount}
        </button>
      {/if}
    {/if}
    {#each visibleItems as it, i (visibleBaseIndex + i)}
      <div class="cd-overflow-list__item">
        {#if item}{@render item({ item: it, index: visibleBaseIndex + i })}{/if}
      </div>
    {/each}
    <!-- end 折叠（默认）：折叠节点在尾部。 -->
    {#if overflowCount > 0 && collapseFrom === 'end'}
      {#if overflow}
        {@render overflow({ overflowItems, overflowCount })}
      {:else}
        <button
          type="button"
          class="cd-overflow-list__more"
          aria-label={loc().t('OverflowList.moreAriaLabel', { count: overflowCount })}
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

  /* 纵向根容器：撑满父高，几何测量读 clientHeight。 */
  .cd-overflow-list--vertical {
    block-size: 100%;
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

  /* 纵向：主轴改为列方向，可见层撑满高。 */
  .cd-overflow-list--vertical .cd-overflow-list__visible {
    flex-direction: column;
    align-items: stretch;
    block-size: 100%;
  }

  /* scroll 模式：不折叠，可见层沿主轴可滚动。容器可聚焦，键盘焦点环可见。 */
  .cd-overflow-list--scroll .cd-overflow-list__visible {
    outline: none;
  }
  .cd-overflow-list--scroll .cd-overflow-list__visible:focus-visible {
    outline: 2px solid var(--cd-overflow-list-focus-ring);
    outline-offset: 1px;
  }
  .cd-overflow-list--scroll.cd-overflow-list--horizontal .cd-overflow-list__visible {
    overflow-x: auto;
    overflow-y: hidden;
  }
  .cd-overflow-list--scroll.cd-overflow-list--vertical .cd-overflow-list__visible {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .cd-overflow-list--small .cd-overflow-list__visible {
    gap: var(--cd-overflow-list-gap-small);
  }
  .cd-overflow-list--large .cd-overflow-list__visible {
    gap: var(--cd-overflow-list-gap-large);
  }

  /* 单项不收缩，保持真实尺寸（测量与可见层一致）。 */
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
  /* 纵向测量层：列方向布局，测项高度。 */
  .cd-overflow-list--vertical .cd-overflow-list__measure {
    flex-direction: column;
    align-items: flex-start;
  }
  .cd-overflow-list--small .cd-overflow-list__measure {
    gap: var(--cd-overflow-list-gap-small);
  }
  .cd-overflow-list--large .cd-overflow-list__measure {
    gap: var(--cd-overflow-list-gap-large);
  }
</style>
