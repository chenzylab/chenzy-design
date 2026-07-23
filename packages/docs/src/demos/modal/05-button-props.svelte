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

<Button onclick={showDialog}>自定义按钮属性</Button>
<Modal
  title="自定义按钮属性"
  {visible}
  onOk={handleOk}
  onCancel={handleCancel}
  okButtonProps={{ size: 'small', type: 'warning' }}
  cancelButtonProps={{ size: 'small', disabled: true }}
>
  <p>This is a modal with customized button props.</p>
  <p>More content...</p>
</Modal>
