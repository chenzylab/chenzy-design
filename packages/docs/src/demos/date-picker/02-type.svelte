<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let dateTimeVal = $state<Date | Date[] | null>(null);
  let monthVal = $state<Date | Date[] | null>(null);
  let yearVal = $state<Date | Date[] | null>(null);
</script>

<Space vertical align="start">
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker type="dateTime" value={dateTimeVal} onChange={(d) => (dateTimeVal = d)} />
    </span>
    <Text type="tertiary">
      日期时间：{dateTimeVal instanceof Date ? dateTimeVal.toLocaleString('zh-CN') : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker type="month" value={monthVal} onChange={(d) => (monthVal = d)} />
    </span>
    <Text type="tertiary">
      月份：{monthVal instanceof Date ? `${monthVal.getFullYear()}-${monthVal.getMonth() + 1}` : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker type="year" value={yearVal} onChange={(d) => (yearVal = d)} />
    </span>
    <Text type="tertiary">
      年份：{yearVal instanceof Date ? yearVal.getFullYear() : '（未选）'}
    </Text>
  </Space>
</Space>
