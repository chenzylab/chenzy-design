<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';
</script>

<DatePicker
  syncSwitchMonth={true}
  type="dateTimeRange"
  style="width: 400px"
  onPanelChange={(e) => console.log(e.panelDate)}
/>
