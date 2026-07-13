<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = true)}>自定义按钮属性</Button>
<Modal
  title="自定义按钮属性"
  {visible}
  okButtonProps={{ size: 'small', type: 'warning' }}
  cancelButtonProps={{ size: 'small', disabled: true }}
  onOk={() => (visible = false)}
  onCancel={() => (visible = false)}
>
  <p>This is a modal with customized button props.</p>
  <p>More content...</p>
</Modal>
