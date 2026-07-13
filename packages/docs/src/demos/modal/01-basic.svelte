<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
  function handleOk() {
    visible = false;
    console.log('Ok button clicked');
  }
  function handleCancel() {
    visible = false;
    console.log('Cancel button clicked');
  }
</script>

<Button onclick={() => (visible = true)}>打开弹窗</Button>
<Modal
  title="基本对话框"
  {visible}
  onOk={handleOk}
  onCancel={handleCancel}
  afterClose={() => console.log('After Close callback executed')}
  closeOnEsc={true}
>
  This is the content of a basic modal.
  <br />
  More content...
</Modal>
