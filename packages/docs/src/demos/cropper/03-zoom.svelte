<script lang="ts">
  import { Cropper, Button } from '@chenzy-design/svelte';

  const src = 'https://picsum.photos/id/1043/800/500';
  let zoom = $state(1);

  function clamp(v: number) {
    return Math.min(3, Math.max(0.1, Number(v.toFixed(2))));
  }
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; align-items: center; gap: 8px;">
    <Button onclick={() => (zoom = clamp(zoom - 0.1))}>缩小</Button>
    <span>缩放：{zoom.toFixed(1)}x</span>
    <Button onclick={() => (zoom = clamp(zoom + 0.1))}>放大</Button>
  </div>
  <Cropper {src} {zoom} onZoomChange={(z) => (zoom = z)} style="width: 100%; height: 320px;" />
</div>
