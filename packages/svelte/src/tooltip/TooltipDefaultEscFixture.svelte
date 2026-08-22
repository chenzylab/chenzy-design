<!--
  仅供 Tooltip.kbd.test.ts（browser project）使用的 closeOnEsc 默认值键盘 e2e 夹具。
  不传 closeOnEsc（走组件默认 false，对齐 Semi Tooltip defaultProps）：
  验证聚焦显示浮层后按 Esc，浮层默认不关闭。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Tooltip from './Tooltip.svelte';
</script>

<LocaleProvider locale="en_US">
  <Tooltip content="More info" trigger="focus">
    <button type="button" data-testid="trigger">Hover me</button>
  </Tooltip>
</LocaleProvider>
