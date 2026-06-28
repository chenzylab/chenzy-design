<script lang="ts">
  import { Toast, Button } from '@chenzy-design/svelte';

  let pinnedId = $state('');

  function openPinned() {
    pinnedId = Toast.info('常驻提示，点「手动关闭」移除', { duration: 0, position: 'topRight' });
  }
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => Toast.success('1 秒后自动消失', { duration: 1 })}>1s 自动关闭</Button>
  <Button onclick={() => Toast.info('10 秒后自动消失', { duration: 10 })}>10s 自动关闭</Button>
  <Button onclick={openPinned}>常驻（duration: 0）</Button>
  <Button onclick={() => pinnedId && Toast.close(pinnedId)}>按 id 手动关闭</Button>
  <Button onclick={() => Toast.info('不可关闭、无关闭按钮', { closable: false })}>无关闭按钮</Button>
  <Button onclick={() => Toast.destroyAll()}>清空全部</Button>
</div>
