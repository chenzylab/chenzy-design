<script lang="ts">
  import { Cropper, Button } from '@chenzy-design/svelte';
  import type { CropperShape } from '@chenzy-design/svelte';

  const src = 'https://picsum.photos/id/1025/800/500';
  let shape = $state<CropperShape>('rect');
  const shapes: CropperShape[] = ['rect', 'round', 'roundRect'];
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; gap: 8px;">
    {#each shapes as s (s)}
      <Button type={shape === s ? 'primary' : 'tertiary'} onclick={() => (shape = s)}>{s}</Button>
    {/each}
  </div>
  <Cropper {src} {shape} style="width: 100%; height: 320px;" />
</div>
