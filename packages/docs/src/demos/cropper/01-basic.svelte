<script lang="ts">
  import { Cropper, Button } from '@chenzy-design/svelte';

  const src = 'https://picsum.photos/id/1015/800/500';
  let cropper = $state<{ getCropperCanvas: () => HTMLCanvasElement } | undefined>();
  let result = $state('');

  function crop() {
    const canvas = cropper?.getCropperCanvas();
    if (canvas) result = canvas.toDataURL();
  }
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Cropper bind:this={cropper} {src} style="width: 100%; height: 320px;" />
  <div>
    <Button onclick={crop}>裁切</Button>
  </div>
  {#if result}
    <img src={result} alt="裁切结果" style="max-height: 240px; border: 1px solid var(--cd-color-border);" />
  {/if}
</div>
