<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';

  const presets = [
    {
      label: 'Today',
      value: new Date(),
    },
    {
      label: 'Tomorrow',
      value: new Date(new Date().valueOf() + 1000 * 3600 * 24),
    },
  ];
</script>

<DatePicker type="dateTime" {presets} presetPosition="left" />
