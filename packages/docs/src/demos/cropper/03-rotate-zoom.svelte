<script lang="ts">
  import { Cropper, Button, Slider } from '@chenzy-design/svelte';

  const src = 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/image.png';
  let rotate = $state(0);
  let zoom = $state(1);
  let cropper = $state<{ getCropperCanvas: () => HTMLCanvasElement } | undefined>();
  let result = $state('');

  function crop() {
    const canvas = cropper?.getCropperCanvas();
    if (canvas) result = canvas.toDataURL();
  }
</script>

<!-- rotate / zoom 受控旋转缩放，onZoomChange 回传滚轮触发的最新缩放值。 -->
<div style="display: flex; flex-direction: column; gap: 12px;">
  <Cropper
    bind:this={cropper}
    {src}
    {rotate}
    {zoom}
    onZoomChange={(z) => (zoom = z)}
    style="width: 550px; height: 300px; margin: 20px;"
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
  <div>
    <Button onclick={crop}>裁切</Button>
  </div>
  {#if result}
    <img src={result} alt="裁切结果" style="height: 400px;" />
  {/if}
</div>
