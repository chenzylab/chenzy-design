<!--
  仅供 SideSheet.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  trigger 按钮控制 visible（受控）；测试验证对齐 Semi 的真实键盘行为：
    打开后对话框在 document 中、Esc 关闭（closeOnEsc=true）、footer close() 关闭。
  Semi 的 SideSheet 不做 focus trap（与 Semi 一致）；motion=false 关掉进出动效稳住时序。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import SideSheet from './SideSheet.svelte';

  let visible = $state(false);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="trigger" onclick={() => (visible = true)}>open sidesheet</button>
  <SideSheet
    {visible}
    title="Filters"
    motion={false}
    closeOnEsc
    onCancel={() => (visible = false)}
  >
    <button type="button" data-testid="body-a">body a</button>
    <button type="button" data-testid="body-b">body b</button>
    {#snippet footer({ close })}
      <button type="button" data-testid="footer-reset">Reset</button>
      <button type="button" data-testid="footer-apply" onclick={close}>Apply</button>
    {/snippet}
  </SideSheet>
</LocaleProvider>
