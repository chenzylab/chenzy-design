<!--
  Carousel — see specs/components/show/Carousel.spec.md
  基础子集：单 slide 展示、slide/fade 动画、autoplay（含 hoverToPause）、loop、
    dot 指示器、prev/next 箭头、受控 value。
  TODO(延后):
    - slidesToShow > 1（多图同屏）/ slidesToScroll
    - line / columnar 指示器样式
    - vertical 方向 + 指示器位置（top/bottom/left/right）
    - 拖拽/滑动手势切换

  ⚠️ 死循环红线：
    - 受控 value 不回写 prop：isControlled = $derived(value !== undefined) +
      内部 $state inner + current = $derived(...)；变更只 onChange。
    - autoplay timer 用普通变量 + $effect cleanup 清理，不在 render 期读副作用写入数据。
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

  function go(i: number) {
    if (count === 0) return;
    let next: number;
    if (loop) {
      next = ((i % count) + count) % count;
    } else {
      next = Math.min(count - 1, Math.max(0, i));
    }
    if (next === current) return;
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function prev() {
    go(current - 1);
  }
  function next() {
    go(current + 1);
  }

  // autoplay：$effect 内 setInterval，普通变量句柄 + cleanup。
  // 用 untrack 读 current，避免 effect 依赖 current 而每次切换都重建定时器（计时被重置）；
  // effect 仅依赖 autoplay/paused/count/interval/reducedMotion，定时器在一次播放周期内稳定。
  $effect(() => {
    if (!autoplay || paused || reducedMotion || count <= 1) return;
    const id = setInterval(() => {
      go(untrack(() => current) + 1);
    }, interval);
    return () => clearInterval(id);
  });

  function onMouseEnter() {
    if (hoverToPause) paused = true;
  }
  function onMouseLeave() {
    if (hoverToPause) paused = false;
  }

  const cls = $derived(
    ['cd-carousel', `cd-carousel--${animation}`, className].filter(Boolean).join(' '),
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
    class="cd-carousel__viewport"
    aria-live={autoplay && !paused ? 'off' : 'polite'}
  >
    {#if animation === 'slide'}
      <div
        class="cd-carousel__track"
        style="transform:translateX(-{current * 100}%); transition-duration:{speed}ms"
      >
        {#each slides as slide, i (i)}
          <div
            class="cd-carousel__slide"
            role="group"
            aria-roledescription="slide"
            aria-hidden={i !== current || undefined}
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

  {#if showArrow && count > 1}
    <button
      type="button"
      class="cd-carousel__arrow cd-carousel__arrow--prev"
      aria-label={loc().t('Carousel.prev')}
      onclick={prev}
    >‹</button>
    <button
      type="button"
      class="cd-carousel__arrow cd-carousel__arrow--next"
      aria-label={loc().t('Carousel.next')}
      onclick={next}
    >›</button>
  {/if}

  {#if showIndicator && count > 1}
    <div class="cd-carousel__indicators" role="tablist" aria-label={loc().t('Carousel.indicators')}>
      {#each slides as _slide, i (i)}
        <button
          type="button"
          class="cd-carousel__dot"
          class:cd-carousel__dot--active={i === current}
          role="tab"
          aria-selected={i === current}
          aria-label={`第 ${i + 1} 张`}
          onclick={() => go(i)}
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

  /* slide 模式：横向 flex 轨道平移 */
  .cd-carousel__track {
    display: flex;
    inline-size: 100%;
    block-size: 100%;
    transition-property: transform;
    transition-timing-function: var(--cd-motion-ease-standard);
  }
  .cd-carousel__slide {
    flex: 0 0 100%;
    inline-size: 100%;
    block-size: 100%;
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

  .cd-carousel__indicators {
    position: absolute;
    inset-block-end: var(--cd-spacing-2);
    inset-inline: 0;
    display: flex;
    justify-content: center;
    gap: var(--cd-carousel-indicator-gap);
    z-index: 2;
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
