<!--
  仅供 Switch.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  Switch 对齐 Semi DOM 结构，role="switch" 挂在隐藏的 <input type=checkbox>，
  焦点落在该 input；Space 经原生 checkbox 行为触发 toggle，aria-checked 翻转。
  夹具暴露 onChange 写入 lastValue。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Switch from './Switch.svelte';

  let lastValue = $state<unknown>(undefined);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Switch
    aria-label="Toggle"
    onChange={(v) => {
      lastValue = v;
    }}
  />
  <output data-testid="value">{JSON.stringify(lastValue ?? null)}</output>
</LocaleProvider>
