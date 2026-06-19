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
  const lazy = $derived(ctx?.getLazy() ?? false);
  const keepDOM = $derived(ctx?.getKeepDOM() ?? false);

  // 记录是否曾激活过（红线 #2：本地 $state 在 effect 内写，不在 render 期写）。
  let everActive = $state(false);
  $effect(() => {
    if (active) everActive = true;
  });

  // 渲染策略：
  // - 非 keepDOM：仅渲染当前激活面板（切走即卸载）——天然懒挂。
  // - keepDOM + lazy：首次激活才挂，之后保留 DOM（display:none 隐藏）。
  // - keepDOM 非 lazy：预挂全部面板并保留（无懒加载）。
  const shouldMount = $derived(keepDOM ? (lazy ? everActive : true) : active);
</script>

{#if shouldMount}
  <div class="cd-tabs__panel" role="tabpanel" hidden={!active}>
    {@render children?.()}
  </div>
{/if}

<style>
  .cd-tabs__panel {
    outline: none;
  }
</style>
