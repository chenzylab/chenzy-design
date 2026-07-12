<!--
  PreviewImage — 预览图本体（对齐 Semi image/previewImage.tsx + previewImageFoundation）。
  职责：首帧按 ratio 计算适应/原始缩放 → 应用 translate/width/height/rotation；
        支持鼠标拖拽平移（超出容器时）、右键下载拦截、加载态 Spin。
  几何计算全走 previewGeometry 纯函数（红线 #2）；缩放由父级 PreviewInner 经 zoom prop 或
  命令式 changeZoom(滚轮) 驱动。窗口 resize 重新初始化（命令式监听 + cleanup，红线 #3）。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import { Spin } from '../spin/index.js';
  import {
    changeZoom as calcChangeZoom,
    getAdaptationZoom,
    clampZoom,
    moveImage,
    type Translate,
  } from './previewGeometry.js';

  type RatioType = 'adaptation' | 'realSize';

  interface Props {
    src?: string | undefined;
    rotation?: number | undefined;
    zoom?: number | undefined;
    ratio?: RatioType | undefined;
    minZoom?: number | undefined;
    maxZoom?: number | undefined;
    initialZoom?: number | undefined;
    disableDownload?: boolean | undefined;
    crossOrigin?: 'anonymous' | 'use-credentials' | undefined;
    /** 计算出新 zoom 时通知父级（notify=false 时不经 onZoomIn/Out 回调外抛）。 */
    onZoom?: ((zoom: number, notify: boolean) => void) | undefined;
    onLoad?: ((src: string) => void) | undefined;
    onError?: ((src: string) => void) | undefined;
  }

  let {
    src,
    rotation = 0,
    zoom,
    ratio = 'adaptation',
    minZoom = 0.1,
    maxZoom = 5,
    initialZoom,
    disableDownload = false,
    crossOrigin,
    onZoom,
    onLoad,
    onError,
  }: Props = $props();

  let containerEl = $state<HTMLDivElement | null>(null);
  let imgEl = $state<HTMLImageElement | null>(null);

  let loading = $state(true);
  let width = $state(0);
  let height = $state(0);
  let translate = $state<Translate>({ x: 0, y: 0 });
  let currZoom = $state(untrack(() => zoom) ?? 1);

  // 原始图片自然尺寸（onload 后拿到）与容器尺寸（resize 时刷新）。
  let originImageWidth = 0;
  let originImageHeight = 0;
  let containerWidth = 0;
  let containerHeight = 0;

  // initialZoom 每张 src 仅首帧生效一次（对齐 Semi _initialZoomApplied）。
  let initialZoomApplied = false;
  let initialZoomAppliedSrc: string | undefined;

  let startMouse = { x: 0, y: 0 };

  function syncInitialZoomFlag() {
    if (src !== initialZoomAppliedSrc) {
      initialZoomAppliedSrc = src;
      initialZoomApplied = false;
    }
  }

  function readContainerSize() {
    if (containerEl) {
      containerWidth = containerEl.clientWidth;
      containerHeight = containerEl.clientHeight;
    }
  }

  function getInitialZoom(): number {
    syncInitialZoomFlag();
    if (
      !initialZoomApplied &&
      typeof initialZoom === 'number' &&
      Number.isFinite(initialZoom) &&
      initialZoom > 0
    ) {
      initialZoomApplied = true;
      return clampZoom(initialZoom, minZoom, maxZoom);
    }
    let z = 1;
    if (ratio === 'adaptation') {
      z = getAdaptationZoom(
        containerWidth,
        containerHeight,
        originImageWidth,
        originImageHeight,
        rotation,
      );
    }
    return clampZoom(z, minZoom, maxZoom);
  }

  // 命令式缩放（供 PreviewInner 滚轮/按钮调用）：以指针为锚点重算尺寸与平移。
  export function changeZoom(
    newZoom: number,
    wheel?: { offsetX: number; offsetY: number; onImage: boolean } | null,
  ): void {
    const res = calcChangeZoom({
      newZoom,
      currZoom: untrack(() => currZoom),
      originImageWidth,
      originImageHeight,
      width: untrack(() => width),
      height: untrack(() => height),
      translate: untrack(() => translate),
      rotation,
      containerWidth,
      containerHeight,
      wheel: wheel ?? null,
    });
    translate = res.translate;
    width = res.width;
    height = res.height;
    currZoom = res.currZoom;
    if (imgEl) imgEl.style.cursor = res.canDrag ? 'grab' : 'default';
  }

  function initializeImageZoom(notify: boolean) {
    const z = getInitialZoom();
    if (currZoom !== z) {
      onZoom?.(z, notify);
    } else {
      changeZoom(z);
    }
  }

  function initializeImage(notify: boolean) {
    initializeImageZoom(notify);
    translate = { x: 0, y: 0 };
  }

  function handleLoad(e: Event) {
    const target = e.target as HTMLImageElement;
    if (target) {
      originImageWidth = target.naturalWidth;
      originImageHeight = target.naturalHeight;
      syncInitialZoomFlag();
      loading = false;
      // 首帧加载：zoom 变化不外抛回调（notify=false，对齐 Semi）。
      initializeImage(false);
    }
    if (src) onLoad?.(src);
  }

  function handleError() {
    loading = false;
    if (src) onError?.(src);
  }

  function onWindowResize() {
    readContainerSize();
    initializeImage(true);
  }

  function handleRightClick(e: MouseEvent) {
    if (disableDownload) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function handleMouseDown(e: MouseEvent) {
    startMouse = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: MouseEvent) {
    // 仅左键按住时拖拽（e.buttons === 1）。
    if (e.buttons !== 1) return;
    const res = moveImage(
      e.clientX,
      e.clientY,
      startMouse.x,
      startMouse.y,
      untrack(() => width),
      untrack(() => height),
      untrack(() => translate),
      rotation,
      containerWidth,
      containerHeight,
    );
    if (res.moved) {
      translate = res.translate;
      startMouse = { x: e.clientX, y: e.clientY };
    }
  }

  // 初始化容器尺寸 + window resize 监听（命令式 + cleanup）。
  $effect(() => {
    readContainerSize();
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  });

  // src 变化 → 重新进入加载态。
  let lastSrc = $state(untrack(() => src));
  $effect(() => {
    if (src !== lastSrc) {
      lastSrc = src;
      loading = true;
    }
  });

  // 父级 zoom prop 变化（按钮/滑块/滚轮统一经 PreviewInner 下发）→ 应用缩放。
  let lastZoom = $state(untrack(() => zoom));
  $effect(() => {
    if (zoom !== undefined && zoom !== lastZoom && zoom !== untrack(() => currZoom)) {
      lastZoom = zoom;
      changeZoom(zoom);
    }
  });

  // ratio 切换（适应页面 ↔ 原始尺寸）→ 重新初始化。
  let lastRatio = $state(untrack(() => ratio));
  $effect(() => {
    if (ratio !== lastRatio) {
      lastRatio = ratio;
      initializeImage(true);
    }
  });

  // rotation 变化 → 重新按外接矩形适配。
  let lastRotation = $state(untrack(() => rotation));
  $effect(() => {
    if (rotation !== lastRotation) {
      lastRotation = rotation;
      onWindowResize();
    }
  });

  const imgStyle = $derived(
    `position:absolute;visibility:${loading ? 'hidden' : 'visible'};` +
      `transform:translate(${translate.x}px, ${translate.y}px) rotate(${rotation}deg);` +
      `width:${width}px;height:${height}px`,
  );
</script>

<div class="cd-image-preview-image" bind:this={containerEl}>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <img
    bind:this={imgEl}
    class="cd-image-preview-image-img"
    {src}
    alt="preview"
    onmousemove={handleMouseMove}
    onmousedown={handleMouseDown}
    oncontextmenu={handleRightClick}
    ondragstart={(e) => e.preventDefault()}
    onload={handleLoad}
    onerror={handleError}
    style={imgStyle}
    crossorigin={crossOrigin}
  />
  {#if loading}
    <Spin size="large" wrapperClassName="cd-image-preview-image-spin" />
  {/if}
</div>

<style>
  .cd-image-preview-image {
    position: relative;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .cd-image-preview-image-img {
    position: absolute;
    z-index: 0;
    user-select: none;
  }
  .cd-image-preview-image :global(.cd-image-preview-image-spin) {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    color: var(--cd-image-preview-image-spin-color);
  }
</style>
