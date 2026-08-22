<!--
  仅供 Tooltip.kbd.test.ts（browser project）使用的 Esc 关闭键盘 e2e 夹具。
  trigger='focus'：聚焦触发按钮即显示浮层（focusin），便于在真实浏览器里用键盘驱动；
  浮层 portal 到 document.body（use:floating），role=tooltip。
  closeOnEsc 默认 false（对齐 Semi Tooltip defaultProps），故此夹具显式传 closeOnEsc={true}
  以测试用户主动开启该行为时 useDismiss(escape:true) 能正确关闭浮层。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Tooltip from './Tooltip.svelte';
</script>

<LocaleProvider locale="en_US">
  <Tooltip content="More info" trigger="focus" closeOnEsc={true}>
    <button type="button" data-testid="trigger">Hover me</button>
  </Tooltip>
</LocaleProvider>
