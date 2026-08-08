<!--
  browser project 夹具（真实 chromium）：Tag 关闭叉在 LTR / RTL 下的位置。
  关闭叉靠 padding-left 与 direction 共同决定落点，只有真实布局能量出来。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import Tag from './Tag.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';
</script>

<div data-testid="ltr" style="width: 300px">
  <Tag closable={true}>标签文本</Tag>
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl" style="width: 300px">
    <Tag closable={true}>标签文本</Tag>
  </div>
</ConfigProvider>
