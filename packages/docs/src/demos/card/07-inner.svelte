<script lang="ts">
  import { Card, Typography } from '@chenzy-design/svelte';

  const { Text } = Typography;
</script>

<Card title="Card title">
  <Card title="Inner Card title" style="margin-bottom: 20px;">
    {#snippet headerExtraContent()}
      <Text link>More</Text>
    {/snippet}
    Inner Card content
  </Card>
  <Card title="Inner Card title">
    {#snippet headerExtraContent()}
      <Text link>More</Text>
    {/snippet}
    Inner Card content
  </Card>
</Card>
