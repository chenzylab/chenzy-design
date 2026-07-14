<script lang="ts">
  import { notification, Button, ButtonGroup } from '@chenzy-design/svelte';
  import type { NotificationPosition } from '@chenzy-design/svelte';

  const opts = {
    duration: 3,
    content: 'semi-ui-notification',
    title: 'Hi bytedance',
  };
  const open = (position: NotificationPosition) =>
    notification.info({ ...opts, position });
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <ButtonGroup>
    <Button onclick={() => open('top')}>top</Button>
    <Button onclick={() => open('topLeft')}>topLeft</Button>
    <Button onclick={() => open('topRight')}>topRight</Button>
  </ButtonGroup>
  <ButtonGroup>
    <Button onclick={() => open('bottom')}>bottom</Button>
    <Button onclick={() => open('bottomRight')}>bottomRight</Button>
    <Button onclick={() => open('bottomLeft')}>bottomLeft</Button>
  </ButtonGroup>
</div>
