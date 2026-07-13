<!--
  仅供 Modal.kbd.test.ts（browser project）使用的焦点陷阱 e2e 夹具。
  trigger 按钮控制 open（受控）；测试先聚焦 trigger 再打开 Modal，
  验证：打开后焦点进入对话框、Tab 被困在 Modal 内循环、关闭后焦点归还 trigger。
  Modal 默认 footer 有 Cancel/OK 两个按钮 + 关闭叉，构成多个可聚焦点用于测 Tab 循环。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Modal from './Modal.svelte';

  let open = $state(false);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="trigger" onclick={() => (open = true)}>open modal</button>
  <Modal
    visible={open}
    title="Delete item"
    onVisibleChange={(v) => (open = v)}
    onCancel={() => (open = false)}
  >
    <p>Are you sure?</p>
  </Modal>
</LocaleProvider>
