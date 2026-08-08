<script lang="ts">
  // 严格复刻 Semi「手动获取值」：与基本用法同一套 timeZone Select，
  // 中间插入 ConfigConsumer 等价物打印合并后的 context 值。
  import { ConfigProvider, Select, DatePicker, TimePicker } from '@chenzy-design/svelte';
  import ConfigConsumerView from './ConfigConsumerView.svelte';

  let timeZone = $state('GMT+08:00');
  const defaultTimestamp = new Date(1581599305265);

  const gmtList: { label: string; value: string }[] = [];
  for (let hourOffset = -11; hourOffset <= 14; hourOffset++) {
    const prefix = hourOffset >= 0 ? '+' : '-';
    const hOffset = Math.abs(hourOffset);
    const gmt = `GMT${prefix}${String(hOffset).padStart(2, '0')}:00`;
    gmtList.push({ label: gmt, value: gmt });
  }
</script>

<ConfigProvider {timeZone}>
  <div style="width: 300px">
    <h5 style="margin: 10px">Select Time Zone:</h5>
    <Select
      placeholder="请选择时区"
      style="width: 300px"
      value={timeZone}
      showClear={true}
      optionList={gmtList}
      onChange={(value) => (timeZone = value as string)}
    />
    <br />
    <br />
    <DatePicker type="dateTime" defaultValue={defaultTimestamp} />
    <br />
    <br />
    <TimePicker defaultValue={defaultTimestamp} />
  </div>
  <br />
  <ConfigConsumerView />
</ConfigProvider>
