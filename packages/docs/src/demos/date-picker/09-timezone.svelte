<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let val = $state<Date | Date[] | null>(new Date('2024-06-01T12:00:00Z'));
</script>

<Space vertical align="start">
  <!-- timeZone 按 IANA 时区显示（格式化层注入，底层绝对时刻不变） -->
  <Space>
    <DatePicker
      type="dateTime"
      timeZone="America/New_York"
      value={val}
      onChange={(d) => (val = d)}
    />
    <Text type="tertiary">纽约时区显示</Text>
  </Space>
  <Space>
    <DatePicker
      type="dateTime"
      timeZone="Asia/Tokyo"
      value={val}
      onChange={(d) => (val = d)}
    />
    <Text type="tertiary">东京时区显示（同一时刻）</Text>
  </Space>
</Space>
