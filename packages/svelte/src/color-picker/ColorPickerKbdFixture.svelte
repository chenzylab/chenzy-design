<!--
  仅供 ColorPicker.kbd.test.ts（browser project）使用的焦点陷阱 e2e 夹具。
  ColorPicker 自带 trigger 按钮（aria-haspopup=dialog）；open 受控，点击 trigger 切换。
  浮层「非 portal」——面板渲染在 .cd-color-picker 根容器内（相对定位），
  故测试在 fixture container 范围内查 [role=dialog]，不在 document 查。
  验证：打开后焦点进入面板内首控件、Tab 困在面板内循环、Esc 关闭后焦点归还 trigger。
  alpha + presets 提供足量可聚焦点测 Tab 循环。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import ColorPicker from './ColorPicker.svelte';

  let open = $state(false);
  const presets = ['#ff0000', '#00ff00', '#0000ff'];
</script>

<LocaleProvider locale="en_US">
  <ColorPicker
    {open}
    value="#3366ff"
    {presets}
    ariaLabel="Pick color"
    onOpenChange={(v) => (open = v)}
  />
</LocaleProvider>
