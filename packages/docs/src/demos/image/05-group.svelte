<script lang="ts">
  import { Image, ImagePreview } from '@chenzy-design/svelte';

  const srcList = [
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/sky.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/greenleaf.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/colorful.jpg',
  ];
</script>

<ImagePreview>
  {#each srcList as src, index (src)}
    <Image {src} width={200} alt={`lamp${index + 1}`} style="margin-right: 5px;" />
  {/each}
</ImagePreview>
