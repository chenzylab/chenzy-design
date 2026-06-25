<!--
  仅供 Tabs.kbd.test.ts（browser project）使用的 tablist roving 键盘 e2e 夹具。
  声明式 <Tabs.Pane> 用法：tab 的 aria-controls 指向真实面板，面板按 activeKey 显隐，
  便于断言 keyboardActivation='auto'（默认）下「焦点移动即激活」。
  菜单前后各放一个按钮，用于验证 roving 单停靠点（Tab 只进一个 tab，其余 tabindex=-1）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Tabs } from './index.js';

  interface Props {
    defaultValue?: string;
  }
  let { defaultValue = 'overview' }: Props = $props();
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Tabs {defaultValue} type="line">
    <Tabs.Pane itemKey="overview" tab="Overview">Overview content</Tabs.Pane>
    <Tabs.Pane itemKey="details" tab="Details">Details content</Tabs.Pane>
    <Tabs.Pane itemKey="history" tab="History">History content</Tabs.Pane>
  </Tabs>
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
