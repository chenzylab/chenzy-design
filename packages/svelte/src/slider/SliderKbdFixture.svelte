<!--
  仅供 Slider.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  渲染单值 Slider 与 range Slider 两块：
   - 单值：一个 role=slider 手柄，方向键 / Home / End 真实调值（aria-valuenow）。
   - range：两个 role=slider 手柄，各自可聚焦、各自调值。
  before 按钮用于验证 Tab 真实聚焦到手柄。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Slider from './Slider.svelte';
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <div data-testid="single">
    <Slider defaultValue={50} min={0} max={100} step={1} ariaLabel="Volume" />
  </div>
  <div data-testid="range">
    <Slider range defaultValue={[20, 60]} min={0} max={100} step={1} ariaLabel="Range" />
  </div>
</LocaleProvider>
