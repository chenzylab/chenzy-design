<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';

  const presets = [
    {
      text: 'Today',
      start: new Date(),
    },
    {
      text: 'Tomorrow',
      start: new Date(new Date().valueOf() + 1000 * 3600 * 24),
    },
  ];
</script>

<DatePicker type="dateTime" {presets} presetPosition="left" />
