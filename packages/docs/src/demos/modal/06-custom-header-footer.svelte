<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
  const showDialog = () => {
    visible = true;
  };
  const handleOk = () => {
    visible = false;
  };
  const handleCancel = () => {
    visible = false;
  };
</script>

<Button onclick={showDialog}>自定义页脚样式</Button>
<Modal
  title="自定义页脚"
  {visible}
  onOk={handleOk}
  onCancel={handleCancel}
>
  {#snippet footer()}
    <Button type="primary" onclick={handleOk}>Yes, I Understand</Button>
  {/snippet}
  <p>This is a modal with a customized footer.</p>
  <p>More content...</p>
</Modal>
