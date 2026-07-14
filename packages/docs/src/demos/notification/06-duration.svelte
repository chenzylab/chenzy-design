<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';
</script>

<Button
  onclick={() =>
    notification.info({
      content: 'Hi, Bytedance dance dance',
      duration: 10,
    })}
>
  Close After 10s
</Button>
