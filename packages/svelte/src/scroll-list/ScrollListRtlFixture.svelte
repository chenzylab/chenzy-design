<!--
  browser project 夹具（真实 chromium）：ScrollList 两列并排时，列间描边在 LTR / RTL 下的落边。
  normal 模式下 `:not(:last-child)` 列带一条描边，LTR 在右、RTL 在左（对齐 Semi scrollList/rtl.scss）。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import ScrollList from './ScrollList.svelte';
  import ScrollItem from './ScrollItem.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';

  const list = [
    { value: 0, text: '0' },
    { value: 1, text: '1' },
    { value: 2, text: '2' },
  ];
</script>

<div data-testid="ltr" style="width: 200px">
  <ScrollList bodyHeight={120}>
    <ScrollItem mode="normal" {list} selectedIndex={0} />
    <ScrollItem mode="normal" {list} selectedIndex={0} />
  </ScrollList>
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl" style="width: 200px">
    <ScrollList bodyHeight={120}>
      <ScrollItem mode="normal" {list} selectedIndex={0} />
      <ScrollItem mode="normal" {list} selectedIndex={0} />
    </ScrollList>
  </div>
</ConfigProvider>
