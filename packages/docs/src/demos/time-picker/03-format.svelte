<script lang="ts">
  import { TimePicker, Text } from '@chenzy-design/svelte';

  let value = $state<Date | null>(null);
</script>

<div style="display:flex; flex-direction:column; gap:12px; max-width:240px">
  <Text type="tertiary">format="HH:mm"，仅时、分两列</Text>
  <TimePicker
    {value}
    format="HH:mm"
    onChange={(t) => (value = Array.isArray(t) ? t[0] : t)}
  />
</div>
