<!--
  ColorPicker.kbd.test.ts（browser project）夹具：受控 ColorValue，onChange 回填。
  默认 inline，直接渲染 saturation/hue/alpha 三个 role=slider，测方向键微调。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import ColorPicker from './ColorPicker.svelte';
  import { colorValueFromHex, type ColorValue } from '@chenzy-design/core';

  let color = $state<ColorValue>(colorValueFromHex('#3366ff'));
</script>

<LocaleProvider locale="en_US">
  <ColorPicker value={color} alpha onChange={(c) => (color = c)} />
  <output data-testid="hex">{color.hex}</output>
  <output data-testid="hue">{color.hsva.h}</output>
</LocaleProvider>
