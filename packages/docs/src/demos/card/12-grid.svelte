<script lang="ts">
  import { Card, CardGroup, Typography } from '@chenzy-design/svelte';

  const cards = Array.from({ length: 7 }, (_, i) => i + 1);
</script>

<!-- type='grid' 把卡片组设为网格型：卡片去圆角并以边框拼接，spacing 被忽略 -->
<CardGroup type="grid">
  {#each cards as n (n)}
    <Card shadows="hover" title="Card title" headerLine={false} style="width: 200px;">
      {#snippet headerExtraContent()}
        <Typography.Text link={{ href: '#' }}>More</Typography.Text>
      {/snippet}
      <Typography.Text>Card content</Typography.Text>
    </Card>
  {/each}
</CardGroup>
