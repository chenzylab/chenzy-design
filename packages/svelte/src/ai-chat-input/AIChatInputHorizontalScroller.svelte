<!--
  AIChatInputHorizontalScroller — 横向滚动容器（1:1 对齐 Semi horizontalScroller.tsx）。

  逻辑照搬 Semi：ResizeObserver + scroll 监听重算左右可滚性，条件渲染左右圆形按钮，
  点击 scrollBy ±SCROLL_AMOUNT（300px）且 behavior:'smooth'。
  左按钮复用同一个 IconChevronRightStroked，靠 -scroll-button-left-icon 的 rotate(180deg)
  翻转（Semi 亦如此，不另引左向图标）。

  Semi 判定阈值也逐字照搬：canScrollLeft = scrollLeft > 1（非 > 0，容忍亚像素），
  canScrollRight = Math.ceil(scrollLeft) < scrollWidth - clientWidth。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconChevronRightStroked } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** 滚动区内容。 */
    children: Snippet;
  }

  let { children }: Props = $props();

  const loc = useLocale();

  /** 单次点击的滚动距离（对齐 Semi numbers.SCROLL_AMOUNT）。 */
  const SCROLL_AMOUNT = 300;

  let container = $state<HTMLDivElement | null>(null);
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function checkScrollAbility(): void {
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    canScrollLeft = scrollLeft > 1;
    canScrollRight = Math.ceil(scrollLeft) < scrollWidth - clientWidth;
  }

  $effect(() => {
    const el = container;
    if (!el) return;
    checkScrollAbility();
    const ro = new ResizeObserver(checkScrollAbility);
    ro.observe(el);
    el.addEventListener('scroll', checkScrollAbility);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', checkScrollAbility);
    };
  });

  function scrollBy(amount: number): void {
    container?.scrollBy({ left: amount, behavior: 'smooth' });
  }
</script>

<div class="cd-ai-chat-input-scroll-wrapper">
  {#if canScrollLeft}
    <button
      type="button"
      class="cd-ai-chat-input-scroll-button cd-ai-chat-input-scroll-button-left"
      aria-label={loc().t('AIChatInput.scrollLeft')}
      onclick={() => scrollBy(-SCROLL_AMOUNT)}
    >
      <IconChevronRightStroked class="cd-ai-chat-input-scroll-button-left-icon" />
    </button>
  {/if}
  <div class="cd-ai-chat-input-scroll-container" bind:this={container}>
    {@render children()}
  </div>
  {#if canScrollRight}
    <button
      type="button"
      class="cd-ai-chat-input-scroll-button cd-ai-chat-input-scroll-button-right"
      aria-label={loc().t('AIChatInput.scrollRight')}
      onclick={() => scrollBy(SCROLL_AMOUNT)}
    >
      <IconChevronRightStroked />
    </button>
  {/if}
</div>

<style>
  /* 逐条对齐 Semi aiChatInput.scss &-scroll-wrapper / -container / -button */
  .cd-ai-chat-input-scroll-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: var(--cd-ai-chat-input-attachment-scroll-wrapper-marginBottom);
  }

  .cd-ai-chat-input-scroll-container {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    /* 隐藏滚动条 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE / Edge */
    column-gap: var(--cd-ai-chat-input-attachment-scroll-container-columnGap);
    /* Semi $spacing-aiChatInput_attachment_scroll_container：滚动区自身内间距。 */
    padding: var(--cd-spacing-ai-chat-input-attachment-scroll-container);
  }

  .cd-ai-chat-input-scroll-container::-webkit-scrollbar {
    display: none;
  }

  .cd-ai-chat-input-scroll-button {
    padding: 0;
    border: 0;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: var(--cd-z-ai-chat-input-attachment-scroll-button);
    width: var(--cd-ai-chat-input-attachment-scroll-button-width);
    height: var(--cd-ai-chat-input-attachment-scroll-button-width);
    border-radius: 50%;
    background: var(--cd-ai-chat-input-attachment-scroll-button-bg);
    box-shadow: var(--cd-ai-chat-input-attachment-scroll-button-shadow);

    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition:
      background-color 0.2s,
      box-shadow 0.2s;
  }

  .cd-ai-chat-input-scroll-button :global(.cd-icon) {
    font-size: var(--cd-ai-chat-input-attachment-scroll-button-icon-width);
    color: var(--cd-ai-chat-input-attachment-scroll-button-color);
  }

  .cd-ai-chat-input-scroll-button:active {
    transform: translateY(-50%) scale(0.95);
  }

  .cd-ai-chat-input-scroll-button :global(.cd-ai-chat-input-scroll-button-left-icon) {
    transform: rotate(180deg);
  }

  /* Semi 用物理属性 left/right 钉左右按钮；RTL 由容器 direction 自然处理内容顺序，
     按钮锚点保持物理侧（与 Semi 一致）。 */
  .cd-ai-chat-input-scroll-button-left {
    left: var(--cd-ai-chat-input-attachment-scroll-button-offsetX);
  }

  .cd-ai-chat-input-scroll-button-right {
    right: var(--cd-ai-chat-input-attachment-scroll-button-offsetX);
  }
</style>
