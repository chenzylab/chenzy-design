<script lang="ts">
  import { Image, Button } from '@chenzy-design/svelte';

  let timestamp = $state('');
</script>

<Image
  width={300}
  height={200}
  src={`https://picsum.photos/seed/big/900/600?${timestamp}`}
  alt="渐进加载大图"
>
  {#snippet placeholder()}
    <img
      src="https://picsum.photos/seed/big/60/40"
      alt=""
      style="width: 300px; height: 200px; filter: blur(8px);"
    />
  {/snippet}
</Image>
<br />
<Button style="margin-top: 10px;" onclick={() => (timestamp = String(Date.now()))}>
  重新加载
</Button>
