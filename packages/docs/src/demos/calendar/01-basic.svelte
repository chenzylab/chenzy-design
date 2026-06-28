<script lang="ts">
  import { Calendar, Text } from '@chenzy-design/svelte';

  const anchor = new Date(2026, 5, 1);
  const events = [
    { key: 'm1', start: new Date(2026, 5, 3), title: '周会' },
    { key: 'm2', start: new Date(2026, 5, 10), title: '设计评审' },
    { key: 'm3', start: new Date(2026, 5, 15), end: new Date(2026, 5, 17), title: '出差', color: 'var(--cd-color-warning)' },
    { key: 'm4', start: new Date(2026, 5, 22), title: '发版', color: 'var(--cd-color-success)' },
  ];

  let selectedText = $state('（未选）');
</script>

<Calendar
  defaultValue={anchor}
  {events}
  maxEventsPerDay={3}
  onSelect={(info) => (selectedText = info.date.toLocaleDateString('zh-CN'))}
/>
<Text type="tertiary">选中日期：{selectedText}</Text>
