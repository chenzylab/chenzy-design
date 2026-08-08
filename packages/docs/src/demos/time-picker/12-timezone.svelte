<script lang="ts">
  import { ConfigProvider, Select, TimePicker } from '@chenzy-design/svelte';

  let timeZone = $state('GMT+08:00');
  const defaultTimestamp = 1581599305265;

  const gmtList = (() => {
    const list: { label: string; value: string }[] = [];
    for (let hourOffset = -11; hourOffset <= 14; hourOffset++) {
      const prefix = hourOffset >= 0 ? '+' : '-';
      const hOffset = Math.abs(hourOffset);
      const gmt = `GMT${prefix}${String(hOffset).padStart(2, '0')}:00`;
      list.push({ label: gmt, value: gmt });
    }
    return list;
  })();
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
      onChange={(v) => (timeZone = v as string)}
    />
    <br />
    <br />
    <h5 style="margin: 10px">TimePicker:</h5>
    <TimePicker
      defaultValue={new Date(defaultTimestamp)}
      onChange={(date) => console.log('TimePicker changed: ', date)}
    />
  </div>
</ConfigProvider>
