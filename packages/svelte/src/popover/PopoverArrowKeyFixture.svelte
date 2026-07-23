<!--
  仅供 Popover.kbd.test.ts 使用：hover 触发下 ArrowDown/ArrowUp 键盘移焦 + onEscKeyDown 回调夹具。
  hover 触发（tooltip 语义）打开后焦点仍在触发器，按 ⬇️ 焦点移入浮层首个可交互元素、
  按 ⬆️ 移到最后一个（对齐 Semi）。Esc 触发 onEscKeyDown 回调（此处 closeOnEsc=false，
  验证回调独立于关闭行为）。触发器为真实 button（可聚焦，keydown 冒泡到包裹 span 上的监听）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Popover from './Popover.svelte';

  let escCount = $state(0);
</script>

<LocaleProvider locale="en_US">
  <Popover trigger="hover" closeOnEsc={false} onEscKeyDown={() => (escCount += 1)}>
    {#snippet content()}
      <button type="button" data-testid="first">first</button>
      <button type="button" data-testid="last">last</button>
    {/snippet}
    <button type="button" data-testid="trigger">hover me</button>
  </Popover>
</LocaleProvider>

<div data-testid="esc-count">{escCount}</div>
