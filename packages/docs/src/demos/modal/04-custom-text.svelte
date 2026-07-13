<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = true)}>自定义按钮文字</Button>
<Modal
  title="自定义按钮文字"
  {visible}
  okText="Sounds great!"
  cancelText="No, thanks."
  onOk={() => (visible = false)}
  onCancel={() => (visible = false)}
>
  <p>This is a modal with customized button texts.</p>
  <p>More content...</p>
</Modal>
