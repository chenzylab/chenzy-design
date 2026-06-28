<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => notification.info({ title: '左上', content: 'placement: topLeft', placement: 'topLeft' })}>topLeft</Button>
  <Button onclick={() => notification.info({ title: '顶部居中', content: 'placement: top', placement: 'top' })}>top</Button>
  <Button onclick={() => notification.info({ title: '右上（默认）', content: 'placement: topRight', placement: 'topRight' })}>topRight</Button>
  <Button onclick={() => notification.info({ title: '左下', content: 'placement: bottomLeft', placement: 'bottomLeft' })}>bottomLeft</Button>
  <Button onclick={() => notification.info({ title: '底部居中', content: 'placement: bottom', placement: 'bottom' })}>bottom</Button>
  <Button onclick={() => notification.info({ title: '右下', content: 'placement: bottomRight', placement: 'bottomRight' })}>bottomRight</Button>
  <Button onclick={() => notification.destroyAll()}>清空全部</Button>
</div>
