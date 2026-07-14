<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';

  const opts = {
    content: 'Not auto close',
    title: 'Hi',
    duration: 0,
  };
  let ids = $state<string[]>([]);

  function show() {
    const id = notification.info(opts);
    ids = [...ids, id];
  }
  function hide() {
    const [first, ...rest] = ids;
    if (first) notification.close(first);
    ids = rest;
  }
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <Button type="primary" onclick={show}>Show Notification</Button>
  <Button type="primary" onclick={hide}>Hide Notification</Button>
</div>
