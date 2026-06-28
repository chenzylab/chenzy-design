<script lang="ts">
  import { Toast, Button } from '@chenzy-design/svelte';
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => Toast.info('左上角', { position: 'topLeft' })}>topLeft</Button>
  <Button onclick={() => Toast.info('顶部居中', { position: 'top' })}>top</Button>
  <Button onclick={() => Toast.info('右上角', { position: 'topRight' })}>topRight</Button>
  <Button onclick={() => Toast.info('左下角', { position: 'bottomLeft' })}>bottomLeft</Button>
  <Button onclick={() => Toast.info('底部居中', { position: 'bottom' })}>bottom</Button>
  <Button onclick={() => Toast.info('右下角', { position: 'bottomRight' })}>bottomRight</Button>
</div>
