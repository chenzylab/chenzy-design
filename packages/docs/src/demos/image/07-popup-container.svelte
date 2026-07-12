<script lang="ts">
  import { Image, ImagePreview } from '@chenzy-design/svelte';

  const srcList = [
    'https://picsum.photos/seed/c1/600/400',
    'https://picsum.photos/seed/c2/600/400',
    'https://picsum.photos/seed/c3/600/400',
  ];

  let container = $state<HTMLDivElement | null>(null);
</script>

<!-- 预览浮层渲染到指定容器（需 position:relative），不改视图渲染位置。 -->
<div
  bind:this={container}
  style="height: 400px; position: relative; border: 1px dashed var(--cd-color-border); border-radius: 6px; overflow: hidden;"
>
  <ImagePreview
    getPopupContainer={() => container}
    style="height: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;"
  >
    {#each srcList as src, i (src)}
      <Image {src} width={160} height={110} alt={`容器内图片 ${i + 1}`} />
    {/each}
  </ImagePreview>
</div>
