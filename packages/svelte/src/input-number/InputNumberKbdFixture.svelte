<!--
  仅供 InputNumber.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  InputNumber 焦点落在原生 <input role="spinbutton">：↑ 步进 +step、↓ -step、
  PageUp/PageDown 大步进，aria-valuenow 真实变化（钳到 min/max）。
  before 按钮验证 Tab 真实聚焦到 spinbutton。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import InputNumber from './InputNumber.svelte';
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <InputNumber defaultValue={5} min={0} max={100} step={1} ariaLabel="Quantity" />
</LocaleProvider>
