<!--
  TabPane — 声明式内容面板，配合 Tabs 使用。
  约束：标签栏由 Tabs 的 tabList 数据驱动；TabPane 仅提供「内容」并根据
  context 中的 activeKey getter 决定自身显隐（红线 #2：读 getter，不写挂载数组）。
  itemKey 需与对应 tabList 项一致。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getTabsContext } from './context.js';

  type TabKey = string | number;

  interface Props {
    itemKey: TabKey;
    tab?: string;
    disabled?: boolean;
    closable?: boolean;
    children?: Snippet;
  }

  let { itemKey, children }: Props = $props();

  const ctx = getTabsContext();
  const active = $derived(ctx?.getActiveKey() === itemKey);
</script>

{#if active}
  <div class="cd-tabs__panel" role="tabpanel">
    {@render children?.()}
  </div>
{/if}

<style>
  .cd-tabs__panel {
    outline: none;
  }
</style>
