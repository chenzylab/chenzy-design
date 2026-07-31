<script lang="ts">
  import { Cropper, Button, RadioGroup, Radio } from '@chenzy-design/svelte';
  import type { CropperShape } from '@chenzy-design/svelte';

  const src = 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/image.png';
  let shape = $state<CropperShape>('rect');
  let cropper = $state<{ getCropperCanvas: () => HTMLCanvasElement } | undefined>();
  let result = $state('');

  function crop() {
    const canvas = cropper?.getCropperCanvas();
    if (canvas) result = canvas.toDataURL();
  }
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <RadioGroup value={shape} onChange={(e) => (shape = e.target.value as CropperShape)}>
    <Radio value="rect">rect</Radio>
    <Radio value="round">round</Radio>
    <Radio value="roundRect">roundRect</Radio>
  </RadioGroup>
  <!-- 容器尺寸对齐 Semi demo：550×300、margin 20。 -->
  <Cropper bind:this={cropper} {src} {shape} style="width: 550px; height: 300px; margin: 20px;" />
  <div>
    <Button onclick={crop}>裁切</Button>
  </div>
  {#if result}
    <img src={result} alt="裁切结果" style="height: 400px;" />
  {/if}
</div>
