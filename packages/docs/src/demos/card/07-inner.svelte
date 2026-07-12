<script lang="ts">
  import { Card, Typography } from '@chenzy-design/svelte';
</script>

<!-- 卡片内部可以嵌套其他卡片 -->
<Card title="Card title">
  <Card title="Inner Card title" style="margin-bottom: 20px;">
    {#snippet headerExtraContent()}
      <Typography.Link href="#">More</Typography.Link>
    {/snippet}
    Inner Card content
  </Card>
  <Card title="Inner Card title">
    {#snippet headerExtraContent()}
      <Typography.Link href="#">More</Typography.Link>
    {/snippet}
    Inner Card content
  </Card>
</Card>
