<!--
  仅供 Popover.kbd.test.ts（browser project）使用的 dialog 模式 Esc 归还 e2e 夹具。
  trigger='click'：触发器 span 承载 role=button + tabindex=0，点击打开浮层（dialog 角色，
  trapFocus 默认随 click），Esc 关闭并归还焦点到触发器。content 含一个按钮供焦点陷阱断言。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Popover from './Popover.svelte';
</script>

<LocaleProvider locale="en_US">
  <Popover trigger="click" title="More info">
    {#snippet content()}
      <button type="button" data-testid="pop-btn">action</button>
    {/snippet}
    Open
  </Popover>
</LocaleProvider>
