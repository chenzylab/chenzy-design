<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';

  let small = $state<number | null>(1);
  let large = $state<number | null>(3);
  let inner = $state<number | null>(8);
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:160px">
      <InputNumber value={small} min={0} size="small" onNumberChange={(v) => (small = v)} />
    </div>
    <Text type="tertiary">small：{small}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:160px">
      <InputNumber value={large} min={0} size="large" onNumberChange={(v) => (large = v)} />
    </div>
    <Text type="tertiary">large：{large}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:160px">
      <InputNumber value={inner} min={0} max={20} innerButtons onNumberChange={(v) => (inner = v)} />
    </div>
    <Text type="tertiary">内嵌按钮（hover 显形）：{inner}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:160px">
      <InputNumber defaultValue={5} disabled />
    </div>
    <Text type="tertiary">disabled</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:160px">
      <InputNumber defaultValue={42} readonly />
    </div>
    <Text type="tertiary">readonly</Text>
  </div>
</div>
