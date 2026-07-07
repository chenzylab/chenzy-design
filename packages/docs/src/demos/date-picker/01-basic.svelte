<script lang="ts">
  import { DatePicker, RangePicker, Space, Text } from '@chenzy-design/svelte';

  let dateVal = $state<Date | Date[] | null>(null);
  let rangeVal = $state<[Date | null, Date | null] | null>(null);
</script>

<Space vertical align="start">
  <Space>
    <DatePicker value={dateVal} onChange={(d) => (dateVal = d)} />
    <Text type="tertiary">
      日期：{dateVal instanceof Date ? dateVal.toLocaleDateString('zh-CN') : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span style="width:260px; display:inline-block">
      <RangePicker value={rangeVal} onChange={(r) => (rangeVal = r)} />
    </span>
    <Text type="tertiary">
      范围：{rangeVal && rangeVal[0] && rangeVal[1]
        ? `${rangeVal[0].toLocaleDateString('zh-CN')} ~ ${rangeVal[1].toLocaleDateString('zh-CN')}`
        : '（未选）'}
    </Text>
  </Space>
</Space>
