<!--
  CarouselIndicator — 对齐 Semi `carousel/CarouselIndicator.tsx`（独立文件）。
  渲染 total 个指示点，click/hover 触发 onIndicatorChange。
  a11y（role=tablist/tab、键盘 Enter/Space、aria-selected/aria-label）为本库增强，
  不破坏与 Semi 一致的 DOM/class 结构。
-->
<script lang="ts">
  import type { CarouselIndicatorProps } from './interface.js';

  let { type, total, activeIndex, position, trigger, size, theme, onIndicatorChange, t }: CarouselIndicatorProps =
    $props();

  function handleIndicatorClick(index: number) {
    if (trigger === 'click') onIndicatorChange(index);
  }
  function handleIndicatorHover(index: number) {
    if (trigger === 'hover') onIndicatorChange(index);
  }
  function handleKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onIndicatorChange(index);
    }
  }

  const wrapperCls = $derived(
    ['cd-carousel-indicator', `cd-carousel-indicator-${type}`, `cd-carousel-indicator-${position}`]
      .filter(Boolean)
      .join(' '),
  );
  function itemCls(i: number): string {
    return [
      'cd-carousel-indicator-item',
      i === activeIndex && 'cd-carousel-indicator-item-active',
      theme && `cd-carousel-indicator-item-${theme}`,
      size && `cd-carousel-indicator-item-${size}`,
    ]
      .filter(Boolean)
      .join(' ');
  }
</script>

<div class={wrapperCls} role="tablist" aria-label={t('Carousel.indicators')}>
  {#each { length: total } as _, i (i)}
    <span
      class={itemCls(i)}
      data-index={i}
      role="tab"
      tabindex={0}
      aria-selected={i === activeIndex}
      aria-label={t('Carousel.slideLabel', { index: i + 1 })}
      onclick={() => handleIndicatorClick(i)}
      onmouseenter={() => handleIndicatorHover(i)}
      onkeydown={(e) => handleKeydown(e, i)}
    ></span>
  {/each}
</div>

<style>
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

  /* —— RTL（对齐 Semi carousel/rtl.scss）：指示器 margin 换边 ——
     祖先 `.cd-rtl` 在父组件 Carousel.svelte 的根节点之外，须 :global() 跨组件命中。 */
  :global(.cd-rtl) .cd-carousel-indicator-dot .cd-carousel-indicator-item:not(:last-child),
  :global(.cd-rtl) .cd-carousel-indicator-columnar .cd-carousel-indicator-item:not(:last-child) {
    margin-right: 0;
  }
  :global(.cd-rtl) .cd-carousel-indicator-dot .cd-carousel-indicator-item:not(:last-child) {
    margin-left: var(--cd-carousel-spacing-indicator-dot-marginx);
  }
  :global(.cd-rtl) .cd-carousel-indicator-columnar .cd-carousel-indicator-item:not(:last-child) {
    margin-left: var(--cd-carousel-spacing-indicator-columnar-marginx);
  }
</style>
