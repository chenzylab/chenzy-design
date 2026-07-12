<!--
  Carousel — 走马灯。DOM 结构、动画机制、API 契约逐项对齐 Semi Design
  （@douyinfe/semi-ui/carousel）。

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

  a11y 增强（Semi 未覆盖，本库补全，不破坏三段式结构）：
    键盘 ←/→/Home/End、live announcer、reduced-motion、可见播放/暂停按钮（WCAG 2.2.2）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useLiveAnnouncer } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Animation = 'slide' | 'fade';
  type IndicatorType = 'dot' | 'line' | 'columnar';
  type IndicatorPosition = 'left' | 'center' | 'right';
  type IndicatorSize = 'small' | 'medium';
  type Theme = 'primary' | 'light' | 'dark';
  type ArrowType = 'hover' | 'always';
  type SlideDirection = 'left' | 'right';
  type TriggerType = 'hover' | 'click';

  /** autoPlay 对象形式：{ interval?, hoverToPause? }（对齐 Semi）。 */
  type AutoPlayConfig = { interval?: number; hoverToPause?: boolean };

  /** 单个箭头自定义：props 透传到箭头 div，children 覆盖默认 Icon（对齐 Semi ArrowButton）。 */
  interface ArrowButton {
    props?: Record<string, unknown> & { onClick?: () => void; style?: string; class?: string };
    children?: Snippet;
  }

  interface Props {
    /** 每项一张幻灯片的 Snippet 数组（对齐 Semi children）。 */
    slides?: Snippet[];
    /** 受控当前激活索引（Semi API: activeIndex）。 */
    activeIndex?: number;
    /** 非受控初始索引。 */
    defaultActiveIndex?: number;
    /** 自动播放；布尔或 { interval?, hoverToPause? }（默认 true，对齐 Semi）。 */
    autoPlay?: boolean | AutoPlayConfig;
    /** 切换动画。 */
    animation?: Animation;
    /** 切换速度（ms）。 */
    speed?: number;
    /** 是否展示指示器。 */
    showIndicator?: boolean;
    /** 指示器类型：dot / line / columnar。 */
    indicatorType?: IndicatorType;
    /** 指示器位置：left / center / right。 */
    indicatorPosition?: IndicatorPosition;
    /** 指示器尺寸：small / medium。 */
    indicatorSize?: IndicatorSize;
    /** 是否展示箭头。 */
    showArrow?: boolean;
    /** 箭头展示时机：hover 悬停显示 / always 始终显示。 */
    arrowType?: ArrowType;
    /** 自定义箭头内容与点击回调。 */
    arrowProps?: {
      leftArrow?: ArrowButton;
      rightArrow?: ArrowButton;
    };
    /** 指示器与箭头主题：primary / light / dark（默认 light，对齐 Semi）。 */
    theme?: Theme;
    /** animation=slide 时的滑动方向：left / right。 */
    slideDirection?: SlideDirection;
    /** 指示器触发切换的交互方式：click / hover。 */
    trigger?: TriggerType;
    /** 索引变更回调（对齐 Semi：index, preIndex）。 */
    onChange?: (index: number, preIndex: number) => void;
    /** 根元素内联样式（对齐 Semi style；常用于设定宽高）。 */
    style?: string;
    class?: string;
  }

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
    const rtl = rootEl?.matches(':dir(rtl)') ?? false;
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

  function onMouseEnter() {
    if (resolvedHoverToPause) paused = true;
  }
  function onMouseLeave() {
    if (resolvedHoverToPause) paused = false;
  }
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

  const indicatorWrapperCls = $derived(
    ['cd-carousel-indicator', `cd-carousel-indicator-${indicatorType}`, `cd-carousel-indicator-${indicatorPosition}`]
      .filter(Boolean)
      .join(' '),
  );
  function indicatorItemCls(i: number): string {
    return [
      'cd-carousel-indicator-item',
      i === current && 'cd-carousel-indicator-item-active',
      `cd-carousel-indicator-item-${theme}`,
      `cd-carousel-indicator-item-${indicatorSize}`,
    ]
      .filter(Boolean)
      .join(' ');
  }

  const arrowCls = $derived(
    ['cd-carousel-arrow', arrowType === 'hover' && 'cd-carousel-arrow-hover'].filter(Boolean).join(' '),
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
      <div class={indicatorWrapperCls} role="tablist" aria-label={loc().t('Carousel.indicators')}>
        {#each slides as _s, i (i)}
          <span
            class={indicatorItemCls(i)}
            data-index={i}
            role="tab"
            tabindex={0}
            aria-selected={i === current}
            aria-label={loc().t('Carousel.slideLabel', { index: i + 1 })}
            onclick={trigger === 'click' ? () => onIndicatorChange(i) : undefined}
            onmouseenter={trigger === 'hover' ? () => onIndicatorChange(i) : undefined}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onIndicatorChange(i);
              }
            }}
          ></span>
        {/each}
      </div>
    </div>
  {/if}

  {#if showArrow && count > 1}
    <div class={arrowCls}>
      <div
        class={`cd-carousel-arrow-prev cd-carousel-arrow-${theme}`}
        role="button"
        tabindex={0}
        aria-label={loc().t('Carousel.prev')}
        onclick={() => {
          arrowProps?.leftArrow?.props?.onClick?.();
          prev();
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            prev();
          }
        }}
        style={arrowProps?.leftArrow?.props?.style}
      >
        {#if arrowProps?.leftArrow?.children}
          {@render arrowProps.leftArrow.children()}
        {:else}
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        {/if}
      </div>
      <div
        class={`cd-carousel-arrow-next cd-carousel-arrow-${theme}`}
        role="button"
        tabindex={0}
        aria-label={loc().t('Carousel.next')}
        onclick={() => {
          arrowProps?.rightArrow?.props?.onClick?.();
          next();
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            next();
          }
        }}
        style={arrowProps?.rightArrow?.props?.style}
      >
        {#if arrowProps?.rightArrow?.children}
          {@render arrowProps.rightArrow.children()}
        {:else}
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        {/if}
      </div>
    </div>
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
  .cd-carousel-indicator {
    display: flex;
    align-items: flex-end;
    z-index: 2;
  }
  .cd-carousel-indicator-left {
    position: absolute;
    left: var(--cd-carousel-spacing-indicator-padding);
    bottom: var(--cd-carousel-spacing-indicator-padding);
  }
  .cd-carousel-indicator-center {
    position: absolute;
    left: 50%;
    bottom: var(--cd-carousel-spacing-indicator-padding);
    transform: translate(-50%);
  }
  .cd-carousel-indicator-right {
    position: absolute;
    right: var(--cd-carousel-spacing-indicator-padding);
    bottom: var(--cd-carousel-spacing-indicator-padding);
  }
  .cd-carousel-indicator-item {
    cursor: pointer;
  }
  .cd-carousel-indicator-item:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  /* dot */
  .cd-carousel-indicator-dot .cd-carousel-indicator-item {
    border-radius: var(--cd-carousel-radius-indicator-dot);
  }
  .cd-carousel-indicator-dot .cd-carousel-indicator-item:not(:last-child) {
    margin-right: var(--cd-carousel-spacing-indicator-dot-marginx);
  }
  .cd-carousel-indicator-dot .cd-carousel-indicator-item-small {
    width: var(--cd-carousel-width-indicator-dot-small);
    height: var(--cd-carousel-width-indicator-dot-small);
  }
  .cd-carousel-indicator-dot .cd-carousel-indicator-item-medium {
    width: var(--cd-carousel-width-indicator-dot-medium);
    height: var(--cd-carousel-width-indicator-dot-medium);
  }

  /* line */
  .cd-carousel-indicator-line {
    width: var(--cd-carousel-width-indicator-line);
  }
  .cd-carousel-indicator-line .cd-carousel-indicator-item {
    flex: 1;
  }
  .cd-carousel-indicator-line .cd-carousel-indicator-item:not(:last-child) {
    margin-right: var(--cd-carousel-spacing-indicator-line-marginx);
  }
  .cd-carousel-indicator-line .cd-carousel-indicator-item-small {
    height: var(--cd-carousel-height-indicator-line-small);
  }
  .cd-carousel-indicator-line .cd-carousel-indicator-item-medium {
    height: var(--cd-carousel-height-indicator-line-medium);
  }

  /* columnar */
  .cd-carousel-indicator-columnar .cd-carousel-indicator-item {
    cursor: pointer;
  }
  .cd-carousel-indicator-columnar .cd-carousel-indicator-item:not(:last-child) {
    margin-right: var(--cd-carousel-spacing-indicator-columnar-marginx);
  }
  .cd-carousel-indicator-columnar .cd-carousel-indicator-item-small {
    width: var(--cd-carousel-width-indicator-columnar-small);
    height: var(--cd-carousel-height-indicator-columnar-small-default);
  }
  .cd-carousel-indicator-columnar .cd-carousel-indicator-item-small.cd-carousel-indicator-item-active {
    height: var(--cd-carousel-height-indicator-columnar-small-active);
  }
  .cd-carousel-indicator-columnar .cd-carousel-indicator-item-medium {
    width: var(--cd-carousel-width-indicator-columnar-medium);
    height: var(--cd-carousel-height-indicator-columnar-medium-default);
  }
  .cd-carousel-indicator-columnar .cd-carousel-indicator-item-medium.cd-carousel-indicator-item-active {
    height: var(--cd-carousel-height-indicator-columnar-medium-active);
  }

  /* 指示器主题（三档 × 默认/悬浮/选中） */
  .cd-carousel-indicator-item-primary {
    background-color: var(--cd-carousel-color-indicator-theme-primary-bg-default);
    transition: background-color var(--cd-carousel-animation-transition-duration)
      var(--cd-carousel-animation-transition-function) var(--cd-carousel-animation-transition-delay);
  }
  .cd-carousel-indicator-item-primary.cd-carousel-indicator-item-active {
    background: var(--cd-carousel-color-indicator-theme-primary-bg-active);
  }
  .cd-carousel-indicator-item-primary:hover {
    background-color: var(--cd-carousel-color-indicator-theme-primary-bg-hover);
  }
  .cd-carousel-indicator-item-primary:active {
    background: var(--cd-carousel-color-indicator-theme-primary-bg-active);
  }

  .cd-carousel-indicator-item-light {
    background-color: var(--cd-carousel-color-indicator-theme-light-bg-default);
    transition: background-color var(--cd-carousel-animation-transition-duration)
      var(--cd-carousel-animation-transition-function) var(--cd-carousel-animation-transition-delay);
  }
  .cd-carousel-indicator-item-light.cd-carousel-indicator-item-active {
    background: var(--cd-carousel-color-indicator-theme-light-bg-active);
  }
  .cd-carousel-indicator-item-light:hover {
    background-color: var(--cd-carousel-color-indicator-theme-light-bg-hover);
  }
  .cd-carousel-indicator-item-light:active {
    background: var(--cd-carousel-color-indicator-theme-light-bg-active);
  }

  .cd-carousel-indicator-item-dark {
    background-color: var(--cd-carousel-color-indicator-theme-dark-bg-default);
    transition: background-color var(--cd-carousel-animation-transition-duration)
      var(--cd-carousel-animation-transition-function) var(--cd-carousel-animation-transition-delay);
  }
  .cd-carousel-indicator-item-dark.cd-carousel-indicator-item-active {
    background-color: var(--cd-carousel-color-indicator-theme-dark-bg-active);
  }
  .cd-carousel-indicator-item-dark:hover {
    background-color: var(--cd-carousel-color-indicator-theme-dark-bg-hover);
  }
  .cd-carousel-indicator-item-dark:active {
    background: var(--cd-carousel-color-indicator-theme-dark-bg-active);
  }

  /* ============================ Arrow ============================ */
  .cd-carousel-arrow {
    display: flex;
    font-size: var(--cd-carousel-width-arrow);
    cursor: pointer;
  }
  .cd-carousel-arrow-prev {
    position: absolute;
    top: 50%;
    left: var(--cd-carousel-spacing-arrow-left);
    transform: translateY(-50%);
    z-index: 2;
  }
  .cd-carousel-arrow-next {
    position: absolute;
    top: 50%;
    right: var(--cd-carousel-spacing-arrow-right);
    transform: translateY(-50%);
    z-index: 2;
  }
  .cd-carousel-arrow-prev:focus-visible,
  .cd-carousel-arrow-next:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }

  .cd-carousel-arrow-light {
    color: var(--cd-carousel-color-arrow-theme-light-bg-default);
    transition: color var(--cd-carousel-animation-transition-duration)
      var(--cd-carousel-animation-transition-function) var(--cd-carousel-animation-transition-delay);
  }
  .cd-carousel-arrow-light:hover {
    color: var(--cd-carousel-color-arrow-theme-light-bg-hover);
  }
  .cd-carousel-arrow-primary {
    color: var(--cd-carousel-color-arrow-theme-primary-bg-default);
    transition: color var(--cd-carousel-animation-transition-duration)
      var(--cd-carousel-animation-transition-function) var(--cd-carousel-animation-transition-delay);
  }
  .cd-carousel-arrow-primary:hover {
    color: var(--cd-carousel-color-arrow-theme-primary-bg-hover);
  }
  .cd-carousel-arrow-dark {
    color: var(--cd-carousel-color-arrow-theme-dark-bg-default);
    transition: color var(--cd-carousel-animation-transition-duration)
      var(--cd-carousel-animation-transition-function) var(--cd-carousel-animation-transition-delay);
  }
  .cd-carousel-arrow-dark:hover {
    color: var(--cd-carousel-color-arrow-theme-dark-bg-hover);
  }

  /* arrowType=hover：默认隐藏，悬停 carousel 时显示 */
  .cd-carousel-arrow-hover > div {
    z-index: 2;
    opacity: 0;
  }
  .cd-carousel:hover .cd-carousel-arrow-hover > div,
  .cd-carousel:focus-within .cd-carousel-arrow-hover > div {
    opacity: 1;
  }

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

  /* RTL（对齐 Semi rtl.scss）：方向翻转、箭头镜像、指示器 margin 换边 */
  .cd-carousel:dir(rtl) .cd-carousel-arrow {
    flex-direction: row-reverse;
  }
  .cd-carousel:dir(rtl) .cd-carousel-arrow-prev {
    left: auto;
    right: var(--cd-carousel-spacing-arrow-right);
    transform: scaleX(-1) translateY(-50%);
  }
  .cd-carousel:dir(rtl) .cd-carousel-arrow-next {
    right: auto;
    left: var(--cd-carousel-spacing-arrow-left);
    transform: scaleX(-1) translateY(-50%);
  }
  .cd-carousel:dir(rtl) .cd-carousel-indicator-dot .cd-carousel-indicator-item:not(:last-child),
  .cd-carousel:dir(rtl) .cd-carousel-indicator-columnar .cd-carousel-indicator-item:not(:last-child) {
    margin-right: 0;
  }
  .cd-carousel:dir(rtl) .cd-carousel-indicator-dot .cd-carousel-indicator-item:not(:last-child) {
    margin-left: var(--cd-carousel-spacing-indicator-dot-marginx);
  }
  .cd-carousel:dir(rtl) .cd-carousel-indicator-columnar .cd-carousel-indicator-item:not(:last-child) {
    margin-left: var(--cd-carousel-spacing-indicator-columnar-marginx);
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
