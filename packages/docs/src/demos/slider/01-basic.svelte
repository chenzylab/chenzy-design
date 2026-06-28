<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';

  let val = $state(40);
</script>

<div style="max-width: 320px; display: flex; flex-direction: column; gap: 8px;">
  <Slider value={val} onChange={(v) => (val = v as number)} />
  <Text type="tertiary">当前值：{val}</Text>
</div>
