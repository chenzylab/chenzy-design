<!--
  仅供 TimePicker.kbd.test.ts（browser project）使用的交互 e2e 夹具。
  trigger 控制 open（受控）；defaultValue=08:30:45（非受控）让点击选中真正迁移。
  三列（时/分/秒）复用 ScrollList/ScrollItem，点击 li[role=option] 选中。
  必须引 tokens.css：不引则 var() 全失效（面板进出场动画用到 --cd-animation-duration-tooltip-*
  等 token，缺失会导致 animation-duration 解析为 0s，退场动画瞬间"播完"但 animationend
  仍会触发——本身不阻断，但会让"等待动画结束"类断言的时序假设与真实场景不符）。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import { LocaleProvider } from '../locale-provider/index.js';
  import TimePicker from './TimePicker.svelte';

  let open = $state(false);
  const defaultValue = new Date(2024, 0, 1, 8, 30, 45);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before" onclick={() => (open = true)}>open time picker</button>
  <TimePicker
    {open}
    {defaultValue}
    locale="en-US"
    onOpenChange={(v) => (open = v)}
  />
</LocaleProvider>
