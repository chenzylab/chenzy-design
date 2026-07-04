<!--
  CropperCorner — 裁切框 8 个 resize 角点之一。
  对齐 Semi cssClasses.CORNER (`cd-cropper-box-corner` + `-${dir}`)，data-dir 供事件读取方向。
  纯呈现：mousedown 委托给父组件（父在文档级绑定 move/up）。
-->
<script lang="ts">
  import type { CropperCorner } from '@chenzy-design/core';

  interface Props {
    dir: CropperCorner;
    oncornerdown: (dir: CropperCorner, e: MouseEvent) => void;
  }

  let { dir, oncornerdown }: Props = $props();

  function handleMouseDown(e: MouseEvent) {
    e.preventDefault();
    oncornerdown(dir, e);
  }
</script>

<div
  class="cd-cropper-box-corner cd-cropper-box-corner-{dir}"
  data-dir={dir}
  onmousedown={handleMouseDown}
  role="presentation"
></div>

<style>
  .cd-cropper-box-corner {
    position: absolute;
    background: var(--cd-cropper-corner-bg);
    width: var(--cd-cropper-corner-size);
    height: var(--cd-cropper-corner-size);
    z-index: 1;
  }

  /* 角点定位：以角点尺寸的一半外偏，使角点骑在裁切框边线上。 */
  .cd-cropper-box-corner-tl {
    top: calc(var(--cd-cropper-corner-size) / -2);
    left: calc(var(--cd-cropper-corner-size) / -2);
    cursor: nwse-resize;
  }
  .cd-cropper-box-corner-tr {
    top: calc(var(--cd-cropper-corner-size) / -2);
    right: calc(var(--cd-cropper-corner-size) / -2);
    cursor: nesw-resize;
  }
  .cd-cropper-box-corner-tm {
    top: calc(var(--cd-cropper-corner-size) / -2);
    left: 50%;
    margin-left: calc(var(--cd-cropper-corner-size) / -2);
    cursor: ns-resize;
  }
  .cd-cropper-box-corner-ml {
    top: 50%;
    left: calc(var(--cd-cropper-corner-size) / -2);
    margin-top: calc(var(--cd-cropper-corner-size) / -2);
    cursor: ew-resize;
  }
  .cd-cropper-box-corner-mr {
    top: 50%;
    right: calc(var(--cd-cropper-corner-size) / -2);
    margin-top: calc(var(--cd-cropper-corner-size) / -2);
    cursor: ew-resize;
  }
  .cd-cropper-box-corner-bl {
    bottom: calc(var(--cd-cropper-corner-size) / -2);
    left: calc(var(--cd-cropper-corner-size) / -2);
    cursor: nesw-resize;
  }
  .cd-cropper-box-corner-bm {
    bottom: calc(var(--cd-cropper-corner-size) / -2);
    left: 50%;
    margin-left: calc(var(--cd-cropper-corner-size) / -2);
    cursor: ns-resize;
  }
  .cd-cropper-box-corner-br {
    bottom: calc(var(--cd-cropper-corner-size) / -2);
    right: calc(var(--cd-cropper-corner-size) / -2);
    cursor: nwse-resize;
  }
</style>
