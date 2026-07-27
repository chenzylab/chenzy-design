<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';
</script>

<DatePicker
  format="yyyy年MM月dd日 HH:mm"
  type="dateTime"
  defaultValue={new Date()}
/>
