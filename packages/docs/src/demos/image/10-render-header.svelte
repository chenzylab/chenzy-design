<script lang="ts">
  import { Image, ImagePreview } from '@chenzy-design/svelte';

  const srcList = [
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/sky.jpg',
  ];
</script>

<ImagePreview>
  {#snippet renderHeader(title)}
    <div
      style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"
    >
      <span style="background: black; padding: 0 10px;">自定义标题：{title}</span>
    </div>
  {/snippet}
  {#each srcList as src, index (src)}
    <Image
      {src}
      width={200}
      alt={`lamp${index + 1}`}
      preview={{ previewTitle: `lamp${index + 1}` }}
      style="margin-right: 5px;"
    />
  {/each}
</ImagePreview>
