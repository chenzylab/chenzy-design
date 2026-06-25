<!--
  仅供 Popconfirm.kbd.test.ts（browser project）使用的浮层焦点 + Esc 归还 e2e 夹具。
  triggerType='click'（默认）：触发器 div 承载 role=button + tabindex=0，点击/Enter 打开浮层
  （dialog，焦点陷阱移入），Esc 关闭并归还焦点到触发器。浮层默认含取消/确认两个按钮。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Popconfirm from './Popconfirm.svelte';
</script>

<LocaleProvider locale="en_US">
  <Popconfirm title="Delete this item?" content="This cannot be undone.">
    {#snippet trigger()}
      Delete
    {/snippet}
  </Popconfirm>
</LocaleProvider>
