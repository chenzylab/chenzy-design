<script lang="ts">
  import { Drawer, Button } from '@chenzy-design/svelte';

  let open = $state(false);
  let placement = $state<'left' | 'right' | 'top' | 'bottom'>('right');

  function openDrawer(p: typeof placement) {
    placement = p;
    open = true;
  }
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <Button onclick={() => openDrawer('right')}>从右侧</Button>
  <Button onclick={() => openDrawer('left')}>从左侧</Button>
  <Button onclick={() => openDrawer('top')}>从顶部</Button>
  <Button onclick={() => openDrawer('bottom')}>从底部</Button>
</div>

<Drawer
  title="抽屉"
  {placement}
  open={open}
  onOpenChange={(v) => (open = v)}
  onClose={() => (open = false)}
>
  <p>从 {placement} 方向滑入的抽屉</p>
</Drawer>
