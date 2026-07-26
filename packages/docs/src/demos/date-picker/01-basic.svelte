<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';
</script>

<DatePicker onChange={(date, dateString) => console.log(dateString)} />
