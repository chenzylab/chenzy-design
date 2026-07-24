<script lang="ts">
  import { ImagePreview, Button } from '@chenzy-design/svelte';

  const srcList = [
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/sky.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/greenleaf.jpg',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/colorful.jpg',
  ];

  let visible1 = $state(false);
  let visible2 = $state(false);
</script>

<Button onclick={() => (visible1 = true)}>Preview single Image</Button>
<ImagePreview
  src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/sky.jpg"
  visible={visible1}
  onVisibleChange={(v) => (visible1 = v)}
/>
<br />
<Button onclick={() => (visible2 = true)} style="margin-top: 20px;">Preview multiple Images</Button>
<ImagePreview src={srcList} visible={visible2} onVisibleChange={(v) => (visible2 = v)} />
