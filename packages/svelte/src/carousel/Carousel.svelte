<!--
  Carousel — see specs/components/show/Carousel.spec.md
  基础子集：单/多 slide 展示（slidesToShow/slidesToScroll）、slide/fade 动画、
    autoplay（含 hoverToPause）、loop、dot/line/columnar 指示器、prev/next 箭头、受控 value、
    vertical 纵向方向、pointer 拖拽/滑动手势切换。

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
  import { useLiveAnnouncer } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Animation = 'slide' | 'fade';
  type IndicatorType = 'dot' | 'line' | 'columnar';

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
    indicatorType?: IndicatorType;
    showArrow?: boolean;
    hoverToPause?: boolean;
    height?: number | string;
    ariaLabel?: string;
    onChange?: (index: number) => void;
    onPlayStateChange?: (playing: boolean) => void;
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
    indicatorType = 'dot',
    showArrow = true,
    hoverToPause = true,
    height = 240,
    ariaLabel,
    onChange,
    onPlayStateChange,
    class: className = '',
  }: Props = $props();

  const loc = useLocale();
  // 单例 live region（polite）：手动切换 slide 时播报「第 N 张，共 M 张」（红线 #3：命令式）。
  const announcer = useLiveAnnouncer();

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
  // 键盘焦点进入容器时暂停 autoplay（无障碍：WCAG 2.2.2，焦点态不应继续移动）。
  let focused = $state(false);
  // 用户经播放/暂停按钮显式切换的状态。默认按 autoplay prop 推断初值。
  // userPaused=true 即用户主动暂停；与 hover/focus 暂停叠加判定是否实际运行。
  let userPaused = $state(false);

  // reduced-motion：matchMedia 监听，开启时暂停 autoplay（无障碍）。
  let reducedMotion = $state(false);

  // 是否「想要」自动播放（用户意图）：autoplay 开 且 未被用户显式暂停。
  const wantsPlaying = $derived(autoplay && !userPaused);
  // 实际是否在播放（叠加 hover/focus/reduced-motion 等运行时抑制）。
  const isPlaying = $derived(
    wantsPlaying && !paused && !focused && !reducedMotion && count > perView,
  );

  function togglePlay() {
    userPaused = !userPaused;
    onPlayStateChange?.(!userPaused);
  }

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
    // 手动切换时 polite 播报「第 N 张，共 M 张」；autoplay 实际运行中不播，避免噪音（§6）。
    // 用即将生效的 next 计算页码（$derived 在同步回调内尚未重算）。
    if (!isPlaying && pageCount > 0) {
      const nextPage = step > 0 ? Math.round(next / step) : 0;
      announcer.announce(
        loc().t('Carousel.slideAnnounce', { index: nextPage + 1, total: pageCount }),
      );
    }
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
  // Home/End：跳到第一/最后一张（非 loop 时止于 maxIndex）。
  function goFirst() {
    go(0);
  }
  function goLast() {
    go(loop ? count - 1 : maxIndex);
  }

  // 视口键盘导航（§6）：←/→ 切换，Home/End 跳首末。
  // RTL 下 ←/→ 物理键语义镜像（←=next、→=prev）。
  function onViewportKeydown(e: KeyboardEvent) {
    if (count <= perView) return;
    const rtl = viewportEl?.matches(':dir(rtl)') ?? false;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        rtl ? next() : prev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        rtl ? prev() : next();
        break;
      case 'ArrowUp':
        if (!vertical) return;
        e.preventDefault();
        prev();
        break;
      case 'ArrowDown':
        if (!vertical) return;
        e.preventDefault();
        next();
        break;
      case 'Home':
        e.preventDefault();
        goFirst();
        break;
      case 'End':
        e.preventDefault();
        goLast();
        break;
    }
  }

  // autoplay：$effect 内 setInterval，普通变量句柄 + cleanup（红线 #3）。
  // 用 untrack 读 current，避免 effect 依赖 current 而每次切换都重建定时器（计时被重置）；
  // effect 仅依赖 autoplay/paused/count/interval/reducedMotion/step，定时器在一次播放周期内稳定。
  $effect(() => {
    if (!isPlaying) return;
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
  // 键盘焦点进入/离开容器：暂停/恢复 autoplay（§6）。
  function onFocusIn() {
    focused = true;
  }
  function onFocusOut(e: FocusEvent) {
    // 仅当焦点真正移出容器时恢复（忽略容器内部移动）。
    const next = e.relatedTarget as Node | null;
    if (!next || !(e.currentTarget as HTMLElement).contains(next)) {
      focused = false;
    }
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
  aria-label={ariaLabel ?? loc().t('Carousel.ariaLabel')}
  style="block-size:{heightStyle}"
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  onfocusin={onFocusIn}
  onfocusout={onFocusOut}
>
  <!--
    viewport 可聚焦（tabindex=0）以承接 ←/→/Home/End 键盘导航；
    autoplay 实际运行时 aria-live=off（避免每次自动切换都打断屏幕阅读器），
    暂停/手动态切到 polite，配合计数文本播报「第 X 张」。
    APG carousel：role=group 的轮播视口承载方向键导航属预期模式，故抑制以下两条 a11y 警告。
  -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={viewportEl}
    class="cd-carousel__viewport"
    role="group"
    aria-roledescription="slides"
    tabindex={count > perView ? 0 : undefined}
    aria-live={isPlaying ? 'off' : 'polite'}
    onpointerdown={onPointerDown}
    onkeydown={onViewportKeydown}
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
            aria-label={loc().t('Carousel.slideLabel', { index: i + 1 })}
            aria-hidden={(i < current || i >= current + perView) || undefined}
            inert={(i < current || i >= current + perView) || undefined}
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
            aria-label={loc().t('Carousel.slideLabel', { index: i + 1 })}
            aria-hidden={i !== current || undefined}
            inert={i !== current || undefined}
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

  <!--
    播放/暂停按钮（WCAG 2.2.2）：autoplay 开启时常驻，可见且可键盘操作。
    label 随 userPaused 切换（播放 ↔ 暂停）。
  -->
  {#if autoplay && count > perView}
    <button
      type="button"
      class="cd-carousel__play"
      aria-label={userPaused ? loc().t('Carousel.play') : loc().t('Carousel.pause')}
      aria-pressed={!userPaused}
      onclick={togglePlay}
    >{userPaused ? '▶' : '❚❚'}</button>
  {/if}

  {#if showIndicator && pageCount > 1}
    <div
      class="cd-carousel__indicators cd-carousel__indicators--{indicatorType}"
      role="tablist"
      aria-label={loc().t('Carousel.indicators')}
    >
      {#each { length: pageCount } as _p, p (p)}
        <button
          type="button"
          class="cd-carousel__dot cd-carousel__indicator cd-carousel__indicator--{indicatorType}"
          class:cd-carousel__dot--active={p === activePage}
          role="tab"
          aria-selected={p === activePage}
          aria-label={loc().t('Carousel.slideLabel', { index: p + 1 })}
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
  .cd-carousel__viewport:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--cd-color-primary, currentColor);
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

  /* 播放/暂停按钮：左下角常驻，命中区 ≥ 32px。 */
  .cd-carousel__play {
    position: absolute;
    inset-block-end: var(--cd-spacing-2);
    inset-inline-start: var(--cd-spacing-2);
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
    font-size: calc(var(--cd-carousel-arrow-size) * 0.4);
    line-height: 1;
    cursor: pointer;
    z-index: 2;
  }
  .cd-carousel__play:focus-visible {
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

  /* line 指示器：横向细长条；激活态加长 + 高亮（纯 CSS 派生，红线 #2）。 */
  .cd-carousel__indicator--line {
    inline-size: 16px;
    block-size: 4px;
    border-radius: var(--cd-radius-full);
    transition:
      background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      inline-size var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-carousel__indicator--line.cd-carousel__dot--active {
    inline-size: 24px;
  }
  /* vertical 方向：line 旋为纵向细条（主轴改为 block-size 伸缩）。 */
  .cd-carousel--vertical .cd-carousel__indicator--line {
    inline-size: 4px;
    block-size: 16px;
    transition:
      background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      block-size var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-carousel--vertical .cd-carousel__indicator--line.cd-carousel__dot--active {
    block-size: 24px;
  }

  /* columnar 指示器：竖栏；默认矮，激活态变高 + 高亮。 */
  .cd-carousel__indicator--columnar {
    inline-size: 4px;
    block-size: 8px;
    border-radius: var(--cd-radius-sm, 2px);
    transition:
      background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      block-size var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-carousel__indicator--columnar.cd-carousel__dot--active {
    block-size: 14px;
  }
  /* vertical 方向：columnar 转为横栏，主轴改为 inline-size 伸缩。 */
  .cd-carousel--vertical .cd-carousel__indicator--columnar {
    inline-size: 8px;
    block-size: 4px;
    transition:
      background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      inline-size var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-carousel--vertical .cd-carousel__indicator--columnar.cd-carousel__dot--active {
    inline-size: 14px;
  }

  /* columnar 横向时按底边对齐，竖栏自底部生长更自然。 */
  .cd-carousel__indicators--columnar {
    align-items: flex-end;
  }
  .cd-carousel--vertical .cd-carousel__indicators--columnar {
    align-items: flex-start;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-carousel__track,
    .cd-carousel__slide--fade,
    .cd-carousel__dot {
      transition-duration: 0ms;
    }
  }
</style>
