<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';

  const today = new Date();
  function isToday(date: Date): boolean {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }
  function range(start: number, end: number): number[] {
    const arr: number[] = [];
    for (let i = start; i < end; i++) arr.push(i);
    return arr;
  }

  const disabledTime = (date: Date | Date[] | null) =>
    date instanceof Date && isToday(date)
      ? {
          disabledHours: () => [17, 18],
          disabledMinutes: (hour: number) => (hour === 19 ? range(0, 10) : []),
          disabledSeconds: (hour: number, minute: number) =>
            hour === 20 && minute === 20 ? range(0, 20) : [],
        }
      : {};

  const disabledTime2 = (_date: Date | Date[] | null, panelType?: 'left' | 'right') => {
    if (panelType === 'left') {
      return { disabledHours: () => [17, 18] };
    }
    return { disabledHours: () => [12, 13, 14, 15, 16, 17, 18] };
  };

  const disabledDate = (date: Date): boolean => {
    const deadDate = new Date();
    const month = deadDate.getMonth();
    deadDate.setDate(28);
    deadDate.setMonth((month + 1) % 12);
    return date.getTime() < deadDate.getTime();
  };

  // 面板初始定位到下个合法月
  const nextValidMonth = (() => {
    const d = new Date();
    d.setMonth((d.getMonth() + 1) % 12);
    return d;
  })();
</script>

<div>
  <div>
    <h4>禁用时间：禁用今天下午5-6点</h4>
    <DatePicker type="dateTime" hideDisabledOptions={false} {disabledTime} />
  </div>
  <div>
    <h4>禁用时间：两个面板禁用不同时间</h4>
    <DatePicker
      type="dateTimeRange"
      hideDisabledOptions={false}
      disabledTime={disabledTime2}
      style="width: 400px"
    />
  </div>
  <div>
    <h4>禁用日期：禁用下个月28号之前的所有日期</h4>
    <DatePicker
      type="dateTimeRange"
      {disabledDate}
      defaultPickerValue={nextValidMonth}
      style="width: 400px"
    />
  </div>
</div>
