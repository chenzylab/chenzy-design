<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let val = $state<Date | Date[] | null>(null);
  let confirmed = $state('');
</script>

<Space vertical align="start">
  <!-- needConfirm：dateTime 需点击确认才写入值 -->
  <Space>
    <DatePicker
      type="dateTime"
      needConfirm
      value={val}
      onChange={(d) => (val = d)}
      onConfirm={(e) => (confirmed = e.value instanceof Date ? e.value.toLocaleString('zh-CN') : '')}
    />
    <Text type="tertiary">确认值：{confirmed || '（未确认）'}</Text>
  </Space>
</Space>
