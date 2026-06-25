<!--
  仅供 List.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  selectable="single" → role=listbox / 行 role=option，roving 单停靠点（真实焦点）。
  前后各放按钮验证 Tab 进入只停靠单行、Tab 出去落到 after。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import List from './List.svelte';

  type Row = { key: string; label: string };
  const dataSource: Row[] = [
    { key: 'a', label: 'Alpha' },
    { key: 'b', label: 'Bravo' },
    { key: 'c', label: 'Charlie' },
  ];
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <List
    {dataSource}
    rowKey="key"
    selectable="single"
    ariaLabel="People"
  >
    {#snippet renderItem(item: Row)}
      <span>{item.label}</span>
    {/snippet}
  </List>
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
