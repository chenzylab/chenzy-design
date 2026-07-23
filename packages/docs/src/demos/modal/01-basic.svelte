<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
  const showDialog = () => {
    visible = true;
  };
  const handleOk = () => {
    visible = false;
    console.log('Ok button clicked');
  };
  const handleCancel = () => {
    visible = false;
    console.log('Cancel button clicked');
  };
  const handleAfterClose = () => {
    console.log('After Close callback executed');
  };
</script>

<Button onclick={showDialog}>打开弹窗</Button>
<Modal
  title="基本对话框"
  {visible}
  onOk={handleOk}
  afterClose={handleAfterClose}
  onCancel={handleCancel}
  closeOnEsc={true}
>
  This is the content of a basic modal.
  <br />
  More content...
</Modal>
