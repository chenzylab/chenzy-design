<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';

  let price = $state<number | null>(9.9);
  let rate = $state<number | null>(3.14159);
  let weight = $state<number | null>(1.5);
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:180px">
      <InputNumber
        value={price}
        min={0}
        step={0.1}
        precision={2}
        prefix="¥"
        onChange={(v) => (price = v)}
      />
    </div>
    <Text type="tertiary">precision 2：{price}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:180px">
      <InputNumber
        value={rate}
        step={0.0001}
        precision={4}
        onChange={(v) => (rate = v)}
      />
    </div>
    <Text type="tertiary">precision 4：{rate}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:180px">
      <InputNumber
        value={weight}
        min={0}
        step={0.5}
        precision={0}
        suffix="kg"
        onChange={(v) => (weight = v)}
      />
    </div>
    <Text type="tertiary">precision 0（取整）：{weight}</Text>
  </div>
</div>
