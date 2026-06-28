<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';

  let value = $state<number | null>(3);
</script>

<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start">
  <div style="display:flex; align-items:center; gap:8px">
    <InputNumber {value} min={0} max={10} onChange={(v) => (value = v)} />
    <Text type="tertiary">数值：{value}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:160px">
      <InputNumber defaultValue={2} min={0} max={9} controlsPosition="sides" />
    </div>
    <Text type="tertiary">两侧按钮</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:200px">
      <InputNumber defaultValue={100} min={0} step={10} prefix="¥" suffix="元" />
    </div>
    <Text type="tertiary">前后缀</Text>
  </div>
</div>
