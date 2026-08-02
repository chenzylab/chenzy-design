<script lang="ts">
  import { Cropper, Button, Switch } from '@chenzy-design/svelte';

  const src = 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/image.png';
  let showResizeBox = $state(true);
  let cropper = $state<{ getCropperCanvas: () => HTMLCanvasElement } | undefined>();
  let result = $state('');

  function crop() {
    const canvas = cropper?.getCropperCanvas();
    if (canvas) result = canvas.toDataURL();
  }
</script>

<!--
  cropperBoxStyle 自定义裁切框样式（此处把 outline 改为背景色对比），
  showResizeBox 控制是否展示裁切框边角的调整块。
-->
<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; align-items: center; gap: 8px;">
    <span>展示调整块</span>
    <Switch checked={showResizeBox} onChange={(v) => (showResizeBox = v)} />
  </div>
  <Cropper
    bind:this={cropper}
    {src}
    {showResizeBox}
    cropperBoxStyle="outline-color: var(--cd-color-bg-0);"
    style="width: 550px; height: 300px; margin: 20px;"
  />
  <div>
    <Button onclick={crop}>裁切</Button>
  </div>
  {#if result}
    <img src={result} alt="裁切结果" style="height: 400px;" />
  {/if}
</div>
