<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';

  const handleChange = (date: unknown) => {
    console.log('date changed', date);
  };

  // 以周一为一周起始，取所在周的周一
  function startOfWeekMon(date: Date): Date {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // 周一=0 … 周日=6
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function endOfWeekMon(date: Date): Date {
    const d = startOfWeekMon(date);
    d.setDate(d.getDate() + 6);
    return d;
  }
  function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
</script>

<div>
  <h4>选择自然周</h4>
  <DatePicker
    style="width: 260px"
    type="dateRange"
    weekStartsOn={1}
    startDateOffset={(date) => startOfWeekMon(date)}
    endDateOffset={(date) => endOfWeekMon(date)}
    onChange={handleChange}
  />
  <br />
  <br />
  <h4>选择双周</h4>
  <DatePicker
    style="width: 260px"
    type="dateRange"
    weekStartsOn={1}
    startDateOffset={(date) => startOfWeekMon(date)}
    endDateOffset={(date) => addDays(endOfWeekMon(date), 7)}
    onChange={handleChange}
  />
  <br />
  <br />
  <h4>选择当前日和后6日</h4>
  <DatePicker
    style="width: 260px"
    type="dateRange"
    weekStartsOn={1}
    endDateOffset={(date) => addDays(date, 6)}
    onChange={handleChange}
  />
  <br />
  <br />
</div>
