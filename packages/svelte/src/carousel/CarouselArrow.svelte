<!--
  CarouselArrow — 对齐 Semi `carousel/CarouselArrow.tsx`（独立文件）。
  ⚠️ Semi 根 div 与 prev/next div 三处都拼了 `-{theme}` class（CarouselArrow.tsx
  render 里 classNames/leftClassNames/rightClassNames 各自都带 theme），逐 class 对齐。
  a11y（role=button、tabindex、键盘 Enter/Space、aria-label）为本库增强。
-->
<script lang="ts">
  import { IconChevronLeft, IconChevronRight } from '@chenzy-design/icons';
  import type { CarouselArrowProps } from './interface.js';

  let { type, theme, prev, next, arrowProps, t }: CarouselArrowProps = $props();

  const wrapperCls = $derived(
    ['cd-carousel-arrow', theme && `cd-carousel-arrow-${theme}`, type === 'hover' && 'cd-carousel-arrow-hover']
      .filter(Boolean)
      .join(' '),
  );
  const leftCls = $derived(['cd-carousel-arrow-prev', theme && `cd-carousel-arrow-${theme}`].filter(Boolean).join(' '));
  const rightCls = $derived(
    ['cd-carousel-arrow-next', theme && `cd-carousel-arrow-${theme}`].filter(Boolean).join(' '),
  );

  function handleKeydown(e: KeyboardEvent, action: () => void) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class={wrapperCls}>
  <div
    class={leftCls}
    role="button"
    tabindex={0}
    aria-label={t('Carousel.prev')}
    style={arrowProps?.leftArrow?.props?.style}
    onclick={() => {
      arrowProps?.leftArrow?.props?.onClick?.();
      prev();
    }}
    onkeydown={(e) => handleKeydown(e, prev)}
  >
    {#if arrowProps?.leftArrow?.children}
      {@render arrowProps.leftArrow.children()}
    {:else}
      <IconChevronLeft size="inherit" aria-label="Previous index" />
    {/if}
  </div>
  <div
    class={rightCls}
    role="button"
    tabindex={0}
    aria-label={t('Carousel.next')}
    style={arrowProps?.rightArrow?.props?.style}
    onclick={() => {
      arrowProps?.rightArrow?.props?.onClick?.();
      next();
    }}
    onkeydown={(e) => handleKeydown(e, next)}
  >
    {#if arrowProps?.rightArrow?.children}
      {@render arrowProps.rightArrow.children()}
    {:else}
      <IconChevronRight size="inherit" aria-label="Next index" />
    {/if}
  </div>
</div>

<style>
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

  /* arrowType=hover：默认隐藏，悬停/键盘 focus 容器时显示。
     `.cd-carousel` 是父组件 Carousel.svelte 的根节点，须 :global() 跨组件命中祖先。 */
  .cd-carousel-arrow-hover > div {
    z-index: 2;
    opacity: 0;
  }
  :global(.cd-carousel):hover .cd-carousel-arrow-hover > div,
  :global(.cd-carousel):focus-within .cd-carousel-arrow-hover > div {
    opacity: 1;
  }

  /* —— RTL（对齐 Semi carousel/rtl.scss）：方向翻转、箭头镜像 —— */
  :global(.cd-rtl) .cd-carousel-arrow {
    flex-direction: row-reverse;
  }
  :global(.cd-rtl) .cd-carousel-arrow-prev {
    left: auto;
    right: var(--cd-carousel-spacing-arrow-right);
    transform: scaleX(-1) translateY(-50%);
  }
  :global(.cd-rtl) .cd-carousel-arrow-next {
    right: auto;
    left: var(--cd-carousel-spacing-arrow-left);
    transform: scaleX(-1) translateY(-50%);
  }
</style>
