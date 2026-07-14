<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';

  function show() {
    const id = notification.open({
      title: 'Hi, Bytedance',
      content: 'ies dance dance dance',
      duration: 3,
    });
    setTimeout(() => {
      notification.open({
        id,
        title: 'Hi, Bytedance',
        content: 'updated',
        duration: 10,
      });
    }, 1000);
  }
</script>

<Button onclick={show}>Display Notification</Button>
