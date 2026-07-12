<script lang="ts">
  import { Image, ImagePreview, Divider } from '@chenzy-design/svelte';

  const srcList = [
    'https://picsum.photos/seed/mi1/600/400',
    'https://picsum.photos/seed/mi2/600/400',
    'https://picsum.photos/seed/mi3/600/400',
  ];
</script>

<!-- 基于默认按钮 menuItems 重组：menuItems 顺序同默认工具栏（翻页/页码/缩放/比例/旋转/下载）。 -->
<ImagePreview>
  {#snippet renderPreviewMenu(props)}
    <div
      style="display: flex; align-items: center; gap: 4px; padding: 5px 16px; background: rgba(0,0,0,0.75); border-radius: 4px;"
    >
      {#each props.menuItems ?? [] as item, i (i)}
        {@render item()}
        {#if i === 2 || i === 6}
          <Divider layout="vertical" />
        {/if}
      {/each}
    </div>
  {/snippet}
  <div style="display: flex; gap: 8px;">
    {#each srcList as src, i (src)}
      <Image {src} width={160} height={110} alt={`图片 ${i + 1}`} />
    {/each}
  </div>
</ImagePreview>
