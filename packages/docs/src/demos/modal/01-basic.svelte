<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let open = $state(false);
</script>

<Button type="primary" onclick={() => (open = true)}>打开对话框</Button>

<Modal
  title="对话框标题"
  open={open}
  onOpenChange={(v) => (open = v)}
  onOk={() => (open = false)}
  onCancel={() => (open = false)}
>
  <p>对话框内容区域，可以放置表单、说明文字等。</p>
</Modal>
