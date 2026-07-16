<!--
  仅供 Tabs.kbd.test.ts（browser project）使用的 tablist roving 键盘 e2e 夹具。
  声明式 <Tabs.Pane> 用法：tab 的 aria-controls 指向真实面板，面板按 activeKey 显隐，
  便于断言对齐 Semi 的手动激活（方向键仅移动焦点，Enter/Space 才激活）。
  菜单前后各放一个按钮，用于验证 roving 单停靠点（Tab 只进一个 tab，其余 tabindex=-1）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Tabs } from './index.js';

  interface Props {
    defaultActiveKey?: string;
  }
  let { defaultActiveKey = 'overview' }: Props = $props();
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Tabs {defaultActiveKey} type="line">
    <Tabs.Pane itemKey="overview" tab="Overview">Overview content</Tabs.Pane>
    <Tabs.Pane itemKey="details" tab="Details">Details content</Tabs.Pane>
    <Tabs.Pane itemKey="history" tab="History">History content</Tabs.Pane>
  </Tabs>
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
