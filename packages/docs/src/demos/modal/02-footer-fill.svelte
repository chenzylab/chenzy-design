<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = true)}>打开弹窗</Button>
<Modal
  title="基本对话框"
  {visible}
  footerFill={true}
  onOk={() => (visible = false)}
  onCancel={() => (visible = false)}
>
  This is the content of a basic modal.
  <br />
  More content...
</Modal>
