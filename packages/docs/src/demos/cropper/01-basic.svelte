<script lang="ts">
  import { Cropper, Button, RadioGroup, Radio } from '@chenzy-design/svelte';
  import type { CropperShape } from '@chenzy-design/svelte';

  const src = 'https://picsum.photos/id/1015/800/500';
  let shape = $state<CropperShape>('rect');
  let cropper = $state<{ getCropperCanvas: () => HTMLCanvasElement } | undefined>();
  let result = $state('');

  function crop() {
    const canvas = cropper?.getCropperCanvas();
    if (canvas) result = canvas.toDataURL();
  }
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <RadioGroup value={shape} onChange={(v) => (shape = v as CropperShape)}>
    <Radio value="rect">rect</Radio>
    <Radio value="round">round</Radio>
    <Radio value="roundRect">roundRect</Radio>
  </RadioGroup>
  <Cropper bind:this={cropper} {src} {shape} style="width: 100%; height: 300px;" />
  <div>
    <Button onclick={crop}>裁切</Button>
  </div>
  {#if result}
    <img src={result} alt="裁切结果" style="max-height: 240px; border: 1px solid var(--cd-color-border);" />
  {/if}
</div>
