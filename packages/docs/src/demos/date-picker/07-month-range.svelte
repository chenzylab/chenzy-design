<script lang="ts">
  import { RangePicker, Space, Text } from '@chenzy-design/svelte';

  let monthRange = $state<[Date | null, Date | null] | null>(null);
  const preset = $state<[Date | null, Date | null]>([
    new Date(2024, 2, 1),
    new Date(2024, 6, 1),
  ]);

  function fmt(r: [Date | null, Date | null] | null): string {
    if (r && r[0] && r[1]) {
      const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit' };
      return `${r[0].toLocaleDateString('zh-CN', opts)} ~ ${r[1].toLocaleDateString('zh-CN', opts)}`;
    }
    return '（未选）';
  }
</script>

<Space direction="vertical" align="start">
  <Space>
    <span style="width:260px; display:inline-block">
      <RangePicker type="monthRange" value={monthRange} onChange={(r) => (monthRange = r)} />
    </span>
    <Text type="tertiary">月份范围（双月份面板选起止月）：{fmt(monthRange)}</Text>
  </Space>
  <Space>
    <span style="width:260px; display:inline-block">
      <RangePicker type="monthRange" defaultValue={preset} />
    </span>
    <Text type="tertiary">带默认值 2024-03 ~ 2024-07</Text>
  </Space>
</Space>
