<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';
</script>

<div>
  <DatePicker type="date" insetInput />
  <br />
  <br />
  <DatePicker type="dateTime" insetInput />
  <br />
  <br />
  <DatePicker type="dateRange" insetInput style="width: 260px" />
  <br />
  <br />
  <DatePicker type="dateTimeRange" insetInput style="width: 400px" />
  <br />
  <br />
  <DatePicker
    type="month"
    placeholder="请选择年月"
    insetInput
    style="width: 140px"
  />
  <br />
  <br />
  <DatePicker
    type="monthRange"
    placeholder="请选择年月范围"
    insetInput
    style="width: 200px"
  />
  <br />
  <br />
  <DatePicker type="date" position="bottomLeft" insetInput />
  <br />
  <br />
  <DatePicker type="dateTime" format="YYYY-MM-DD HH:mm" insetInput />
</div>
