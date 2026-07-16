<script lang="ts">
  import { Card, CardGroup, Slider, Typography } from '@chenzy-design/svelte';

  // Slider 受控不回写：值 + onChange 回填
  let spacing = $state(12);
  const cards = Array.from({ length: 8 }, (_, i) => i + 1);
</script>

<!-- CardGroup 中的卡片等间距排列，spacing 控制间距大小 -->
<Typography.Text>滑动调节 Card 间距</Typography.Text>
<div style="width: 360px;">
  <Slider
    value={spacing}
    max={40}
    min={10}
    onChange={(v) => (spacing = typeof v === 'number' ? v : v[0])}
  />
</div>
<br />
<CardGroup {spacing}>
  {#each cards as n (n)}
    <Card shadows="hover" title="Card title" headerLine={false} style="width: 200px;">
      {#snippet headerExtraContent()}
        <Typography.Text link={{ href: '#' }}>More</Typography.Text>
      {/snippet}
      <Typography.Text>Card content</Typography.Text>
    </Card>
  {/each}
</CardGroup>
