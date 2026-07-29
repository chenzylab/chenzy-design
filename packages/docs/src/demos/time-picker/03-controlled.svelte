<script lang="ts">
  import { TimePicker } from '@chenzy-design/svelte';

  let value = $state<Date | null>(null);

  function onChange(time: (Date | null) | [Date | null, Date | null]) {
    console.log(time);
    value = Array.isArray(time) ? time[0] : time;
  }
</script>

<TimePicker {value} {onChange} />
