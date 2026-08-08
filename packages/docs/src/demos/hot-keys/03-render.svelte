<script lang="ts">
  import { HotKeys, Modal, Tag } from '@chenzy-design/svelte';

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
  const hotKeys = [HotKeys.Keys.Control, HotKeys.Keys.R];
</script>

<div>
  <HotKeys {hotKeys} onHotKey={showDialog}>
    {#snippet render()}
      <Tag>Press Ctrl+R to Open Modal</Tag>
    {/snippet}
  </HotKeys>
  <Modal title="Dialog" {visible} onOk={handleOk} onCancel={handleCancel}>
    This is the Modal opened by hotkey: {hotKeys.join('+')}.
  </Modal>
</div>
