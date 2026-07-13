<script lang="ts">
  import { Modal, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = true)}>自定义页脚样式</Button>
<Modal
  title="自定义页脚"
  {visible}
  onOk={() => (visible = false)}
  onCancel={() => (visible = false)}
>
  {#snippet footer({ ok })}
    <Button type="primary" onclick={ok}>Yes, I Understand</Button>
  {/snippet}
  <p>This is a modal with a customized footer.</p>
  <p>More content...</p>
</Modal>
