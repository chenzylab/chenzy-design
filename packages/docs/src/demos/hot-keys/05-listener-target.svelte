<script lang="ts">
  import { HotKeys, Input, Modal } from '@chenzy-design/svelte';

  // Semi 用 ref 拿 Input 的 DOM；本库 Input 以 getInputElement() 暴露底层原生 input（对齐 Semi inputRef.current）。
  let inputRef = $state<{ getInputElement: () => HTMLInputElement | null } | null>(null);

  const hotKeys = ['Control', 'q'];
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
  <Input bind:this={inputRef} placeholder="test for target" />
  <HotKeys
    {hotKeys}
    onHotKey={showDialog}
    getListenerTarget={() => inputRef?.getInputElement() ?? null}
  />
  <Modal title="Dialog" {visible} onOk={handleOk} onCancel={handleCancel}>
    This is the Modal opened by hotkey: {hotKeys.join('+')}.
  </Modal>
</div>
