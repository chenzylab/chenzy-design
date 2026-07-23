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

<Button onclick={showDialog}>自定义按钮文字</Button>
<Modal
  title="自定义按钮文字"
  {visible}
  onOk={handleOk}
  onCancel={handleCancel}
  okText={'Sounds great!'}
  cancelText={'No, thanks.'}
>
  <p>This is a modal with customized button texts.</p>
  <p>More content...</p>
</Modal>
