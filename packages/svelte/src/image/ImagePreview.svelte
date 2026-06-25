<!--
  ImagePreview — 预览浮层（portal 到 body）。
  被 Image（单图）与 ImagePreviewGroup（多图）共享，统一缩放/旋转/键盘/导航逻辑。
  红线 #3：portal、keydown 监听、focus 命令式 + cleanup；当前索引由父级以 $state 传入。
  红线 #2：变换/导航可用性派生纯函数。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import { useFocusTrap, useLiveAnnouncer } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  interface PreviewImage {
    src: string;
    alt: string;
  }

  interface Props {
    images: PreviewImage[];
    /** 当前展示的图片索引（受控，由父级 $state 维护）。 */
    current: number;
    onClose: () => void;
    onChange: (index: number) => void;
  }

  let { images, current, onClose, onChange }: Props = $props();

  const loc = useLocale();
  // 单例 live region（polite）：灯箱翻页时播报「第 m 张，共 n 张」（红线 #3：命令式，在切换 effect 内）。
  const announcer = useLiveAnnouncer();

  const count = $derived(images.length);
  const safeIndex = $derived(Math.min(Math.max(current, 0), Math.max(count - 1, 0)));
  const active = $derived(images[safeIndex]);
  const showNav = $derived(count > 1);
  const canPrev = $derived(safeIndex > 0);
  const canNext = $derived(safeIndex < count - 1);

  // 预览变换状态：缩放倍数 + 旋转角度。切换图片时重置（见下方 $effect）。
  let scale = $state(1);
  let rotate = $state(0);
  const SCALE_STEP = 0.25;
  const SCALE_MIN = 0.25;
  const SCALE_MAX = 4;
  const transform = $derived(`scale(${scale}) rotate(${rotate}deg)`);

  function resetTransform() {
    scale = 1;
    rotate = 0;
  }
  function zoomIn() {
    scale = Math.min(SCALE_MAX, scale + SCALE_STEP);
  }
  function zoomOut() {
    scale = Math.max(SCALE_MIN, scale - SCALE_STEP);
  }
  function rotateLeft() {
    rotate -= 90;
  }
  function rotateRight() {
    rotate += 90;
  }

  function goPrev() {
    if (canPrev) onChange(safeIndex - 1);
  }
  function goNext() {
    if (canNext) onChange(safeIndex + 1);
  }

  // 切换到不同图片时把变换复位（每张图从 1x/0° 开始）。
  let lastIndex = $state(untrack(() => safeIndex));
  $effect(() => {
    if (safeIndex !== lastIndex) {
      lastIndex = safeIndex;
      resetTransform();
      // 翻页（上一张/下一张）后 polite 播报当前序号；多图时才有意义。
      if (count > 1) {
        announcer.announce(
          loc().t('Image.previewCount', { index: safeIndex + 1, total: count }),
        );
      }
    }
  });

  // 浮层根节点：portal 到 body + focus trap（焦点锁定灯箱内 + 关闭归还触发元素），
  // 命令式 + cleanup。复用 core useFocusTrap（与 Modal/Drawer 同一原语，不重造）。
  // activate() 会记下打开前的触发元素并聚焦灯箱内首个可聚焦项（关闭按钮）；
  // deactivate() 拦截 Tab 循环、归还焦点给触发元素。
  let overlay = $state<HTMLDivElement | null>(null);
  $effect(() => {
    const node = overlay;
    if (!node) return;
    const body = document.body;
    body.appendChild(node);
    const trap = useFocusTrap(node);
    trap.activate();
    return () => {
      trap.deactivate();
      if (node.parentNode === body) body.removeChild(node);
    };
  });

  // 全局键盘：Esc 关闭、左右切换。命令式绑定 + cleanup 解绑。
  $effect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });

  // 仅点击遮罩自身（非内部图片/按钮）才关闭。
  function onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // 遮罩获得焦点时的键盘兜底（a11y：与 click 配对）；全局键盘在上方 $effect 内统一处理。
  function onOverlayKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }
</script>

<div
  bind:this={overlay}
  class="cd-image__preview"
  role="dialog"
  aria-modal="true"
  aria-label={active?.alt || loc().t('Image.previewAlt')}
  tabindex="-1"
  onclick={onOverlayClick}
  onkeydown={onOverlayKeydown}
>
  <button
    type="button"
    class="cd-image__preview-close"
    aria-label={loc().t('Image.closePreview')}
    onclick={onClose}
  >
    ×
  </button>

  {#if showNav}
    <button
      type="button"
      class="cd-image__preview-nav cd-image__preview-nav--prev"
      aria-label={loc().t('Image.prev')}
      disabled={!canPrev}
      onclick={goPrev}
    >
      ‹
    </button>
    <button
      type="button"
      class="cd-image__preview-nav cd-image__preview-nav--next"
      aria-label={loc().t('Image.next')}
      disabled={!canNext}
      onclick={goNext}
    >
      ›
    </button>
  {/if}

  <img
    class="cd-image__preview-img"
    src={active?.src}
    alt={active?.alt}
    style="transform:{transform}"
  />

  <div class="cd-image__preview-toolbar">
    {#if showNav}
      <span class="cd-image__preview-counter" aria-hidden="true">{safeIndex + 1} / {count}</span>
    {/if}
    <button type="button" class="cd-image__preview-tool" aria-label={loc().t('Image.zoomOut')} onclick={zoomOut}>−</button>
    <button type="button" class="cd-image__preview-tool" aria-label={loc().t('Image.zoomIn')} onclick={zoomIn}>+</button>
    <button type="button" class="cd-image__preview-tool" aria-label={loc().t('Image.rotateLeft')} onclick={rotateLeft}>⟲</button>
    <button type="button" class="cd-image__preview-tool" aria-label={loc().t('Image.rotateRight')} onclick={rotateRight}>⟳</button>
    <button type="button" class="cd-image__preview-tool" aria-label={loc().t('Image.reset')} onclick={resetTransform}>⤢</button>
  </div>
</div>

<style>
  .cd-image__preview {
    position: fixed;
    inset: 0;
    z-index: var(--cd-image-preview-z);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-image-preview-overlay);
    line-height: normal;
  }
  .cd-image__preview-img {
    max-inline-size: 90vw;
    max-block-size: 90vh;
    object-fit: contain;
    transition: transform var(--cd-motion-duration-mid, 0.2s) var(--cd-motion-ease-standard);
  }
  .cd-image__preview-close {
    position: absolute;
    inset-block-start: 16px;
    inset-inline-end: 16px;
    inline-size: 36px;
    block-size: 36px;
    padding: 0;
    border: 0;
    border-radius: var(--cd-radius-full);
    background: var(--cd-image-mask-bg);
    color: var(--cd-image-mask-color);
    font-size: 24px;
    cursor: pointer;
  }
  .cd-image__preview-close:focus-visible {
    outline: var(--cd-focus-ring);
  }

  .cd-image__preview-nav {
    position: absolute;
    inset-block-start: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 44px;
    block-size: 44px;
    padding: 0;
    border: 0;
    border-radius: var(--cd-radius-full);
    background: var(--cd-image-mask-bg);
    color: var(--cd-image-mask-color);
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
  }
  .cd-image__preview-nav--prev {
    inset-inline-start: 16px;
  }
  .cd-image__preview-nav--next {
    inset-inline-end: 16px;
  }
  .cd-image__preview-nav:hover:not(:disabled) {
    background: rgb(255 255 255 / 0.15);
  }
  .cd-image__preview-nav:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .cd-image__preview-nav:focus-visible {
    outline: var(--cd-focus-ring);
  }

  .cd-image__preview-toolbar {
    position: absolute;
    inset-block-end: 24px;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    padding: var(--cd-spacing-2);
    border-radius: var(--cd-radius-full);
    background: var(--cd-image-mask-bg);
  }
  .cd-image__preview-counter {
    padding-inline: var(--cd-spacing-2);
    color: var(--cd-image-mask-color);
    font-size: 13px;
    line-height: 1;
  }
  .cd-image__preview-tool {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 32px;
    block-size: 32px;
    padding: 0;
    border: 0;
    border-radius: var(--cd-radius-full);
    background: transparent;
    color: var(--cd-image-mask-color);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }
  .cd-image__preview-tool:hover {
    background: rgb(255 255 255 / 0.15);
  }
  .cd-image__preview-tool:focus-visible {
    outline: var(--cd-focus-ring);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-image__preview-img {
      transition: none;
    }
  }
</style>
