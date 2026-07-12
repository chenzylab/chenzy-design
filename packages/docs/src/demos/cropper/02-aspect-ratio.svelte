<script lang="ts">
  import { Cropper, Button } from '@chenzy-design/svelte';

  const src = 'https://picsum.photos/id/1025/800/500';
  let cropper = $state<{ getCropperCanvas: () => HTMLCanvasElement } | undefined>();
  let result = $state('');

  function crop() {
    const canvas = cropper?.getCropperCanvas();
    if (canvas) result = canvas.toDataURL();
  }
</script>

<!--
  aspectRatio 固定裁切框比例（此处 3:4），拖动角点时裁切框以此比例变化。
  defaultAspectRatio 仅影响初始比例，拖动时比例可变（见 aspectRatio 未设时）。
-->
<div style="display: flex; flex-direction: column; gap: 12px;">
  <Cropper bind:this={cropper} {src} aspectRatio={3 / 4} style="width: 100%; height: 300px;" />
  <div>
    <Button onclick={crop}>裁切</Button>
  </div>
  {#if result}
    <img src={result} alt="裁切结果" style="max-height: 240px; border: 1px solid var(--cd-color-border);" />
  {/if}
</div>
