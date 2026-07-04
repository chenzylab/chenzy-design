<!--
  Cropper — see specs/components/show/Cropper.spec.md
  图片裁切：容器 + <img>(底图) + 遮罩层 + 裁切框(内含裁切视图 img + 8 resize 角点)。
  几何逻辑全部委托 @chenzy-design/core 的 createCropperFoundation（框架无关），
  本组件只负责：DOM 结构/样式、鼠标/滚轮/resize 事件桥接、把 foundation 的 state
  绑到 Svelte $state 驱动渲染、暴露 getCropperCanvas() ref 方法。

  ⚠️ 死循环红线：
   - 红线 #1：受控 aspectRatio/rotate/zoom 只读不回写；rotate/zoom 变化经 core 重算 imgData
     写本地 state，不回传父级。onZoomChange 仅通知。
   - 红线 #3：document 级 mousemove/mouseup 在各 mousedown 内命令式 add，move 结束时 remove；
     wheel + resizeObserver 在 $effect 内命令式绑定 + cleanup。渲染期不读 DOM 几何。
   - foundation 的 setState 写的是专用 $state（imgData/cropperBox/zoom/rotate/loaded），
     render 只依赖这些 state，不在 setState 里触发对 props 的写。

  对齐 Semi：8 角点(round 形态仅 4 边中点)、rect/round/roundRect 形状、
  minZoom/maxZoom/zoomStep 钳制缩放、aspectRatio 约束、moveRange 边界、fill 填充色。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    createCropperFoundation,
    createResizeObserver,
    CROPPER_CORNERS,
    CROPPER_ROUND_CORNERS,
    type CropperShape,
    type CropperCorner,
    type CropperImageState,
    type CropperBox,
    type CropperAdapter,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import CropperCornerHandle from './CropperCorner.svelte';

  interface Props {
    /** 待裁切图片地址。 */
    src?: string;
    /** 裁切框形状，默认 'rect'。round=圆形(仅 4 边中点角点)，roundRect=圆角矩形。 */
    shape?: CropperShape;
    /** 受控裁切比例(w/h)。设置后角点 resize 走比例约束。 */
    aspectRatio?: number;
    /** 图片加载时裁切框初始比例，默认 1（仅 aspectRatio 未设时生效）。 */
    defaultAspectRatio?: number;
    /** 受控旋转角度(deg)，默认 0。 */
    rotate?: number;
    /** 受控缩放。图片加载后先做一层适配缩放，此值在其基础上再缩放，默认 1。 */
    zoom?: number;
    /** 缩放下限，默认 0.1。 */
    minZoom?: number;
    /** 缩放上限，默认 3。 */
    maxZoom?: number;
    /** 每次滚轮缩放步长，默认 0.1。 */
    zoomStep?: number;
    /** 是否显示裁切框 resize 角点，默认 true。 */
    showResizeBox?: boolean;
    /** 裁切框附加内联样式。 */
    cropperBoxStyle?: string;
    /** 裁切框附加类名。 */
    cropperBoxClassName?: string;
    /** 裁切结果中非图片区域的填充色，默认 'rgba(0, 0, 0, 0)'（透明）。 */
    fill?: string;
    /** 返回预览容器元素的函数；提供后实时渲染裁切预览。 */
    preview?: () => HTMLElement | null | undefined;
    /** 透传给底图 <img> 的属性。 */
    imgProps?: Record<string, unknown>;
    /** 缩放变化回调。 */
    onZoomChange?: (zoom: number) => void;
    /** 容器 aria-label（未设时走 locale Cropper.container）。 */
    ariaLabel?: string;
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let {
    src,
    shape = 'rect',
    aspectRatio,
    defaultAspectRatio = 1,
    rotate = 0,
    zoom = 1,
    minZoom = 0.1,
    maxZoom = 3,
    zoomStep = 0.1,
    showResizeBox = true,
    cropperBoxStyle,
    cropperBoxClassName,
    fill = 'rgba(0, 0, 0, 0)',
    preview,
    imgProps,
    onZoomChange,
    ariaLabel,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  // ——— DOM 引用（普通引用，bind:this；不在渲染期读几何）———
  let containerEl = $state<HTMLDivElement | null>(null);
  let imgEl = $state<HTMLImageElement | null>(null);

  // ——— 本地响应式 state（foundation setState 只写这些；render 只读这些）———
  let imgData = $state<CropperImageState>({
    width: 0,
    height: 0,
    centerPoint: { x: 0, y: 0 },
  });
  let cropperBox = $state<CropperBox>({
    width: 0,
    height: 0,
    centerPoint: { x: 0, y: 0 },
  });
  let curZoom = $state(1);
  let curRotate = $state(0);
  let loaded = $state(false);

  // ——— foundation（几何引擎），adapter 读 DOM、通知 zoom 变化 ———
  const adapter: CropperAdapter = {
    getContainer: () => containerEl,
    getImg: () => imgEl,
    notifyZoomChange: (z) => onZoomChange?.(z),
  };

  const foundation = createCropperFoundation({
    adapter,
    getProps: () => ({
      src,
      aspectRatio,
      defaultAspectRatio,
      fill,
      maxZoom,
      minZoom,
      zoomStep,
    }),
    getState: () => ({
      imgData,
      cropperBox,
      zoom: curZoom,
      rotate: curRotate,
      loaded,
    }),
    setState: (patch) => {
      if (patch.imgData !== undefined) imgData = patch.imgData;
      if (patch.cropperBox !== undefined) cropperBox = patch.cropperBox;
      if (patch.zoom !== undefined) curZoom = patch.zoom;
      if (patch.rotate !== undefined) curRotate = patch.rotate;
      if (patch.loaded !== undefined) loaded = patch.loaded;
    },
  });

  // ——— 派生几何（渲染样式用）———
  const imgX = $derived(imgData.centerPoint.x - imgData.width / 2);
  const imgY = $derived(imgData.centerPoint.y - imgData.height / 2);
  const cropperBoxX = $derived(cropperBox.centerPoint.x - cropperBox.width / 2);
  const cropperBoxY = $derived(cropperBox.centerPoint.y - cropperBox.height / 2);
  const cropperImgX = $derived(imgX - cropperBoxX);
  const cropperImgY = $derived(imgY - cropperBoxY);

  const corners = $derived(
    shape === 'round' ? CROPPER_ROUND_CORNERS : CROPPER_CORNERS,
  );

  const containerAria = $derived(ariaLabel ?? loc().t('Cropper.container'));

  const rootClass = $derived(['cd-cropper', className].filter(Boolean).join(' '));
  const boxClass = $derived(
    [
      'cd-cropper-box',
      cropperBoxClassName,
      shape === 'round' ? 'cd-cropper-view-box-round' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
  const viewBoxClass = $derived(
    [
      'cd-cropper-view-box',
      shape.includes('round') ? 'cd-cropper-view-box-round' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // ——— 底图 <img> load：foundation 计算初始适配 ———
  function handleImageLoad(e: Event) {
    const target = e.currentTarget as HTMLImageElement;
    foundation.handleImageLoad({
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
    });
    // 同步受控 zoom/rotate 初值到本地态并重算（若父传了非默认值）。
    applyControlled(untrack(() => rotate), untrack(() => zoom));
    renderPreviewOnce();
  }

  // ——— 受控 rotate / zoom → 重算 imgData（映射 Semi getDerivedStateFromProps）———
  function applyControlled(nextRotate: number, nextZoom: number) {
    if (!loaded) return;
    if (nextRotate === curRotate && nextZoom === curZoom) return;
    const nextImg = foundation.computeControlledImgData(nextRotate, nextZoom);
    imgData = nextImg;
    curRotate = nextRotate;
    curZoom = nextZoom;
  }

  // rotate/zoom prop 变化时同步。仅在 loaded 后生效；读 prop、写专用 state（不回写 prop）。
  $effect(() => {
    const r = rotate;
    const z = zoom;
    if (!untrack(() => loaded)) return;
    untrack(() => applyControlled(r, z));
  });

  // ——— 角点 resize：mousedown 记录方向，文档级绑 move/up ———
  function onCornerDown(dir: CropperCorner) {
    foundation.handleCornerMouseDown(dir);
    document.addEventListener('mousemove', onCornerMove);
    document.addEventListener('mouseup', onCornerUp);
  }
  function onCornerMove(e: MouseEvent) {
    e.preventDefault();
    foundation.handleCornerMove(e.clientX, e.clientY);
  }
  function onCornerUp() {
    foundation.handleCornerMouseUp();
    document.removeEventListener('mousemove', onCornerMove);
    document.removeEventListener('mouseup', onCornerUp);
  }

  // ——— 裁切框整体拖拽 ———
  function onBoxDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    // 落在角点上则交给角点逻辑，不移动整框。
    if (target?.dataset?.dir) return;
    foundation.handleCropperBoxMouseDown(e.clientX, e.clientY);
    document.addEventListener('mousemove', onBoxMove);
    document.addEventListener('mouseup', onBoxUp);
  }
  function onBoxMove(e: MouseEvent) {
    foundation.handleCropperBoxMouseMove(e.clientX, e.clientY);
  }
  function onBoxUp() {
    foundation.handleCropperBoxMouseUp();
    document.removeEventListener('mousemove', onBoxMove);
    document.removeEventListener('mouseup', onBoxUp);
  }

  // ——— 遮罩层拖拽 = 移动底图 ———
  function onMaskDown(e: MouseEvent) {
    if (e.currentTarget !== e.target) return;
    foundation.handleImgMoveStart(e.clientX, e.clientY);
    document.addEventListener('mousemove', onImgMove);
    document.addEventListener('mouseup', onImgUp);
  }
  function onImgMove(e: MouseEvent) {
    foundation.handleImgMove(e.clientX, e.clientY);
  }
  function onImgUp() {
    foundation.handleImgMoveUp();
    document.removeEventListener('mousemove', onImgMove);
    document.removeEventListener('mouseup', onImgUp);
  }

  function onViewImgDragStart(e: DragEvent) {
    e.preventDefault();
  }

  // ——— 预览渲染（命令式，一次性挂 img，尺寸/变换在 $effect 内更新）———
  let previewImg: HTMLImageElement | null = null;
  let previewContainer: HTMLElement | null = null;
  let previewInitSize = { width: 0, height: 0 };

  function renderPreviewOnce() {
    if (previewImg || !preview || !src) return;
    const node = preview();
    if (!node) return;
    const img = document.createElement('img');
    img.src = src;
    node.appendChild(img);
    node.style.overflow = 'hidden';
    const rect = node.getBoundingClientRect();
    previewInitSize = { width: rect.width, height: rect.height };
    previewImg = img;
    previewContainer = node;
  }

  function removePreview() {
    if (previewImg && previewContainer) {
      previewContainer.removeChild(previewImg);
      previewImg = null;
      previewContainer = null;
    }
  }

  // 预览尺寸/变换随裁切态更新（读 state → 写外部 DOM 样式，非受控回写）。
  $effect(() => {
    // 显式依赖裁切/图片态
    const w = imgData.width;
    const h = imgData.height;
    const tx = cropperImgX;
    const ty = cropperImgY;
    const r = curRotate;
    // cropperBox 也是 computePreview 的输入
    void cropperBox.width;
    void cropperBox.height;
    if (!previewImg || !previewContainer) return;
    const out = foundation.computePreview(previewInitSize, {
      width: w,
      height: h,
      translateX: tx,
      translateY: ty,
      rotate: r,
    });
    previewImg.style.width = `${out.imgWidth}px`;
    previewImg.style.height = `${out.imgHeight}px`;
    previewImg.style.transform = `translate(${out.translateX}px, ${out.translateY}px) rotate(${out.rotate}deg)`;
    previewImg.style.transformOrigin = 'center';
    previewContainer.style.width = `${out.containerWidth}px`;
    previewContainer.style.height = `${out.containerHeight}px`;
  });

  // ——— wheel + resize observer：命令式绑定 + cleanup ———
  $effect(() => {
    const node = containerEl;
    if (!node) return;
    foundation.init();

    const wheelHandler = (e: WheelEvent) => {
      foundation.handleWheel({
        deltaY: e.deltaY,
        clientX: e.clientX,
        clientY: e.clientY,
        preventDefault: () => e.preventDefault(),
      });
    };
    node.addEventListener('wheel', wheelHandler, { passive: false });

    const ro = createResizeObserver({
      box: 'content-box',
      onResize: () => foundation.handleResize(),
    });
    if (ro.supported) ro.observe(node);

    return () => {
      node.removeEventListener('wheel', wheelHandler);
      ro.disconnect();
      // 兜底解绑所有文档级监听（防拖拽中卸载残留）。
      document.removeEventListener('mousemove', onCornerMove);
      document.removeEventListener('mouseup', onCornerUp);
      document.removeEventListener('mousemove', onBoxMove);
      document.removeEventListener('mouseup', onBoxUp);
      document.removeEventListener('mousemove', onImgMove);
      document.removeEventListener('mouseup', onImgUp);
      removePreview();
    };
  });

  // ——— ref 方法：获取裁切结果 canvas ———
  export function getCropperCanvas(): HTMLCanvasElement {
    return foundation.getCropperCanvas();
  }
</script>

<div
  class={rootClass}
  {style}
  role="group"
  aria-label={containerAria}
  bind:this={containerEl}
>
  <!-- 底图层 -->
  <div class="cd-cropper-img-wrapper">
    <img
      bind:this={imgEl}
      {src}
      alt=""
      onload={handleImageLoad}
      class="cd-cropper-img"
      crossorigin="anonymous"
      draggable="false"
      style:width="{imgData.width}px"
      style:height="{imgData.height}px"
      style:transform-origin="center"
      style:transform="translate({imgX}px, {imgY}px) rotate({curRotate}deg)"
      {...imgProps}
    />
  </div>

  <!-- 遮罩层 -->
  <div class="cd-cropper-mask" onmousedown={onMaskDown} role="presentation"></div>

  <!-- 裁切框 -->
  <div
    class={boxClass}
    style={cropperBoxStyle}
    style:width="{cropperBox.width}px"
    style:height="{cropperBox.height}px"
    style:transform="translate({cropperBoxX}px, {cropperBoxY}px)"
    onmousedown={onBoxDown}
    role="presentation"
  >
    <div class={viewBoxClass}>
      <img
        ondragstart={onViewImgDragStart}
        class="cd-cropper-view-img"
        {src}
        alt=""
        draggable="false"
        style:width="{imgData.width}px"
        style:height="{imgData.height}px"
        style:transform-origin="center"
        style:transform="translate({cropperImgX}px, {cropperImgY}px) rotate({curRotate}deg)"
      />
    </div>
    {#if loaded && showResizeBox}
      {#each corners as corner (corner)}
        <CropperCornerHandle dir={corner} oncornerdown={onCornerDown} />
      {/each}
    {/if}
  </div>
</div>

<style>
  .cd-cropper {
    position: relative;
  }

  /* 避免 tailwind 等把 img max-width 设为 100% 影响裁切内 img 尺寸。 */
  .cd-cropper :global(img) {
    max-width: none;
  }

  .cd-cropper-img {
    position: absolute;
    user-select: none;
  }

  .cd-cropper-img-wrapper {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .cd-cropper-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--cd-cropper-mask-bg);
    cursor: move;
  }

  .cd-cropper-box {
    position: absolute;
    outline: var(--cd-cropper-box-outline-width) solid var(--cd-cropper-box-outline-color);
  }

  .cd-cropper-view-box {
    position: absolute;
    overflow: hidden;
    cursor: move;
    inset: 0;
  }

  .cd-cropper-view-box-round {
    border-radius: 50%;
  }

  .cd-cropper-view-img {
    user-select: none;
  }
</style>
