<!--
  仅供 Tabs.a11y.test.ts 使用的测试夹具：声明式 <Tabs.Pane> 用法（含 role=tabpanel 面板），
  使 tab 的 aria-controls 指向真实存在的面板 id（axe aria-valid-attr-value 通过）。
  纯 tabList 用法不渲染面板，aria-controls 会悬空，不是 a11y-clean 路径。
-->
<script lang="ts">
  import { Tabs } from './index.js';

  interface Props {
    defaultValue?: string | number;
    type?: 'line' | 'card' | 'button';
  }
  let { defaultValue = 'overview', type = 'line' }: Props = $props();
</script>

<Tabs {defaultValue} {type}>
  <Tabs.Pane itemKey="overview" tab="Overview">Overview content</Tabs.Pane>
  <Tabs.Pane itemKey="details" tab="Details">Details content</Tabs.Pane>
  <Tabs.Pane itemKey="history" tab="History">History content</Tabs.Pane>
</Tabs>
