<!--
  仅供 Collapse.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  数据驱动 panels；Header 组为单一 Tab 停靠点（roving，真实焦点）。
  前后各放按钮验证 Tab 进入只停靠单个 Header、Tab 出去落到 after。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Collapse from './Collapse.svelte';

  const panels = [
    { key: 'p1', header: 'Panel One' },
    { key: 'p2', header: 'Panel Two' },
    { key: 'p3', header: 'Panel Three' },
  ];
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Collapse {panels}>
    {#snippet children({ key }: { key: string })}
      <p>content {key}</p>
    {/snippet}
  </Collapse>
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
