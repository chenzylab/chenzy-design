<script lang="ts">
  // 严格复刻 Semi「基本用法」：通过 timeZone 参数为时间类组件配置时区。
  // GMT 列表按 Semi 原样从 -11 到 +14 逐时生成（两位补零）。
  import { ConfigProvider, Select, DatePicker, TimePicker } from '@chenzy-design/svelte';

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
    <DatePicker
      type="dateTime"
      defaultValue={defaultTimestamp}
      onChange={(date, dateString) => console.log('DatePicker changed: ', date, dateString)}
    />
    <br />
    <br />
    <!-- 本库 TimePicker 的 onChange 只回传值（单参），DatePicker 才是 (date, dateString) 两参。 -->
    <TimePicker
      defaultValue={defaultTimestamp}
      onChange={(date) => console.log('TimePicker changed: ', date)}
    />
  </div>
</ConfigProvider>
