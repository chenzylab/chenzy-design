<script lang="ts">
  import { TimePicker } from '@chenzy-design/svelte';
</script>

<div>
  <TimePicker type="timeRange" defaultValue={['10:23:15', '12:38:32']} /><br /><br />
  <TimePicker type="timeRange" use12Hours format="a h:mm" defaultValue={['上午 08:11', '下午 11:21']} />
</div>
