<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';
</script>

<DatePicker
  type="dateRange"
  style="width: 260px"
  onChange={(...args) => console.log(...args)}
/>
