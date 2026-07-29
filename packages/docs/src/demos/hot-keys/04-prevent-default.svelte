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
</script>

<div>
  <HotKeys hotKeys={[HotKeys.Keys.Meta, HotKeys.Keys.S]} onHotKey={showDialog} preventDefault />
  <br />
  <HotKeys hotKeys={[HotKeys.Keys.Control, HotKeys.Keys.S]} onHotKey={showDialog} preventDefault />
  <Modal title="Dialog" {visible} onOk={handleOk} onCancel={handleCancel}>
    This is the Modal opened by hotkey: {'Meta/Control + S'}.
  </Modal>
</div>
