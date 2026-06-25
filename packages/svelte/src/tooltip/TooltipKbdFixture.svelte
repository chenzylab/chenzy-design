<!--
  仅供 Tooltip.kbd.test.ts（browser project）使用的 Esc 关闭键盘 e2e 夹具。
  trigger='focus'：聚焦触发按钮即显示浮层（focusin），便于在真实浏览器里用键盘驱动；
  浮层 portal 到 document.body（use:floating），role=tooltip。
  验证：聚焦显示后按 Esc，useDismiss(escape:true) 关闭浮层。
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
