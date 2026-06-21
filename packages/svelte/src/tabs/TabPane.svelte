<!--
  TabPane — 声明式内容面板，配合 Tabs 使用。
  两种用法：
  1) 父传 tabList（数据驱动标签栏）：TabPane 仅提供「内容」，按 context 的 activeKey getter 显隐，
     itemKey 需与对应 tabList 项一致。
  2) 父不传 tabList（纯声明式自动收集）：TabPane 额外把 tab/itemKey/disabled/closable 注册给父，
     父据此推导标签栏。注册/注销/同步均在 $effect（mount/unmount/元数据变化），向父写普通数组 +
     bump version（红线 #2：副作用写、render 读分离，绝不在注册 effect 读父快照 → 无自循环）。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { getTabsContext, type TabPaneRegistration } from './context.js';

  type TabKey = string | number;

  interface Props {
    itemKey: TabKey;
    tab?: string;
    disabled?: boolean;
    closable?: boolean;
    children?: Snippet;
  }

  let { itemKey, tab, disabled, closable, children }: Props = $props();

  const ctx = getTabsContext();
  const active = $derived(ctx?.getActiveKey() === itemKey);
  const lazy = $derived(ctx?.getLazy() ?? false);
  const keepDOM = $derived(ctx?.getKeepDOM() ?? false);

  // 纯声明式自动收集：mount 注册自身标签元数据、unmount 注销；元数据变化时 update 同步。
  // 红线 #2：注册 $effect 只向父写（普通数组 + version bump），绝不读父收集快照 → 无自循环。
  // 注册不依赖挂载与否（lazy 模式面板未挂载也要在标签栏出现），故独立于 shouldMount。
  // exactOptionalPropertyTypes：仅在有值时带 disabled/closable 键（不写 undefined）。
  function buildReg(): TabPaneRegistration {
    return {
      itemKey,
      tab: tab ?? String(itemKey),
      ...(disabled !== undefined ? { disabled } : {}),
      ...(closable !== undefined ? { closable } : {}),
    };
  }

  let paneId = $state(-1);
  $effect(() => {
    const reg = ctx?.registerPane;
    if (!reg) return;
    // 注册仅在 mount/unmount 跑一次：untrack 读初值，避免 itemKey 等变化触发重注册（保序）。
    const id = untrack(() => reg(buildReg()));
    paneId = id;
    return () => ctx?.unregisterPane?.(id);
  });
  // 元数据变化（tab/itemKey/disabled/closable）→ 同步给父（独立 effect，读响应值并写父）。
  $effect(() => {
    if (paneId === -1) return;
    ctx?.updatePane?.(paneId, buildReg());
  });

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
