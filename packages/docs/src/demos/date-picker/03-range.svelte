<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let rangeVal = $state<[Date | null, Date | null] | null>(null);
  let maxRangeVal = $state<[Date | null, Date | null] | null>(null);

  // 禁用今天之前的日期
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const disablePast = (date: Date) => date.getTime() < todayMs;

  function fmt(r: [Date | null, Date | null] | null): string {
    if (r && r[0] && r[1]) {
      return `${r[0].toLocaleDateString('zh-CN')} ~ ${r[1].toLocaleDateString('zh-CN')}`;
    }
    return '（未选）';
  }
</script>

<Space vertical align="start">
  <Space>
    <span style="width:260px; display:inline-block">
      <DatePicker type="dateRange" value={rangeVal} disabledDate={disablePast} onChange={(r) => (rangeVal = r as [Date | null, Date | null] | null)} />
    </span>
    <Text type="tertiary">禁用过去日期：{fmt(rangeVal)}</Text>
  </Space>
  <Space>
    <span style="width:260px; display:inline-block">
      <DatePicker type="dateRange" maxRange={7} value={maxRangeVal} onChange={(r) => (maxRangeVal = r as [Date | null, Date | null] | null)} />
    </span>
    <Text type="tertiary">maxRange=7（最多 7 天跨度）：{fmt(maxRangeVal)}</Text>
  </Space>
</Space>
