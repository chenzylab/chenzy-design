<script lang="ts">
  import { TimePicker, Button } from '@chenzy-design/svelte';

  let value = $state<Date | null>(null);
</script>

<div style="display:flex; align-items:center; gap:12px">
  <TimePicker {value} onChange={(t) => (value = Array.isArray(t) ? t[0] : t)}>
    {#snippet triggerRender({ value: v, placeholder, open })}
      <Button type={open ? 'primary' : 'secondary'}>
        {v ? v.toLocaleTimeString('zh-CN') : placeholder}
      </Button>
    {/snippet}
  </TimePicker>
</div>
