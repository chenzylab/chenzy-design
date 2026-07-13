<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
  function onClose() {
    visible = false;
  }
</script>

<Button onclick={() => (visible = true)}>打开全屏弹窗</Button>
<Modal title="全屏对话框标题" fullScreen {visible} onOk={onClose} onCancel={onClose}>
  <p>This is a full screen modal</p>
  <p>More content...</p>
</Modal>
