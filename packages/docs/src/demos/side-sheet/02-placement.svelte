<script lang="ts">
  import { SideSheet, Button, Text } from '@chenzy-design/svelte';

  type Placement = 'left' | 'right' | 'top' | 'bottom';
  let placement = $state<Placement>('right');
  let open = $state(false);

  function show(p: Placement) {
    placement = p;
    open = true;
  }
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button type="primary" onclick={() => show('right')}>右侧 right</Button>
  <Button onclick={() => show('left')}>左侧 left</Button>
  <Button onclick={() => show('top')}>顶部 top</Button>
  <Button onclick={() => show('bottom')}>底部 bottom</Button>
</div>

<SideSheet
  {open}
  {placement}
  title="placement = {placement}"
  onOpenChange={(e) => (open = e.open)}
>
  <Text>从视口「{placement}」边滑入。Esc 或点击遮罩关闭，关闭后焦点归还触发按钮。</Text>
</SideSheet>
