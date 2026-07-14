<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';

  const opts = {
    title: 'Hi, Bytedance',
    content: 'Hi, Bytedance dance dance',
    duration: 3,
    theme: 'light' as const,
  };
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => notification.info(opts)}>Info</Button>
  <Button onclick={() => notification.success(opts)}>Success</Button>
  <Button type="warning" onclick={() => notification.warning(opts)}>Warning</Button>
  <Button type="danger" onclick={() => notification.error(opts)}>Error</Button>
</div>
