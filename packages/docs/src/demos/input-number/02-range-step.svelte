<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';

  let temp = $state<number | null>(20);
  let volume = $state<number | null>(50);
  let level = $state<number | null>(3);
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:180px">
      <InputNumber
        value={temp}
        min={16}
        max={30}
        step={0.5}
        suffix="°C"
        onChange={(v) => (temp = typeof v === 'number' ? v : temp)}
      />
    </div>
    <Text type="tertiary">16~30，步进 0.5：{temp}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:180px">
      <InputNumber
        value={volume}
        min={0}
        max={100}
        step={5}
        shiftStep={20}
        suffix="%"
        onChange={(v) => (volume = typeof v === 'number' ? v : volume)}
      />
    </div>
    <Text type="tertiary">Shift+方向键 ±20：{volume}</Text>
  </div>

  <div style="display:flex; align-items:center; gap:8px">
    <div style="width:180px">
      <InputNumber
        value={level}
        min={0}
        max={5}
        step={1}
        onChange={(v) => (level = typeof v === 'number' ? v : level)}
      />
    </div>
    <Text type="tertiary">越界自动钳制到 [0,5]：{level}</Text>
  </div>
</div>
