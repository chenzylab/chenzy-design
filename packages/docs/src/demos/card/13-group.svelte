<script lang="ts">
  import { Card, CardGroup, Typography, Slider } from '@chenzy-design/svelte';

  const { Text } = Typography;

  let spacing = $state(12);
  const cards = new Array(8).fill(null);
</script>

<Text>滑动调节 Card 间距</Text>
<Slider
  defaultValue={12}
  max={40}
  min={10}
  style="width: 360px;"
  onChange={(v) => (spacing = typeof v === 'number' ? v : (v[0] ?? 12))}
/>
<br />
<CardGroup {spacing}>
  {#each cards as _, idx (idx)}
    <Card shadows="hover" title="Card title" headerLine={false} style="width: 260px;">
      {#snippet headerExtraContent()}
        <Text link>More</Text>
      {/snippet}
      <Text>Card content</Text>
    </Card>
  {/each}
</CardGroup>
