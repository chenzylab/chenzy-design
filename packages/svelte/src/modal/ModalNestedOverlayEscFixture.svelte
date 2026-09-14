<!--
  仅供 Modal.kbd.test.ts（browser project）使用的嵌套浮层 Escape 夹具。
  验证 useDismiss 的全局 Escape 栈：Modal 内嵌一个 DatePicker，DatePicker 面板打开时
  按 Escape 应只关 DatePicker 面板（栈顶/后挂载），Modal 应保持打开；DatePicker 面板
  关闭后再按 Escape 才轮到 Modal 响应。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Modal from './Modal.svelte';
  import DatePicker from '../date-picker/DatePicker.svelte';

  let modalOpen = $state(false);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="trigger" onclick={() => (modalOpen = true)}>
    open modal
  </button>
  <Modal
    visible={modalOpen}
    title="Pick a date"
    onVisibleChange={(v) => (modalOpen = v)}
    onCancel={() => (modalOpen = false)}
  >
    <DatePicker />
  </Modal>
</LocaleProvider>
