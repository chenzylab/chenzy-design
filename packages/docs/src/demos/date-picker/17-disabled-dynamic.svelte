<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';

  // 动态禁用：禁止选择比已选起点更早的日期。rangeStart 为 'YYYY-MM-DD' 串。
  function disabledDate(date: Date, options: { rangeStart: string }): boolean {
    const { rangeStart } = options;
    if (!rangeStart) return false;
    const startDate = new Date(rangeStart);
    startDate.setHours(0, 0, 0, 0);
    return date.getTime() < startDate.getTime();
  }
</script>

<div>
  <h4>动态禁用日期：禁止选择之前的日期</h4>
  <DatePicker type="dateRange" {disabledDate} style="width: 260px" />
</div>
