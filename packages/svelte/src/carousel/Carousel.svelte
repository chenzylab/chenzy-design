<!--
  Carousel — see specs/components/show/Carousel.spec.md
  基础子集：单/多 slide 展示（slidesToShow/slidesToScroll）、slide/fade 动画、
    autoplay（含 hoverToPause）、loop、dot 指示器、prev/next 箭头、受控 value、
    vertical 纵向方向、pointer 拖拽/滑动手势切换。
  TODO(延后):
    - line / columnar 指示器样式

  ⚠️ 死循环红线：
    - 受控 value 不回写 prop（红线 #1）：isControlled = $derived(value !== undefined) +
      内部 $state inner + current = $derived(...)；变更只 onChange。
    - 当前页/transform 为派生纯函数（红线 #2）：trackOffset/pageCount 由 $derived 计算。
    - autoplay timer 与 pointer 拖拽监听命令式（红线 #3）：autoplay 用普通变量 setInterval
      + $effect cleanup；pointermove/up 绑 window 手动 add/remove；拖拽偏移存 $state dragPx。
    - 不使用响应式 attachment 读 DOM。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';

  type Animation = 'slide' | 'fade';

  interface Props {
    slides?: Snippet[];
    value?: number;
    defaultActiveIndex?: number;
    autoplay?: boolean;
    interval?: number;
    loop?: boolean;
    animation?: Animation;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    vertical?: boolean;
    draggable?: boolean;
    showIndicator?: boolean;
    showArrow?: boolean;
    hoverToPause?: boolean;
    height?: number | string;
    onChange?: (index: number) => void;
    class?: string;
  }

  let {
    slides = [],
    value,
    defaultActiveIndex = 0,
    autoplay = false,
    interval = 3000,
    loop = true,
    animation = 'slide',
    speed = 300,
    slidesToShow = 1,
    slidesToScroll = 1,
    vertical = false,
    draggable = true,
    showIndicator = true,
    showArrow = true,
    hoverToPause = true,
    height = 240,
    onChange,
    class: className = '',
  }: Props = $props();

  const loc = useLocale();

  // 受控 / 非受控（红线 #1）：永不回写 prop。
  const isControlled = $derived(value !== undefined);
  let inner = $state(getInitialIndex());
  const current = $derived(isControlled ? (value as number) : inner);

  function getInitialIndex(): number {
    return defaultActiveIndex;
  }

  const count = $derived(slides.length);

  // 同屏展示数 / 步长归一（至少 1，且不超过 slide 数）。
  const perView = $derived(Math.max(1, Math.min(slidesToShow, Math.max(1, count))));
  const step = $derived(Math.max(1, slidesToScroll));

  // fade 动画与多图同屏互斥：多图时强制 slide 轨道平移。
  const mode = $derived<Animation>(perView > 1 ? 'slide' : animation);

  // 派生纯函数（红线 #2）：可滚动的最大起始索引与页数。
  // loop 时每张都能作为起点；非 loop 时起点止于「末尾恰好填满一屏」。
  const maxIndex = $derived(loop ? Math.max(0, count - 1) : Math.max(0, count - perView));
  const pageCount = $derived(
    count === 0 ? 0 : loop ? Math.ceil(count / step) : Math.floor(maxIndex / step) + 1,
  );
  const activePage = $derived(step > 0 ? Math.round(current / step) : 0);

  // hover 暂停状态（本地）。
  let paused = $state(false);

  // reduced-motion：matchMedia 监听，开启时暂停 autoplay（无障碍）。
  let reducedMotion = $state(false);
  $effect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mql.matches;
    const onChangeMq = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mql.addEventListener('change', onChangeMq);
    return () => mql.removeEventListener('change', onChangeMq);
  });

  const heightStyle = $derived(typeof height === 'number' ? `${height}px` : height);

  // 每张 slide 占视口的百分比（横/纵向均按 perView 切分）。
  const slidePct = $derived(100 / perView);

  function clampIndex(i: number): number {
    if (count === 0) return 0;
    if (loop) return ((i % count) + count) % count;
    return Math.min(maxIndex, Math.max(0, i));
  }

  function go(i: number) {
    if (count === 0) return;
    const next = clampIndex(i);
    if (next === current) return;
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function prev() {
    go(current - step);
  }
  function next() {
    go(current + step);
  }
  function goToPage(p: number) {
    go(p * step);
  }

  // autoplay：$effect 内 setInterval，普通变量句柄 + cleanup（红线 #3）。
  // 用 untrack 读 current，避免 effect 依赖 current 而每次切换都重建定时器（计时被重置）；
  // effect 仅依赖 autoplay/paused/count/interval/reducedMotion/step，定时器在一次播放周期内稳定。
  $effect(() => {
    if (!autoplay || paused || reducedMotion || count <= perView) return;
    const id = setInterval(() => {
      go(untrack(() => current) + step);
    }, interval);
    return () => clearInterval(id);
  });

  function onMouseEnter() {
    if (hoverToPause) paused = true;
  }
  function onMouseLeave() {
    if (hoverToPause) paused = false;
  }

  // ---- 命令式 pointer 拖拽（红线 #3）----
  // 视口尺寸在 pointerdown 时读一次存入普通变量；拖拽偏移（px）存 $state 以驱动轨道平移。
  let viewportEl: HTMLElement | null = null;
  let dragStart = 0; // 起点坐标（vertical 取 clientY，否则 clientX）
  let dragSize = 0; // 视口主轴尺寸（px），用于阈值与百分比换算
  let dragPx = $state(0); // 实时拖拽位移（px，负为向后）
  let dragging = $state(false);

  // 拖拽期间的额外平移百分比（占整条轨道），由派生纯函数换算（红线 #2）。
  const dragPct = $derived(dragSize > 0 ? (dragPx / dragSize) * slidePct : 0);

  function onPointerMove(e: PointerEvent) {
    const cur = vertical ? e.clientY : e.clientX;
    dragPx = cur - dragStart;
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    const moved = dragPx;
    dragging = false;
    dragPx = 0;
    // 拖过半张（单张尺寸的一半）即进位，否则回弹。
    const slideSize = dragSize / perView;
    if (slideSize > 0 && Math.abs(moved) > slideSize / 2) {
      go(moved < 0 ? current + step : current - step);
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (!draggable || mode !== 'slide' || count <= perView || !viewportEl) return;
    // 仅主键 / 触摸 / 笔；忽略右键。
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const rect = viewportEl.getBoundingClientRect();
    dragSize = vertical ? rect.height : rect.width;
    dragStart = vertical ? e.clientY : e.clientX;
    dragPx = 0;
    dragging = true;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  // 派生纯函数（红线 #2）：轨道平移 = 当前索引偏移 + 拖拽偏移。
  const trackOffset = $derived(-(current * slidePct) + dragPct);
  const axis = $derived(vertical ? 'Y' : 'X');
  // 拖拽中关闭过渡（跟手），松手后恢复 speed 过渡。
  const trackDuration = $derived(dragging ? 0 : speed);

  const cls = $derived(
    [
      'cd-carousel',
      `cd-carousel--${mode}`,
      vertical && 'cd-carousel--vertical',
      dragging && 'cd-carousel--dragging',
      draggable && mode === 'slide' && count > perView && 'cd-carousel--draggable',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  class={cls}
  role="region"
  aria-roledescription="carousel"
  style="block-size:{heightStyle}"
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
>
  <div
    bind:this={viewportEl}
    class="cd-carousel__viewport"
    role="group"
    aria-roledescription="slides"
    aria-live={autoplay && !paused ? 'off' : 'polite'}
    onpointerdown={onPointerDown}
  >
    {#if mode === 'slide'}
      <div
        class="cd-carousel__track"
        style="--cd-carousel-slide-size:{slidePct}%; transform:translate{axis}({trackOffset}%); transition-duration:{trackDuration}ms"
      >
        {#each slides as slide, i (i)}
          <div
            class="cd-carousel__slide"
            role="group"
            aria-roledescription="slide"
            aria-hidden={(i < current || i >= current + perView) || undefined}
          >
            {@render slide()}
          </div>
        {/each}
      </div>
    {:else}
      <div class="cd-carousel__fade">
        {#each slides as slide, i (i)}
          <div
            class="cd-carousel__slide cd-carousel__slide--fade"
            class:cd-carousel__slide--active={i === current}
            role="group"
            aria-roledescription="slide"
            aria-hidden={i !== current || undefined}
            style="transition-duration:{speed}ms"
          >
            {@render slide()}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if showArrow && count > perView}
    <button
      type="button"
      class="cd-carousel__arrow cd-carousel__arrow--prev"
      aria-label={loc().t('Carousel.prev')}
      onclick={prev}
    >{vertical ? '∧' : '‹'}</button>
    <button
      type="button"
      class="cd-carousel__arrow cd-carousel__arrow--next"
      aria-label={loc().t('Carousel.next')}
      onclick={next}
    >{vertical ? '∨' : '›'}</button>
  {/if}

  {#if showIndicator && pageCount > 1}
    <div class="cd-carousel__indicators" role="tablist" aria-label={loc().t('Carousel.indicators')}>
      {#each { length: pageCount } as _p, p (p)}
        <button
          type="button"
          class="cd-carousel__dot"
          class:cd-carousel__dot--active={p === activePage}
          role="tab"
          aria-selected={p === activePage}
          aria-label={`第 ${p + 1} 张`}
          onclick={() => goToPage(p)}
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cd-carousel {
    position: relative;
    inline-size: 100%;
    overflow: hidden;
    border-radius: var(--cd-carousel-radius);
  }
  .cd-carousel__viewport {
    position: relative;
    inline-size: 100%;
    block-size: 100%;
    overflow: hidden;
  }
  /* 可拖拽时禁用文本/图片选中与浏览器原生平移手势，确保 pointer 跟手。 */
  .cd-carousel--draggable .cd-carousel__viewport {
    cursor: grab;
    user-select: none;
    touch-action: pan-y;
  }
  .cd-carousel--vertical.cd-carousel--draggable .cd-carousel__viewport {
    touch-action: pan-x;
  }
  .cd-carousel--dragging .cd-carousel__viewport {
    cursor: grabbing;
  }

  /* slide 模式：横向 flex 轨道平移 */
  .cd-carousel__track {
    display: flex;
    inline-size: 100%;
    block-size: 100%;
    transition-property: transform;
    transition-timing-function: var(--cd-motion-ease-standard);
  }
  .cd-carousel__slide {
    flex: 0 0 var(--cd-carousel-slide-size, 100%);
    inline-size: var(--cd-carousel-slide-size, 100%);
    block-size: 100%;
  }

  /* vertical：轨道纵向排列，slide 高度切分，平移走 Y 轴 */
  .cd-carousel--vertical .cd-carousel__track {
    flex-direction: column;
  }
  .cd-carousel--vertical .cd-carousel__slide {
    inline-size: 100%;
    block-size: var(--cd-carousel-slide-size, 100%);
    flex: 0 0 var(--cd-carousel-slide-size, 100%);
  }

  /* fade 模式：叠放，仅 active 项可见 */
  .cd-carousel__fade {
    position: relative;
    inline-size: 100%;
    block-size: 100%;
  }
  .cd-carousel__slide--fade {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition-property: opacity;
    transition-timing-function: var(--cd-motion-ease-standard);
  }
  .cd-carousel__slide--fade.cd-carousel__slide--active {
    opacity: 1;
    pointer-events: auto;
  }

  .cd-carousel__arrow {
    position: absolute;
    inset-block-start: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-carousel-arrow-size);
    block-size: var(--cd-carousel-arrow-size);
    padding: 0;
    border: none;
    border-radius: var(--cd-radius-full);
    background: var(--cd-carousel-arrow-bg);
    color: var(--cd-carousel-arrow-color);
    font-size: calc(var(--cd-carousel-arrow-size) * 0.6);
    line-height: 1;
    cursor: pointer;
    z-index: 2;
  }
  .cd-carousel__arrow--prev {
    inset-inline-start: var(--cd-spacing-2);
  }
  .cd-carousel__arrow--next {
    inset-inline-end: var(--cd-spacing-2);
  }
  .cd-carousel__arrow:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  /* vertical：箭头改为上/下居中 */
  .cd-carousel--vertical .cd-carousel__arrow {
    inset-block-start: auto;
    inset-inline: 0;
    margin-inline: auto;
    transform: none;
  }
  .cd-carousel--vertical .cd-carousel__arrow--prev {
    inset-block-start: var(--cd-spacing-2);
  }
  .cd-carousel--vertical .cd-carousel__arrow--next {
    inset-block-end: var(--cd-spacing-2);
  }

  .cd-carousel__indicators {
    position: absolute;
    inset-block-end: var(--cd-spacing-2);
    inset-inline: 0;
    display: flex;
    justify-content: center;
    gap: var(--cd-carousel-indicator-gap);
    z-index: 2;
  }
  /* vertical：指示器移至右侧纵向排列 */
  .cd-carousel--vertical .cd-carousel__indicators {
    inset-block: 0;
    inset-inline-end: var(--cd-spacing-2);
    inset-inline-start: auto;
    flex-direction: column;
    justify-content: center;
  }
  .cd-carousel__dot {
    inline-size: 8px;
    block-size: 8px;
    padding: 0;
    border: none;
    border-radius: var(--cd-radius-full);
    background: var(--cd-carousel-indicator-color);
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-carousel__dot--active {
    background: var(--cd-carousel-indicator-color-active);
  }
  .cd-carousel__dot:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-carousel__track,
    .cd-carousel__slide--fade,
    .cd-carousel__dot {
      transition-duration: 0ms;
    }
  }
</style>
