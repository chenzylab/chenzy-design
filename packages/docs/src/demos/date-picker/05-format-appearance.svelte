<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let formatVal = $state<Date | Date[] | null>(null);
  let smallVal = $state<Date | Date[] | null>(null);
  let largeVal = $state<Date | Date[] | null>(null);
  let errorVal = $state<Date | Date[] | null>(null);
</script>

<Space vertical align="start">
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker format="YYYY-MM-DD" placeholder="可手输 YYYY-MM-DD" value={formatVal} onChange={(d) => (formatVal = d)} />
    </span>
    <Text type="tertiary">
      自定义 format（可手动键入）：{formatVal instanceof Date ? formatVal.toLocaleDateString('zh-CN') : '（未选）'}
    </Text>
  </Space>
  <Space>
    <DatePicker size="small" value={smallVal} onChange={(d) => (smallVal = d)} />
    <Text type="tertiary">size="small"</Text>
  </Space>
  <Space>
    <DatePicker size="large" value={largeVal} onChange={(d) => (largeVal = d)} />
    <Text type="tertiary">size="large"</Text>
  </Space>
  <Space>
    <DatePicker status="error" value={errorVal} onChange={(d) => (errorVal = d)} />
    <Text type="tertiary">status="error"</Text>
  </Space>
  <Space>
    <DatePicker disabled defaultValue={new Date()} />
    <Text type="tertiary">disabled</Text>
  </Space>
</Space>
