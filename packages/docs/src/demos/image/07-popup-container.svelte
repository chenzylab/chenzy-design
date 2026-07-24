<script lang="ts">
  import { Image, ImagePreview } from '@chenzy-design/svelte';

  const srcList = [
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/sky.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/greenleaf.jpg',
  ];

  let container = $state<HTMLDivElement | null>(null);
</script>

<div bind:this={container} style="height: 400px; position: relative;">
  <ImagePreview
    getPopupContainer={() => container}
    style="height: 100%; display: flex; align-items: center; justify-content: center;"
  >
    {#each srcList as src, index (src)}
      <Image {src} width={200} alt={`lamp${index + 1}`} style="margin-right: 5px;" />
    {/each}
  </ImagePreview>
</div>
