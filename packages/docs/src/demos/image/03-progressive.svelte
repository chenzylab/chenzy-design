<script lang="ts">
  import { Image, Button } from '@chenzy-design/svelte';

  let timestamp = $state('');
</script>

<Image
  width={300}
  height={200}
  src={`https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract-big.png?${timestamp}`}
>
  {#snippet placeholder()}
    <Image
      src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract-small.jpeg"
      width={300}
      height={200}
      preview={false}
    />
  {/snippet}
</Image>
<br />
<Button theme="solid" onclick={() => (timestamp = String(Date.now()))} style="margin-top: 10px;">
  Reload
</Button>
