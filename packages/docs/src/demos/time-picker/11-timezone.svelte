<script lang="ts">
  import { TimePicker, Select, Text } from '@chenzy-design/svelte';

  // 传入 timeZone，显示文案按指定时区呈现（对齐 Semi timeZone）。
  let timeZone = $state('GMT+08:00');
  const value = new Date(1581599305265);

  const gmtList: { label: string; value: string }[] = [];
  for (let hourOffset = -4; hourOffset <= 10; hourOffset++) {
    const prefix = hourOffset >= 0 ? '+' : '-';
    const h = Math.abs(hourOffset);
    const gmt = `GMT${prefix}${String(h).padStart(2, '0')}:00`;
    gmtList.push({ label: gmt, value: gmt });
  }
</script>

<div style="display:flex; flex-direction:column; gap:12px; max-width:260px">
  <Text type="tertiary">切换时区，观察 TimePicker 显示随之变化</Text>
  <Select optionList={gmtList} value={timeZone} onChange={(v) => (timeZone = v as string)} />
  <TimePicker {value} {timeZone} />
</div>
