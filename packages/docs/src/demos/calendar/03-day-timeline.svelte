<script lang="ts">
  import { Calendar } from '@chenzy-design/svelte';

  const anchor = new Date(2026, 5, 15);
  const events = [
    { key: 'd1', start: new Date(2026, 5, 15), title: '全天值班', allDay: true },
    { key: 'd2', start: new Date(2026, 5, 15, 9, 0), end: new Date(2026, 5, 15, 10, 0), title: '晨会' },
    {
      key: 'd3',
      start: new Date(2026, 5, 15, 11, 0),
      end: new Date(2026, 5, 15, 12, 0),
      title: '需求评审',
      color: 'var(--cd-color-warning)',
    },
    {
      key: 'd4',
      start: new Date(2026, 5, 15, 14, 30),
      end: new Date(2026, 5, 15, 16, 0),
      title: '客户演示',
      color: 'var(--cd-color-success)',
    },
  ];
</script>

<Calendar
  mode="day"
  defaultValue={anchor}
  {events}
  dayStartHour={8}
  dayEndHour={18}
  showCurrTime={false}
/>
