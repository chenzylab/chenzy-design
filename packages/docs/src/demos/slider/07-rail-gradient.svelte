<script lang="ts">
  import { Slider, Text } from '@chenzy-design/svelte';

  let range = $state<[number, number]>([30, 70]);

  const railStyle = $derived(
    `background: linear-gradient(to right,` +
      ` var(--cd-color-success) 0%,` +
      ` var(--cd-color-success) ${range[0]}%,` +
      ` var(--cd-color-warning) ${range[0]}%,` +
      ` var(--cd-color-warning) ${range[1]}%,` +
      ` var(--cd-color-danger) ${range[1]}%,` +
      ` var(--cd-color-danger) 100%);`,
  );
</script>

<div style="max-width: 360px; display: flex; flex-direction: column; gap: 8px;">
  <Slider
    range
    included={false}
    value={range}
    {railStyle}
    onChange={(v) => (range = v as [number, number])}
  />
  <Text type="tertiary">分段：{range[0]} / {range[1]}</Text>
</div>
