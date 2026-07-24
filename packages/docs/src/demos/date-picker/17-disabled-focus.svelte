<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';

  const today = new Date();
  function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
  function subDays(date: Date, days: number): Date {
    return addDays(date, -days);
  }

  // 按当前聚焦端禁用不同区间：起始输入框聚焦禁今天前2/后2天，结束输入框聚焦禁前3/后3天。
  function disabledDate(
    date: Date,
    options: { rangeInputFocus: 'rangeStart' | 'rangeEnd' | false },
  ): boolean {
    const { rangeInputFocus } = options;
    const baseDate = new Date(today);
    baseDate.setHours(0, 0, 0, 0);
    if (rangeInputFocus === 'rangeStart') {
      return subDays(baseDate, 2) <= date && date <= addDays(baseDate, 2);
    } else if (rangeInputFocus === 'rangeEnd') {
      return subDays(baseDate, 3) <= date && date <= addDays(baseDate, 3);
    }
    return false;
  }
</script>

<div>
  <h4>开始日期禁用今天前2日和后2日，结束日期禁用今天前3天和后3天</h4>
  <DatePicker
    motion={false}
    type="dateRange"
    {disabledDate}
    defaultPickerValue={today}
  />
</div>
