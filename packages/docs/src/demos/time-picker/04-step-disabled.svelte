<script lang="ts">
  import { TimePicker, Text } from '@chenzy-design/svelte';

  let value = $state<Date | null>(null);

  // 仅允许 9:00 ~ 18:00 工作时间，分钟以 5 为步长
  const disabledHours = () => {
    const out: number[] = [];
    for (let h = 0; h < 24; h++) if (h < 9 || h > 18) out.push(h);
    return out;
  };
</script>

<div style="display:flex; flex-direction:column; gap:12px; max-width:260px">
  <Text type="tertiary">步长 5 分钟，禁用非工作时段，超出范围项隐藏</Text>
  <TimePicker
    {value}
    minuteStep={5}
    format="HH:mm"
    {disabledHours}
    hideDisabledOptions
    onChange={(t) => (value = Array.isArray(t) ? t[0] : t)}
  />
</div>
