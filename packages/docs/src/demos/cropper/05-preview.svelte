<script lang="ts">
  import { Cropper, Button, Slider } from '@chenzy-design/svelte';

  const src = 'https://picsum.photos/id/1025/800/500';
  let rotate = $state(0);
  let zoom = $state(1);
  let cropper = $state<{ getCropperCanvas: () => HTMLCanvasElement } | undefined>();
  let result = $state('');
  let previewEl = $state<HTMLDivElement | null>(null);

  function crop() {
    const canvas = cropper?.getCropperCanvas();
    if (canvas) result = canvas.toDataURL();
  }
</script>

<!-- preview 指定预览容器，裁切态变化时实时渲染预览效果。 -->
<div style="display: flex; flex-direction: column; gap: 12px;">
  <Cropper
    bind:this={cropper}
    {src}
    {rotate}
    {zoom}
    onZoomChange={(z) => (zoom = z)}
    preview={() => previewEl}
    style="width: 100%; height: 300px;"
  />
  <div style="display: flex; align-items: center; gap: 12px;">
    <span style="width: 48px;">旋转</span>
    <div style="flex: 1;">
      <Slider value={rotate} step={1} min={-360} max={360} onChange={(v) => (rotate = v as number)} />
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 12px;">
    <span style="width: 48px;">缩放</span>
    <div style="flex: 1;">
      <Slider value={zoom} step={0.1} min={0.1} max={3} onChange={(v) => (zoom = v as number)} />
    </div>
  </div>
  <div style="display: flex; gap: 24px; align-items: flex-start;">
    <div style="flex: 1;">
      <strong>实时预览</strong>
      <div bind:this={previewEl} style="height: 200px; margin-top: 8px;"></div>
    </div>
    <div style="flex: 1;">
      <Button onclick={crop}>裁切</Button>
      {#if result}
        <img src={result} alt="裁切结果" style="display: block; margin-top: 12px; max-width: 100%; border: 1px solid var(--cd-color-border);" />
      {/if}
    </div>
  </div>
</div>
