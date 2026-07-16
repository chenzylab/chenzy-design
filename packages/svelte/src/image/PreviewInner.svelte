<!--
  PreviewInner — 预览浮层核心（对齐 Semi image/previewInner.tsx + previewInnerFoundation）。
  职责：portal 到 getPopupContainer/body、scroll-lock、focus-trap、键盘(Esc/←/→)、
    滚轮缩放(passive:false，以指针为锚)、遮罩点击关闭(移动<5px 容错)、工具栏无操作自动隐藏、
    中部左右切换、Header/PreviewImage/Footer 编排、预加载(preloadGap/single)。
  红线 #3：portal / wheel / keydown / scroll-lock 命令式 + cleanup。
  红线 #1：visible/currentIndex 受控不回写，仅经 onVisibleChange/onChange 回调。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useFocusTrap, useScrollLock, useLiveAnnouncer } from '@chenzy-design/core';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { IconArrowLeft, IconArrowRight } from '@chenzy-design/icons';
  import PreviewImage from './PreviewImage.svelte';
  import PreviewHeader from './PreviewHeader.svelte';
  import PreviewFooter, { type MenuProps } from './PreviewFooter.svelte';
  import { clampZoom, getPreloadImageArr } from './previewGeometry.js';
  import { downloadImage, defaultDownloadName } from './download.js';

  type RatioType = 'adaptation' | 'realSize';

  interface PreviewTitleItem {
    src: string;
    title?: string | Snippet;
  }

  interface Props {
    visible?: boolean | undefined;
    /** 预览图源列表（组内已展平）。 */
    src?: string[] | undefined;
    /** 每图对应 title（组内自 previewTitle 收集）。 */
    titles?: (string | Snippet | undefined)[];
    currentIndex?: number | undefined;
    maskClosable?: boolean | undefined;
    closable?: boolean | undefined;
    closeOnEsc?: boolean | undefined;
    infinite?: boolean | undefined;
    zoomStep?: number | undefined;
    maxZoom?: number | undefined;
    minZoom?: number | undefined;
    initialZoom?: number | undefined;
    preLoad?: boolean | undefined;
    preLoadGap?: number | undefined;
    disableDownload?: boolean | undefined;
    showTooltip?: boolean | undefined;
    viewerVisibleDelay?: number | undefined;
    zIndex?: number | undefined;
    crossOrigin?: 'anonymous' | 'use-credentials' | undefined;
    prevTip?: string | undefined;
    nextTip?: string | undefined;
    zoomInTip?: string | undefined;
    zoomOutTip?: string | undefined;
    rotateTip?: string | undefined;
    downloadTip?: string | undefined;
    adaptiveTip?: string | undefined;
    originTip?: string | undefined;
    className?: string | undefined;
    style?: string | undefined;
    getPopupContainer?: (() => HTMLElement | null) | undefined;
    setDownloadName?: ((src: string) => string) | undefined;
    renderHeader?: Snippet<[string | Snippet | undefined]> | undefined;
    renderPreviewMenu?: Snippet<[MenuProps]> | undefined;
    renderCloseIcon?: Snippet | undefined;
    renderLeftIcon?: Snippet | undefined;
    renderRightIcon?: Snippet | undefined;
    onVisibleChange?: ((visible: boolean) => void) | undefined;
    onChange?: ((index: number) => void) | undefined;
    onClose?: (() => void) | undefined;
    onZoomIn?: ((zoom: number) => void) | undefined;
    onZoomOut?: ((zoom: number) => void) | undefined;
    onPrev?: ((index: number) => void) | undefined;
    onNext?: ((index: number) => void) | undefined;
    onRotateLeft?: ((angle: number) => void) | undefined;
    onRatioChange?: ((type: RatioType) => void) | undefined;
    onDownload?: ((src: string, index: number) => void) | undefined;
    onDownloadError?: ((src: string) => void) | undefined;
  }

  let {
    visible = false,
    src = [],
    titles = [],
    currentIndex = 0,
    maskClosable = true,
    closable = true,
    closeOnEsc = true,
    infinite = false,
    zoomStep = 0.1,
    maxZoom = 5,
    minZoom = 0.1,
    initialZoom,
    preLoad = true,
    preLoadGap = 2,
    disableDownload = false,
    showTooltip = false,
    viewerVisibleDelay = 10000,
    zIndex = 1070,
    crossOrigin,
    prevTip,
    nextTip,
    zoomInTip,
    zoomOutTip,
    rotateTip,
    downloadTip,
    adaptiveTip,
    originTip,
    className = '',
    style = '',
    getPopupContainer,
    setDownloadName,
    renderHeader,
    renderPreviewMenu,
    renderCloseIcon,
    renderLeftIcon,
    renderRightIcon,
    onVisibleChange,
    onChange,
    onClose,
    onZoomIn,
    onZoomOut,
    onPrev,
    onNext,
    onRotateLeft,
    onRatioChange,
    onDownload,
    onDownloadError,
  }: Props = $props();

  const loc = useLocale();
  const announcer = useLiveAnnouncer();
  const globalPopupContainer = getGlobalPopupContainer();

  // ---- 预览态（受控索引由父下发；zoom/rotation/ratio/viewer 为本地态）----
  let zoom = $state(0.1);
  let rotation = $state(0);
  let ratio = $state<RatioType>('adaptation');
  let viewerVisible = $state(true);
  let direction = $state('');
  const imgLoadStatus = new Map<string, boolean>();

  const total = $derived(src.length);
  const showPrev = $derived(total !== 1 && (infinite || currentIndex !== 0));
  const showNext = $derived(total !== 1 && (infinite || currentIndex !== total - 1));
  const activeSrc = $derived(src[currentIndex]);
  const activeTitle = $derived(titles[currentIndex]);

  let previewImageRef = $state<PreviewImage | null>(null);
  let overlayEl = $state<HTMLDivElement | null>(null);
  let startMouseDown = { x: 0, y: 0 };
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  // ---- 工具栏无操作自动隐藏 ----
  function clearTimer() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }
  function updateTimer() {
    clearTimer();
    hideTimer = setTimeout(() => {
      if (untrack(() => viewerVisible)) viewerVisible = false;
    }, viewerVisibleDelay);
  }

  // 是否命中操作区（header/footer/左右切换）——命中则不关闭、且拖拽不隐藏工具栏。
  function isOperationTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    let el: Node | null = target;
    while (el && el !== overlayEl) {
      if (
        el instanceof HTMLElement &&
        (el.classList.contains('cd-image-preview-header') ||
          el.classList.contains('cd-image-preview-footer') ||
          el.classList.contains('cd-image-preview-icon'))
      ) {
        return true;
      }
      el = el.parentNode;
    }
    return false;
  }

  // ---- 缩放 ----
  function handleZoomImage(newZoom: number, notify = true, wheel?: { offsetX: number; offsetY: number; onImage: boolean } | null) {
    const next = clampZoom(newZoom, minZoom, maxZoom);
    if (next !== zoom) {
      if (notify) {
        if (next > zoom) onZoomIn?.(next);
        else onZoomOut?.(next);
      }
      previewImageRef?.changeZoom(next, wheel ?? null);
      zoom = next;
    }
  }

  function handleWheel(e: WheelEvent) {
    let next: number | undefined;
    if (e.deltaY < 0 && zoom + zoomStep <= maxZoom) {
      next = Number((zoom + zoomStep).toFixed(2));
    } else if (e.deltaY > 0 && zoom - zoomStep >= minZoom) {
      next = Number((zoom - zoomStep).toFixed(2));
    }
    if (next !== undefined) {
      const onImage = e.target === previewImageEl();
      handleZoomImage(next, true, { offsetX: (e as any).offsetX, offsetY: (e as any).offsetY, onImage });
    }
    e.preventDefault();
  }

  function previewImageEl(): HTMLImageElement | null {
    return overlayEl?.querySelector('.cd-image-preview-image-img') ?? null;
  }

  // ---- 切换 ----
  function switchImage(dir: 'prev' | 'next') {
    const step = dir === 'prev' ? -1 : 1;
    const newIndex = (currentIndex + step + total) % total;
    onChange?.(newIndex);
    if (dir === 'prev') onPrev?.(newIndex);
    else onNext?.(newIndex);
    direction = dir;
    rotation = 0;
    if (total > 1) {
      announcer.announce(loc().t('Image.previewCount', { index: newIndex + 1, total }));
    }
  }

  // ---- 旋转 / 比例 / 下载 / 关闭 ----
  function rotate(dir: string) {
    const ROTATE_STEP = 90;
    rotation += dir === 'left' ? -ROTATE_STEP : ROTATE_STEP;
    onRotateLeft?.(rotation);
  }
  function adjustRatio(type: RatioType) {
    ratio = type;
    onRatioChange?.(type);
  }
  function handleDownload() {
    const downloadSrc = src[currentIndex];
    if (!downloadSrc) return;
    const name = setDownloadName ? setDownloadName(downloadSrc) : defaultDownloadName(downloadSrc);
    downloadImage(downloadSrc, name, onDownloadError);
    onDownload?.(downloadSrc, currentIndex);
  }
  function requestClose() {
    onVisibleChange?.(false);
    onClose?.();
  }

  // ---- 遮罩鼠标交互（拖拽容错关闭 + 工具栏唤起）----
  function onOverlayMouseDown(e: MouseEvent) {
    startMouseDown = { x: e.clientX, y: e.clientY };
  }
  function onOverlayMouseUp(e: MouseEvent) {
    let couldClose = !isOperationTarget(e.target);
    if (Math.abs(e.clientX - startMouseDown.x) > 5 || Math.abs(e.clientY - startMouseDown.y) > 5) {
      couldClose = false;
    }
    if (couldClose && maskClosable) onVisibleChange?.(false);
  }
  let lastMove = 0;
  function onOverlayMouseMove(e: MouseEvent) {
    // 简易节流（50ms，对齐 Semi throttle）。
    const now = Date.now === undefined ? 0 : Date.now();
    if (now - lastMove < 50) return;
    lastMove = now;
    if (!isOperationTarget(e.target)) {
      if (!viewerVisible) viewerVisible = true;
      updateTimer();
    } else {
      clearTimer();
    }
  }

  // ---- 预加载 ----
  function preloadGapImages() {
    if (!preLoad || typeof preLoadGap !== 'number' || preLoadGap < 1) return;
    const arr = getPreloadImageArr(src, currentIndex, preLoadGap, infinite);
    if (arr.length === 0) return;
    const img = new Image();
    let idx = 0;
    const next = () => {
      idx++;
      if (idx < arr.length) img.src = arr[idx] as string;
    };
    img.onload = () => {
      imgLoadStatus.set(img.src, true);
      next();
    };
    img.onerror = next;
    img.src = arr[0] as string;
  }
  function preloadSingle() {
    if (!preLoad || typeof preLoadGap !== 'number' || preLoadGap < 1) return;
    let idx = currentIndex + (direction === 'prev' ? -1 : 1) * preLoadGap;
    if (idx < 0 || idx >= src.length) {
      if (infinite) idx = (idx + src.length) % src.length;
      else return;
    }
    const target = src[idx];
    if (target && !imgLoadStatus.get(target)) {
      const img = new Image();
      img.onload = () => imgLoadStatus.set(target, true);
      img.src = target;
    }
  }
  let preloadAfterVisible = true;
  function onImageLoad(loadedSrc: string) {
    imgLoadStatus.set(loadedSrc, true);
    if (preloadAfterVisible) {
      preloadGapImages();
      preloadAfterVisible = false;
    } else {
      preloadSingle();
    }
  }
  function onImageError() {
    preloadSingle();
  }

  // ---- 键盘 ----
  function onKeydown(e: KeyboardEvent) {
    if (closeOnEsc && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      requestClose();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (showPrev) switchImage('prev');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (showNext) switchImage('next');
    }
  }

  // 打开时重置预览态（对齐 Semi getDerivedStateFromProps visible true 分支）。
  let lastVisible = $state(untrack(() => visible));
  $effect(() => {
    if (visible !== lastVisible) {
      lastVisible = visible;
      if (visible) {
        preloadAfterVisible = true;
        viewerVisible = true;
        rotation = 0;
        ratio = 'adaptation';
      }
    }
  });

  // 切换图片时 ratio 复位 adaptation（对齐 Semi currentIndex 分支）。
  let lastIndex = $state(untrack(() => currentIndex));
  $effect(() => {
    if (currentIndex !== lastIndex) {
      lastIndex = currentIndex;
      ratio = 'adaptation';
    }
  });

  // portal + scroll-lock + focus-trap + keydown（命令式 + cleanup，红线 #3）。
  function portal(node: HTMLElement) {
    const target = getPopupContainer?.() ?? globalPopupContainer?.() ?? document.body;
    target.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

  $effect(() => {
    if (!visible) return;
    const node = overlayEl;
    if (!node) return;
    // getPopupContainer 场景不锁 body 滚动（对齐 Semi disabledBodyScroll 判定）。
    const releaseScroll = getPopupContainer ? undefined : useScrollLock();
    const trap = useFocusTrap(node);
    trap.activate();
    window.addEventListener('keydown', onKeydown);
    updateTimer();
    return () => {
      window.removeEventListener('keydown', onKeydown);
      trap.deactivate();
      releaseScroll?.();
      clearTimer();
    };
  });

  const wrapperCls = $derived(
    ['cd-image-preview', getPopupContainer && 'cd-image-preview-popup', className]
      .filter(Boolean)
      .join(' '),
  );
  const hideViewerCls = $derived(!viewerVisible ? 'cd-image-preview-hide' : '');
  const wrapperStyle = $derived(
    getPopupContainer
      ? `z-index:${zIndex};position:static;${style}`
      : `z-index:${zIndex};${style}`,
  );
</script>

{#if visible}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    bind:this={overlayEl}
    use:portal
    class={wrapperCls}
    style={wrapperStyle}
    role="dialog"
    aria-modal="true"
    aria-label={loc().t('Image.previewAlt')}
    tabindex="-1"
    onmousedown={onOverlayMouseDown}
    onmouseup={onOverlayMouseUp}
    onmousemove={onOverlayMouseMove}
    onwheelcapture={handleWheel}
  >
    <PreviewHeader
      class={hideViewerCls}
      title={activeTitle}
      {closable}
      {renderHeader}
      {renderCloseIcon}
      onClose={requestClose}
    />

    <PreviewImage
      bind:this={previewImageRef}
      src={activeSrc}
      {rotation}
      {zoom}
      {ratio}
      {minZoom}
      {maxZoom}
      {initialZoom}
      {disableDownload}
      {crossOrigin}
      onZoom={handleZoomImage}
      onLoad={onImageLoad}
      onError={onImageError}
    />

    {#if showPrev}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <div
        class={['cd-image-preview-icon', 'cd-image-preview-prev', hideViewerCls]
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabindex="0"
        aria-label={prevTip ?? loc().t('Image.prevTip')}
        onclick={() => switchImage('prev')}
      >
        {#if renderLeftIcon}{@render renderLeftIcon()}{:else}<IconArrowLeft size="large" />{/if}
      </div>
    {/if}
    {#if showNext}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <div
        class={['cd-image-preview-icon', 'cd-image-preview-next', hideViewerCls]
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabindex="0"
        aria-label={nextTip ?? loc().t('Image.nextTip')}
        onclick={() => switchImage('next')}
      >
        {#if renderRightIcon}{@render renderRightIcon()}{:else}<IconArrowRight size="large" />{/if}
      </div>
    {/if}

    <PreviewFooter
      class={hideViewerCls}
      curPage={currentIndex + 1}
      totalNum={total}
      disabledPrev={!showPrev}
      disabledNext={!showNext}
      {disableDownload}
      zoom={zoom * 100}
      min={minZoom * 100}
      max={maxZoom * 100}
      step={zoomStep * 100}
      {ratio}
      {showTooltip}
      {zIndex}
      {prevTip}
      {nextTip}
      {zoomInTip}
      {zoomOutTip}
      {rotateTip}
      {downloadTip}
      {adaptiveTip}
      {originTip}
      onPrev={() => switchImage('prev')}
      onNext={() => switchImage('next')}
      onZoomIn={(z) => handleZoomImage(z)}
      onZoomOut={(z) => handleZoomImage(z)}
      onDownload={handleDownload}
      onRotate={rotate}
      onAdjustRatio={adjustRatio}
      {renderPreviewMenu}
    />
  </div>
{/if}

<style>
  .cd-image-preview {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background-color: var(--cd-image-preview-bg);
    overflow: hidden;
    transition: opacity var(--cd-motion-duration-slow, 0.32s);
  }
  .cd-image-preview-popup {
    position: absolute;
  }
  :global(.cd-image-preview-hide) {
    opacity: 0;
  }

  .cd-image-preview-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--cd-image-preview-icon-size);
    height: var(--cd-image-preview-icon-size);
    border-radius: 50%;
    position: absolute;
    inset-block-start: 50%;
    transform: translateY(-50%);
    background: var(--cd-image-preview-icon-bg);
    cursor: pointer;
    color: var(--cd-image-preview-icon-color);
  }
  .cd-image-preview-icon :global(.cd-icon) {
    color: var(--cd-image-preview-icon-color);
  }
  .cd-image-preview-prev {
    inset-inline-start: var(--cd-image-preview-icon-offset-x);
  }
  .cd-image-preview-next {
    inset-inline-end: var(--cd-image-preview-icon-offset-x);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-image-preview {
      transition: none;
    }
  }
</style>
