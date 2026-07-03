<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let dateVal = $state<Date | Date[] | null>(null);
  let dateTimeVal = $state<Date | Date[] | null>(null);
</script>

<Space direction="vertical" align="start">
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker insetInput value={dateVal} onChange={(d) => (dateVal = d)} />
    </span>
    <Text type="tertiary">
      insetInput：面板顶部渲染可编辑日期框，可直接键入 YYYY-MM-DD（Enter 提交），与日历双向同步。
    </Text>
  </Space>
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker type="dateTime" insetInput value={dateTimeVal} onChange={(d) => (dateTimeVal = d)} />
    </span>
    <Text type="tertiary">
      type="dateTime" + insetInput：日期框 + 时间框，键入 HH:mm:ss 或点时间列均可，两者互相同步。
    </Text>
  </Space>
</Space>
