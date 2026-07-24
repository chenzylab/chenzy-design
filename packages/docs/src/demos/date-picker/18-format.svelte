<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';
</script>

<DatePicker
  format="YYYY年MM月DD日 HH:mm"
  type="dateTime"
  defaultValue={new Date()}
/>
