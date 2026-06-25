<!--
  仅供 SideSheet.kbd.test.ts（browser project）使用的焦点陷阱 e2e 夹具。
  trigger 按钮控制 open（受控）；测试先聚焦 trigger 再打开 SideSheet，
  验证：打开后焦点进入对话框、Tab 被困在内循环、Esc 关闭后焦点归还 trigger。
  默认 mask=true 才启用 focus trap；motionDisabled 关掉进出动效，避免动画时序抖动。
  body 两个按钮 + 关闭叉 + footer 两个按钮构成多个可聚焦点测 Tab 循环。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import SideSheet from './SideSheet.svelte';

  let open = $state(false);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="trigger" onclick={() => (open = true)}>open sidesheet</button>
  <SideSheet
    {open}
    title="Filters"
    motionDisabled
    onOpenChange={(e) => (open = e.open)}
  >
    <button type="button" data-testid="body-a">body a</button>
    <button type="button" data-testid="body-b">body b</button>
    {#snippet footer({ close })}
      <button type="button" data-testid="footer-reset">Reset</button>
      <button type="button" data-testid="footer-apply" onclick={close}>Apply</button>
    {/snippet}
  </SideSheet>
</LocaleProvider>
