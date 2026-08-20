<!--
  Carousel — 走马灯。DOM 结构、动画机制、API 契约逐项对齐 Semi Design
  （@douyinfe/semi-ui/carousel）。文件拆分对齐 Semi 三文件：
  index.tsx → Carousel.svelte，CarouselArrow.tsx / CarouselIndicator.tsx → 同名 .svelte。

  结构（镜像 Semi cssClasses，前缀 cd-）：
    .cd-carousel (root, role=region)
      .cd-carousel-content.cd-carousel-content-{slide|fade}[.cd-carousel-content-reverse]
        .cd-carousel-content-item.cd-carousel-content-item-{current|prev|next|active|slide-in|slide-out}
      .cd-carousel-indicator > CarouselIndicator(.cd-carousel-indicator.-{type}.-{position})
      CarouselArrow(.cd-carousel-arrow[.-hover] > .cd-carousel-arrow-prev/-next)

  动画对齐 Semi：所有 item 绝对定位叠放；slide 用 keyframe slide-in/out（+reverse
  按 slideDirection/是否回退），fade 用 opacity。每张 slide 对应一个指示点。

  ⚠️ 死循环红线：
    - 受控 activeIndex 不回写 prop（红线 #1）：isControlled = $derived(activeIndex !== undefined)
      + 内部 $state inner；current = $derived(...)；变更只 onChange。
    - 当前页/isReverse/isInit 为 $state，仅命令式切换里更新（红线 #2）。
    - autoplay timer 命令式（红线 #3）：$effect 内 setInterval + cleanup；不用响应式 attachment。

  ⚠️ hover 暂停/恢复对齐 Semi `debounce(fn, 400)`（index.tsx onMouseEnter/onMouseLeave）：
    鼠标快速划过（400ms 内进出）不触发暂停/恢复抖动；真实停留才在 400ms 后生效。

  a11y 增强（Semi 未覆盖，本库补全，不破坏三段式结构）：
    键盘 ←/→/Home/End、live announcer、reduced-motion、可见播放/暂停按钮（WCAG 2.2.2）。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import { useLiveAnnouncer } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import CarouselIndicator from './CarouselIndicator.svelte';
  import CarouselArrow from './CarouselArrow.svelte';
  import type { CarouselProps as Props } from './interface.js';

  let {
    slides = [],
    activeIndex,
    defaultActiveIndex = 0,
    autoPlay = true,
    animation = 'slide',
    speed = 300,
    showIndicator = true,
    indicatorType = 'dot',
    indicatorPosition = 'center',
    indicatorSize = 'small',
    showArrow = true,
    arrowType = 'always',
    arrowProps,
    theme = 'light',
    slideDirection = 'left',
    trigger = 'click',
    onChange,
    style,
    class: className = '',
  }: Props = $props();

  const DEFAULT_INTERVAL = 2000;

  // 解析 autoPlay：布尔或对象；对象形式覆盖 interval / hoverToPause（对齐 Semi）。
  const autoPlayOn = $derived(autoPlay === true || (typeof autoPlay === 'object' && autoPlay !== null));
  const resolvedInterval = $derived(
    typeof autoPlay === 'object' && autoPlay?.interval !== undefined ? autoPlay.interval : DEFAULT_INTERVAL,
  );
  const resolvedHoverToPause = $derived(
    typeof autoPlay === 'object' ? autoPlay?.hoverToPause !== false : true,
  );

  const loc = useLocale();
  const announcer = useLiveAnnouncer();

  // 受控 / 非受控（红线 #1）：永不回写 prop。
  const isControlled = $derived(activeIndex !== undefined);
  // 仅取 defaultActiveIndex 初值（untrack 明确不追踪，后续变更不重置内部索引）。
  let inner = $state(untrack(() => defaultActiveIndex));
  const current = $derived(isControlled ? (activeIndex as number) : inner);

  const count = $derived(slides.length);

  // 切换方向与初始态（红线 #2）：命令式切换里更新，驱动 slide keyframe。
  let isReverse = $state(false);
  let isInit = $state(true);
  // 记录上一张，用于 slide-out 定位（对齐 Semi preIndex）；仅取初值。
  let preIndex = $state(untrack(() => defaultActiveIndex));

  // hover / 键盘 focus / reduced-motion 抑制自动播放。
  let paused = $state(false);
  let focused = $state(false);
  let reducedMotion = $state(false);
  // 用户经播放/暂停按钮显式暂停。
  let userPaused = $state(false);

  const wantsPlaying = $derived(autoPlayOn && !userPaused);
  const isPlaying = $derived(
    wantsPlaying && !paused && !focused && !reducedMotion && count > 1,
  );

  function getValidIndex(index: number): number {
    return count === 0 ? 0 : ((index % count) + count) % count;
  }

  // 核心切换（对齐 Semi foundation.goTo / _notifyChange）。
  function goTo(targetRaw: number) {
    if (count === 0) return;
    const target = getValidIndex(targetRaw);
    isReverse = current > target;
    commit(target);
  }
  // ⚠️ svelte-check 对下面两个函数报 non_reactive_update 告警：因为它们被当作
  // 函数类型 prop 传给 CarouselArrow（`prev={prev} next={next}`），静态分析误判
  // 为潜在双向绑定目标。核实为误报——`$props()` 解构变量没有 `$bindable()` 声明
  // 不可能被子组件写回，且拆分前单文件版本无此告警（子组件消费触发的分析路径）。
  function next() {
    if (count === 0) return;
    const target = getValidIndex(current + 1);
    isReverse = false;
    commit(target);
  }
  function prev() {
    if (count === 0) return;
    const target = getValidIndex(current - 1);
    isReverse = true;
    commit(target);
  }

  function commit(target: number) {
    if (isInit) isInit = false;
    if (target === current) return;
    const from = current;
    preIndex = from;
    if (!isControlled) inner = target;
    onChange?.(target, from);
    // 手动切换 polite 播报「第 N 张，共 M 张」；autoplay 运行中不播（§6 减噪）。
    if (!isPlaying) {
      announcer.announce(
        loc().t('Carousel.slideAnnounce', { index: target + 1, total: count }),
      );
    }
  }

  // 指示器切换：click / hover 触发（对齐 Semi onIndicatorChange）。
  function onIndicatorChange(index: number) {
    isReverse = current > index;
    commit(index);
  }

  // Home/End：跳首末。
  function goFirst() {
    goTo(0);
  }
  function goLast() {
    goTo(count - 1);
  }

  // 视口键盘导航（本库 a11y 增强）：←/→ 切换、Home/End 跳首末；RTL 下 ←/→ 镜像。
  let rootEl: HTMLElement | null = null;
  function onKeydown(e: KeyboardEvent) {
    if (count <= 1) return;
    // ⚠️ 不能用 `matches(':dir(rtl)')`：`:dir()` 只认 HTML 的 `dir` 属性，
    // 而 ConfigProvider（与 Semi 一致）只注入 `<div class="cd-rtl">` 不设 dir，
    // 那样判定恒为 false、RTL 下左右键镜像从未生效。改读**实际计算方向**，
    // 两种机制（dir 属性 / CSS direction）都能正确识别。
    const rtl = rootEl ? getComputedStyle(rootEl).direction === 'rtl' : false;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        rtl ? next() : prev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        rtl ? prev() : next();
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

  // reduced-motion 监听（a11y）。
  $effect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mql.matches;
    const onMq = (e: MediaQueryListEvent) => (reducedMotion = e.matches);
    mql.addEventListener('change', onMq);
    return () => mql.removeEventListener('change', onMq);
  });

  // autoplay（红线 #3）：$effect 内 setInterval + cleanup。用 untrack 读 current，
  // 避免每次切换都重建定时器（Semi getSwitchingTime = interval + speed）。
  $effect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      isReverse = false;
      commit(getValidIndex(untrack(() => current) + 1));
    }, resolvedInterval + speed);
    return () => clearInterval(id);
  });

  // hover 暂停/恢复对齐 Semi `debounce(fn, 400)`（index.tsx）：内联轻量 debounce，
  // 不为一个 400ms 抖动缓冲引入 lodash-es 依赖。
  function debounce<T extends (...args: never[]) => void>(fn: T, wait: number): T {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return ((...args: never[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    }) as T;
  }
  function handleMouseEnter() {
    if (resolvedHoverToPause) paused = true;
  }
  function handleMouseLeave() {
    if (resolvedHoverToPause) paused = false;
  }
  const onMouseEnter = debounce(handleMouseEnter, 400);
  const onMouseLeave = debounce(handleMouseLeave, 400);
  function onFocusIn() {
    focused = true;
  }
  function onFocusOut(e: FocusEvent) {
    const to = e.relatedTarget as Node | null;
    if (!to || !(e.currentTarget as HTMLElement).contains(to)) focused = false;
  }
  function togglePlay() {
    userPaused = !userPaused;
  }

  // ---- 派生 class（对齐 Semi cls 组合）----
  const rootCls = $derived(['cd-carousel', className].filter(Boolean).join(' '));

  // Semi content-reverse：slideDirection==='left' 时 isReverse 直取，否则取反。
  const contentReverse = $derived(slideDirection === 'left' ? isReverse : !isReverse);
  const contentCls = $derived(
    [
      'cd-carousel-content',
      `cd-carousel-content-${animation}`,
      contentReverse && 'cd-carousel-content-reverse',
    ]
      .filter(Boolean)
      .join(' '),
  );

  function itemCls(i: number): string {
    const isCurrent = i === current;
    const isPrev = i === getValidIndex(current - 1);
    const isNext = i === getValidIndex(current + 1);
    return [
      'cd-carousel-content-item',
      isPrev && 'cd-carousel-content-item-prev',
      isNext && 'cd-carousel-content-item-next',
      isCurrent && 'cd-carousel-content-item-current',
      isCurrent && 'cd-carousel-content-item-active',
      animation === 'slide' && !isInit && isCurrent && 'cd-carousel-content-item-slide-in',
      animation === 'slide' && !isInit && i === preIndex && 'cd-carousel-content-item-slide-out',
    ]
      .filter(Boolean)
      .join(' ');
  }
  // item 动画 duration = speed。
  const itemStyle = $derived(
    `transition-duration:${speed}ms;animation-duration:${speed}ms;transition-timing-function:ease;animation-timing-function:ease`,
  );

  // 暴露 Methods（对齐 Semi ref API）。
  export function play() {
    userPaused = false;
  }
  export function stop() {
    userPaused = true;
  }
  export { goTo, prev, next };
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  bind:this={rootEl}
  class={rootCls}
  {style}
  role="region"
  aria-roledescription="carousel"
  aria-label={loc().t('Carousel.ariaLabel')}
  tabindex={count > 1 ? 0 : undefined}
  aria-live={isPlaying ? 'off' : 'polite'}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  onfocusin={onFocusIn}
  onfocusout={onFocusOut}
  onkeydown={onKeydown}
>
  <div class={contentCls}>
    {#each slides as slide, i (i)}
      <div
        class={itemCls(i)}
        style={itemStyle}
        role="group"
        aria-roledescription="slide"
        aria-label={loc().t('Carousel.slideLabel', { index: i + 1 })}
        aria-hidden={i !== current || undefined}
        inert={i !== current || undefined}
      >
        {@render slide()}
      </div>
    {/each}
  </div>

  {#if showIndicator && count > 1}
    <div class="cd-carousel-indicator">
      <CarouselIndicator
        type={indicatorType}
        total={count}
        activeIndex={current}
        position={indicatorPosition}
        {trigger}
        size={indicatorSize}
        {theme}
        {onIndicatorChange}
        t={loc().t}
      />
    </div>
  {/if}

  {#if showArrow && count > 1}
    <CarouselArrow type={arrowType} {theme} prev={prev} next={next} {arrowProps} t={loc().t} />
  {/if}

  <!-- WCAG 2.2.2 可见播放/暂停按钮（本库 a11y 增强，Semi 无）。 -->
  {#if autoPlayOn && count > 1}
    <button
      type="button"
      class="cd-carousel-play"
      aria-label={userPaused ? loc().t('Carousel.play') : loc().t('Carousel.pause')}
      aria-pressed={!userPaused}
      onclick={togglePlay}
    >{userPaused ? '▶' : '❚❚'}</button>
  {/if}
</div>

<style>
  /* ============================ Root ============================ */
  .cd-carousel {
    position: relative;
    overflow: hidden;
  }
  .cd-carousel:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--cd-color-primary, currentColor);
  }

  /* ============================ Content ============================ */
  .cd-carousel-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }
  .cd-carousel-content-item {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .cd-carousel-content-item-current {
    z-index: 1;
  }

  /* fade：默认透明，仅 current 可见 */
  .cd-carousel-content-fade > .cd-carousel-content-item {
    opacity: 0;
    transition-property: opacity;
  }
  .cd-carousel-content-fade > .cd-carousel-content-item-current {
    opacity: 1;
  }

  /* slide：非 current 隐藏；进/出走 keyframe */
  .cd-carousel-content-slide > .cd-carousel-content-item:not(.cd-carousel-content-item-current) {
    visibility: hidden;
  }
  .cd-carousel-content-slide .cd-carousel-content-item-slide-out {
    display: block;
    visibility: visible;
    animation-name: cd-carousel-content-item-keyframe-slide-out;
    animation-fill-mode: forwards;
  }
  .cd-carousel-content-slide .cd-carousel-content-item-slide-in {
    display: block;
    animation-name: cd-carousel-content-item-keyframe-slide-in;
    animation-fill-mode: forwards;
  }
  /* reverse：进/出方向取反 */
  .cd-carousel-content-reverse .cd-carousel-content-item-slide-out {
    animation-name: cd-carousel-content-item-keyframe-slide-out-reverse;
    animation-fill-mode: forwards;
  }
  .cd-carousel-content-reverse .cd-carousel-content-item-slide-in {
    animation-name: cd-carousel-content-item-keyframe-slide-in-reverse;
    animation-fill-mode: forwards;
  }

  /* ============================ Indicator ============================ */
  /* type/position/item 相关样式在 CarouselIndicator.svelte（子组件渲染这些元素）。 */
  .cd-carousel-indicator {
    display: flex;
    align-items: flex-end;
    z-index: 2;
  }

  /* ============================ Arrow ============================ */
  /* 全部样式在 CarouselArrow.svelte（子组件渲染这些元素）。 */

  /* ============================ Play/Pause（a11y 增强）============================ */
  .cd-carousel-play {
    position: absolute;
    bottom: var(--cd-spacing-tight);
    left: var(--cd-spacing-tight);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--cd-carousel-width-arrow);
    height: var(--cd-carousel-width-arrow);
    padding: 0;
    border: none;
    border-radius: var(--cd-border-radius-full);
    background: color-mix(in srgb, var(--cd-color-black, #000) 45%, transparent);
    color: var(--cd-color-white, #fff);
    font-size: calc(var(--cd-carousel-width-arrow) * 0.4);
    line-height: 1;
    cursor: pointer;
    z-index: 2;
  }
  .cd-carousel-play:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  /* ============================ Slide keyframes（对齐 Semi）============================ */
  @keyframes cd-carousel-content-item-keyframe-slide-in {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  @keyframes cd-carousel-content-item-keyframe-slide-out {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100%);
    }
  }
  @keyframes cd-carousel-content-item-keyframe-slide-in-reverse {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
  @keyframes cd-carousel-content-item-keyframe-slide-out-reverse {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }

  /* —— RTL（对齐 Semi carousel/rtl.scss）——
     ⚠️ 这里原本写的是 `.cd-carousel:dir(rtl)`，**从来没生效过**：
     `:dir()` 只匹配 HTML 的 `dir` 属性，不认 CSS 的 `direction`；
     而 ConfigProvider 与 Semi 一样只注入 `<div class="cd-rtl">`（不设 dir），
     全站实测 `[dir]` 元素数为 0 → 整段规则是死代码。
     改用 `.cd-rtl` 作用域，与 Semi rtl.scss 的 `.semi-rtl` 同构。
     箭头镜像/指示器 margin 换边随渲染元素迁至 CarouselArrow.svelte / CarouselIndicator.svelte。 */
  :global(.cd-rtl) .cd-carousel {
    direction: rtl;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-carousel-content-item,
    .cd-carousel-content-item-slide-in,
    .cd-carousel-content-item-slide-out {
      animation-duration: 0ms !important;
      transition-duration: 0ms !important;
    }
  }
</style>
