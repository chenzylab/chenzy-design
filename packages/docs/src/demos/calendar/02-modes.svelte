<script lang="ts">
  import { Calendar, RadioGroup, Radio } from '@chenzy-design/svelte';

  const anchor = new Date(2026, 5, 15);
  const events = [
    { key: 'w1', start: new Date(2026, 5, 15), title: '站会' },
    { key: 'w2', start: new Date(2026, 5, 17), title: '联调' },
    { key: 'w3', start: new Date(2026, 5, 19), title: '复盘', color: 'var(--cd-color-success)' },
  ];

  let mode = $state<'month' | 'week' | 'day'>('month');
</script>

<RadioGroup
  type="button"
  value={mode}
  onChange={(v) => (mode = v as 'month' | 'week' | 'day')}
>
  <Radio value="month">月</Radio>
  <Radio value="week">周</Radio>
  <Radio value="day">日</Radio>
</RadioGroup>

<Calendar defaultValue={anchor} {mode} {events} />
