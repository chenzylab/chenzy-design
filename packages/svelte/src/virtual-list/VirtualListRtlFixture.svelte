<!--
  browser project 夹具（真实 chromium）：VirtualList horizontal 模式在 LTR / RTL 下的真实定位。
  验证首项（index 0）锚点：LTR 靠左（translateX(0)），RTL 靠右（.cd-rtl 镜像 right:0 +
  translateX 取负）。对齐本库 ScrollList/Field 等组件的 RTL 夹具写法。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import VirtualList from './VirtualList.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';

  const data = Array.from({ length: 50 }, (_, i) => i + 1);
</script>

<div data-testid="ltr" style="width: 300px">
  <VirtualList {data} itemSize={80} height={100} horizontal>
    {#snippet renderItem(item)}
      <div style="display:flex; align-items:center; justify-content:center; height:100%">{item}</div>
    {/snippet}
  </VirtualList>
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl" style="width: 300px">
    <VirtualList {data} itemSize={80} height={100} horizontal>
      {#snippet renderItem(item)}
        <div style="display:flex; align-items:center; justify-content:center; height:100%">{item}</div>
      {/snippet}
    </VirtualList>
  </div>
</ConfigProvider>
