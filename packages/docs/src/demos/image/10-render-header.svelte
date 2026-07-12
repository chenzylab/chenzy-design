<script lang="ts">
  import { Image, ImagePreview } from '@chenzy-design/svelte';

  const list = [
    { src: 'https://picsum.photos/seed/h1/600/400', title: '晨雾中的山谷' },
    { src: 'https://picsum.photos/seed/h2/600/400', title: '湖畔的黄昏' },
  ];
</script>

<!-- renderHeader：自定义预览顶部区，入参为当前图 previewTitle。 -->
<ImagePreview>
  {#snippet renderHeader(title)}
    <div
      style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"
    >
      <span style="background: rgba(0,0,0,0.6); color: #fff; padding: 4px 12px; border-radius: 4px;">
        自定义标题：{title}
      </span>
    </div>
  {/snippet}
  <div style="display: flex; gap: 8px;">
    {#each list as item, i (item.src)}
      <Image
        src={item.src}
        width={200}
        height={130}
        alt={`图片 ${i + 1}`}
        preview={{ previewTitle: item.title }}
      />
    {/each}
  </div>
</ImagePreview>
