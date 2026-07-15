<script lang="ts">
  import { Toast, Button } from '@chenzy-design/svelte';

  // duration 设为 0 时 toast 不会自动关闭，必须手动关闭（对齐 Semi）。
  let toastId = $state<string | null>(null);

  function destroy() {
    toastId = null;
  }
  function show() {
    if (toastId) return;
    toastId = Toast.info({ content: 'Not auto close', duration: 0, onClose: destroy });
  }
  function hide() {
    if (toastId) Toast.close(toastId);
    destroy();
  }
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button type="primary" onclick={show}>Show Toast</Button>
  <Button type="primary" onclick={hide}>Hide Toast</Button>
</div>
