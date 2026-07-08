<script lang="ts">
  import { Slider, InputNumber } from '@chenzy-design/svelte';

  let val = $state(40);
</script>

<div style="max-width: 360px; display: flex; align-items: center; gap: 16px;">
  <div style="flex: 1;">
    <Slider value={val} onChange={(v) => (val = v as number)} />
  </div>
  <div style="width: 96px;">
    <InputNumber value={val} min={0} max={100} onChange={(v) => (val = v ?? 0)} />
  </div>
</div>
