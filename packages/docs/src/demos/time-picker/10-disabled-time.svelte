<script lang="ts">
  import { TimePicker } from '@chenzy-design/svelte';

  function disabledTime(value: Date[], panelType?: 'left' | 'right') {
    const start = Array.isArray(value) ? value[0] : value;
    if (panelType === 'right' && start instanceof Date) {
      const h = start.getHours();
      const m = start.getMinutes();
      return {
        disabledHours: () => Array.from({ length: h }, (_, i) => i),
        disabledMinutes: (hour: number) =>
          hour === h ? Array.from({ length: m }, (_, i) => i) : [],
      };
    }
    return {};
  }
</script>

<TimePicker type="timeRange" {disabledTime} />
