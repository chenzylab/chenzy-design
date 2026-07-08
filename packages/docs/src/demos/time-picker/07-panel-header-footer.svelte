<script lang="ts">
  import { TimePicker } from '@chenzy-design/svelte';

  let value = $state<Date | null>(null);
</script>

<div style="display:flex; align-items:center; gap:12px">
  <TimePicker
    {value}
    panelHeader="选择时间"
    panelFooter="请选择营业时间"
    onChange={(t) => (value = Array.isArray(t) ? t[0] : t)}
  />
</div>
