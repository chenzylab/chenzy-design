<script lang="ts">
  import { HotKeys, Modal } from '@chenzy-design/svelte';

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
  const hotKeys = [HotKeys.Keys.Control, 'Shift', HotKeys.Keys.A];
</script>

<div>
  <HotKeys {hotKeys} onHotKey={showDialog} />
  <Modal title="Dialog" {visible} onOk={handleOk} onCancel={handleCancel}>
    This is the Modal opened by hotkey: {hotKeys.join('+')}.
  </Modal>
</div>
