<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';
</script>

<DatePicker
  type="dateTimeRange"
  style="width: 400px; margin-bottom: 8px"
  onChange={(...args) => console.log(...args)}
/>
<DatePicker
  type="dateTimeRange"
  style="width: 400px"
  defaultPickerValue={[
    new Date('2022-08-08 00:00'),
    new Date('2022-08-09 12:00'),
  ]}
  onChange={(...args) => console.log(...args)}
/>
