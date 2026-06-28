<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';

  let range = $state<[number, number]>([20, 70]);
</script>

<div style="max-width: 320px; display: flex; flex-direction: column; gap: 8px;">
  <Slider range value={range} onChange={(v) => (range = v as [number, number])} />
  <Text type="tertiary">区间：{range[0]} – {range[1]}</Text>
</div>
