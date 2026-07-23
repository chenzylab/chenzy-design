<script lang="ts">
  import { Card, Rating } from '@chenzy-design/svelte';

  const { Meta } = Card;
</script>

<Card style="max-width: 300px;" headerLine={false}>
  {#snippet actions()}
    <Rating size="small" defaultValue={4} />
  {/snippet}
  {#snippet cover()}
    <img
      alt="example"
      src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/card-cover-docs-demo.jpeg"
    />
  {/snippet}
  <Meta title="Semi Doc" description="全面、易用、优质" />
</Card>
