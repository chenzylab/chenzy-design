<script lang="ts">
  import { TimePicker, Button } from '@chenzy-design/svelte';

  let open = $state(false);
  let value = $state<Date | null>(null);
</script>

<div style="display:flex; align-items:center; gap:12px">
  <Button onclick={() => (open = !open)}>{open ? '收起面板' : '展开面板'}</Button>
  <TimePicker
    {open}
    {value}
    onOpenChange={(o) => (open = o)}
    onChange={(t) => (value = Array.isArray(t) ? t[0] : t)}
  />
</div>
