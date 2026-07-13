<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = true)}>点击遮罩层不可关闭</Button>
<Modal
  title="对话框标题"
  {visible}
  maskClosable={false}
  onOk={() => (visible = false)}
  onCancel={() => (visible = false)}
>
  <p>This is a modal that cannot be closed by clicking on the mask.</p>
  <p>More content...</p>
</Modal>
