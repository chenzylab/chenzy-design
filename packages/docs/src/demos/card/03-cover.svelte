<script lang="ts">
  import { Card } from '@chenzy-design/svelte';

  const { Meta } = Card;
</script>

<Card style="max-width: 300px;">
  {#snippet cover()}
    <img
      alt="example"
      src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/card-cover-docs-demo2.jpeg"
    />
  {/snippet}
  <Meta title="卡片封面" />
</Card>
