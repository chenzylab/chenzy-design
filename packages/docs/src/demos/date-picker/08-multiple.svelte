<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let dates = $state<Date | Date[] | [Date | null, Date | null] | null>(null);
  const count = $derived(Array.isArray(dates) ? dates.length : 0);
</script>

<Space vertical align="start">
  <!-- multiple 多选（仅 type=date），value 为 Date[]，max 限制数量 -->
  <Space>
    <DatePicker
      multiple
      max={3}
      value={dates}
      placeholder="最多选 3 个日期"
      onChange={(d) => (dates = d)}
    />
    <Text type="tertiary">已选 {count} 个日期（上限 3）</Text>
  </Space>
</Space>
