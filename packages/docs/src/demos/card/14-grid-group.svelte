<script lang="ts">
  import { Card, CardGroup, Typography } from '@chenzy-design/svelte';

  const { Text } = Typography;

  const cards = new Array(7).fill(null);
</script>

<CardGroup type="grid">
  {#each cards as _, idx (idx)}
    <Card shadows="hover" title="Card title" headerLine={false} style="width: 260px;">
      {#snippet headerExtraContent()}
        <Text link>More</Text>
      {/snippet}
      <Text>Card content</Text>
    </Card>
  {/each}
</CardGroup>
