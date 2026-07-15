<script lang="ts">
  import { ConfigProvider, Select, DatePicker, TimePicker, Text } from '@chenzy-design/svelte';

  // 对齐 Semi 基本用法：通过 timeZone 为时间类组件统一配置时区，
  // 切换时区后 DatePicker / TimePicker 的显示文案随之按新时区呈现。
  let timeZone = $state('GMT+08:00');
  const defaultTimestamp = new Date(1581599305265);

  const gmtList: { label: string; value: string }[] = [];
  for (let hourOffset = -11; hourOffset <= 14; hourOffset++) {
    const prefix = hourOffset >= 0 ? '+' : '-';
    const h = Math.abs(hourOffset);
    const gmt = `GMT${prefix}${String(h).padStart(2, '0')}:00`;
    gmtList.push({ label: gmt, value: gmt });
  }
</script>

<Text type="tertiary"
  >传入 <code>timeZone</code> 参数，为时间类组件统一配置时区；切换下方时区观察 DatePicker /
  TimePicker 的显示随之变化。</Text
>

<ConfigProvider {timeZone}>
  <div style="width:300px; margin-top:12px; display:flex; flex-direction:column; gap:16px">
    <Select options={gmtList} value={timeZone} onChange={(v) => (timeZone = v as string)} />
    <DatePicker type="dateTime" value={defaultTimestamp} />
    <TimePicker value={defaultTimestamp} />
  </div>
</ConfigProvider>
