<script lang="ts">
  import { Image, ImagePreview } from '@chenzy-design/svelte';

  const srcList = [
    'https://picsum.photos/seed/g1/600/400',
    'https://picsum.photos/seed/g2/600/400',
    'https://picsum.photos/seed/g3/600/400',
    'https://picsum.photos/seed/g4/600/400',
  ];
</script>

<!-- ImagePreview 包裹多个 Image：点任一图进组预览，可左右切换。 -->
<ImagePreview>
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    {#each srcList as src, i (src)}
      <Image {src} width={160} height={110} alt={`图片 ${i + 1}`} />
    {/each}
  </div>
</ImagePreview>
