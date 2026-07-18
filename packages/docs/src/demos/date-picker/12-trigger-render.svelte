<script lang="ts">
  import { DatePicker, Button, Space, Text } from '@chenzy-design/svelte';

  let val = $state<Date | Date[] | [Date | null, Date | null] | null>(null);
  const label = $derived(val instanceof Date ? val.toLocaleDateString('zh-CN') : '选择日期');
</script>

<Space align="center">
  <!-- triggerRender 完全自定义触发器 -->
  <DatePicker value={val} onChange={(d) => (val = d)}>
    {#snippet triggerRender()}
      <Button type="tertiary">
        <span style="display:inline-flex;align-items:center;gap:6px">📅 {label}</span>
      </Button>
    {/snippet}
  </DatePicker>
  <Text type="tertiary">{val instanceof Date ? '已选' : '未选'}</Text>
</Space>
