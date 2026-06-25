<!--
  仅供 Drawer.kbd.test.ts（browser project）使用的焦点陷阱 e2e 夹具。
  trigger 按钮控制 open（受控）；测试先聚焦 trigger 再打开 Drawer，
  验证：打开后焦点进入对话框、Tab 被困在 Drawer 内循环、Esc 关闭后焦点归还 trigger。
  Drawer 默认有关闭叉 + 我们在 body 放两个按钮 + footer 两个按钮，构成多个可聚焦点测 Tab 循环。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Drawer from './Drawer.svelte';

  let open = $state(false);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="trigger" onclick={() => (open = true)}>open drawer</button>
  <Drawer
    {open}
    title="Edit profile"
    onOpenChange={(v) => (open = v)}
  >
    <button type="button" data-testid="body-a">body a</button>
    <button type="button" data-testid="body-b">body b</button>
    {#snippet footer()}
      <button type="button" data-testid="footer-cancel">Cancel</button>
      <button type="button" data-testid="footer-ok">OK</button>
    {/snippet}
  </Drawer>
</LocaleProvider>
