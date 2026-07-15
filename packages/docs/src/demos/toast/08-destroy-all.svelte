<script lang="ts">
  import { Toast, Button } from '@chenzy-design/svelte';

  // 全局销毁：Toast.destroyAll()（对齐 Semi）。
  function openThree() {
    Toast.info({ content: 'First toast', duration: 0, stack: true });
    Toast.success({ content: 'Second toast', duration: 0, stack: true });
    Toast.warning({ content: 'Third toast', duration: 0, stack: true });
  }
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={openThree}>Open 3 Toasts</Button>
  <Button type="danger" onclick={() => Toast.destroyAll()}>Destroy All</Button>
</div>
