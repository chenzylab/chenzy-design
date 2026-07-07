<script lang="ts">
  import { RangePicker, Space, Text } from '@chenzy-design/svelte';

  let dtRange = $state<[Date | null, Date | null] | null>(null);
  let noSecRange = $state<[Date | null, Date | null] | null>(null);

  // 起止时间列按日期禁用 0-7 点（示例：只允许工作时段起始）
  const disabledTime = () => ({
    disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7],
  });

  function fmt(r: [Date | null, Date | null] | null): string {
    if (r && r[0] && r[1]) {
      return `${r[0].toLocaleString('zh-CN')} ~ ${r[1].toLocaleString('zh-CN')}`;
    }
    return '（未选）';
  }
</script>

<Space vertical align="start">
  <Space>
    <span style="width:320px; display:inline-block">
      <RangePicker type="dateTimeRange" value={dtRange} onChange={(r) => (dtRange = r)} />
    </span>
    <Text type="tertiary">带时间范围（选完点「确定」提交）：{fmt(dtRange)}</Text>
  </Space>
  <Space>
    <span style="width:320px; display:inline-block">
      <RangePicker
        type="dateTimeRange"
        showSecond={false}
        {disabledTime}
        value={noSecRange}
        onChange={(r) => (noSecRange = r)}
      />
    </span>
    <Text type="tertiary">隐藏秒列 + disabledTime 禁用凌晨：{fmt(noSecRange)}</Text>
  </Space>
</Space>
