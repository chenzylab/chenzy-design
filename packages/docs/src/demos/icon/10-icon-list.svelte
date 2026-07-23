<script lang="ts">
  import type { Component } from 'svelte';
  import * as Icons from '@chenzy-design/icons';
  import * as IconsLab from '@chenzy-design/icons-lab';

  type IconEntry = [string, Component];

  function collect(mod: Record<string, unknown>): IconEntry[] {
    return Object.entries(mod)
      .filter(([name, val]) => /^Icon[A-Z]/.test(name) && typeof val === 'function')
      .map(([name, val]) => [name, val as Component]) as IconEntry[];
  }

  const mainIcons = collect(Icons as Record<string, unknown>);
  const labIcons = collect(IconsLab as Record<string, unknown>);

  // 对齐 Semi 图标列表：顶层按风格分「面性 / 线性 / AI / 彩色」标签页，
  // AI 标签内再按颜色数分 One / Two / Multiple Color 子组。
  const isAI = (n: string) => /^IconAI/.test(n);
  const isStroked = (n: string) => /Stroked$/.test(n);
  const isTwoColor = (n: string) => /^IconAI.*Level2$/.test(n);
  const isMultiColor = (n: string) => /^IconAI.*Level3$/.test(n) || n === 'IconAILoading';

  const filled = mainIcons.filter(([n]) => !isAI(n) && !isStroked(n));
  const stroked = mainIcons.filter(([n]) => !isAI(n) && isStroked(n));
  const aiIcons = mainIcons.filter(([n]) => isAI(n));
  const aiOne = aiIcons.filter(([n]) => !isTwoColor(n) && !isMultiColor(n));
  const aiTwo = aiIcons.filter(([n]) => isTwoColor(n));
  const aiMulti = aiIcons.filter(([n]) => isMultiColor(n));

  type Tab = { key: string; label: string; badge?: string };
  const tabs: Tab[] = [
    { key: 'filled', label: '面性图标' },
    { key: 'stroked', label: '线性图标' },
    { key: 'ai', label: 'AI 图标', badge: 'New' },
    { key: 'lab', label: '彩色图标' },
  ];
  let activeTab = $state('filled');

  let query = $state('');
  const match = (list: IconEntry[]) =>
    query ? list.filter(([n]) => n.toLowerCase().includes(query.toLowerCase())) : list;

  // AI 标签内的子分组可折叠（对齐 Semi 的 One/Two/Multiple Color ▾）。
  let collapsed = $state<Record<string, boolean>>({});
  const toggle = (key: string) => (collapsed = { ...collapsed, [key]: !collapsed[key] });

  const aiGroups = $derived([
    { key: 'one', label: 'One Color', items: match(aiOne) },
    { key: 'two', label: 'Two Color', items: match(aiTwo) },
    { key: 'multi', label: 'Multiple Color', items: match(aiMulti) },
  ]);

  const flatItems = $derived(
    activeTab === 'filled' ? match(filled) : activeTab === 'stroked' ? match(stroked) : match(labIcons),
  );

  let copied = $state('');
  async function copyName(name: string) {
    try {
      await navigator.clipboard.writeText(name);
      copied = name;
      setTimeout(() => (copied = ''), 1200);
    } catch {
      /* 剪贴板不可用时静默 */
    }
  }
</script>

<div class="icon-list">
  <!-- npm 包 badge（对齐 Semi） -->
  <div class="icon-list__badges">
    <span class="icon-list__badge">
      <span class="icon-list__badge-k">@chenzy-design/icons</span>
      <span class="icon-list__badge-v">{mainIcons.length}</span>
    </span>
    <span class="icon-list__badge">
      <span class="icon-list__badge-k">@chenzy-design/icons-lab</span>
      <span class="icon-list__badge-v">{labIcons.length}</span>
    </span>
  </div>

  <!-- 顶层风格标签页 -->
  <div class="icon-list__tabs" role="tablist">
    {#each tabs as tab (tab.key)}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === tab.key}
        class="icon-list__tab"
        class:icon-list__tab--active={activeTab === tab.key}
        onclick={() => (activeTab = tab.key)}
      >
        {tab.label}
        {#if tab.badge}<span class="icon-list__tab-badge">{tab.badge}</span>{/if}
      </button>
    {/each}
  </div>

  <input
    class="icon-list__search"
    type="search"
    placeholder="搜索图标名，如 arrow / user / ai…"
    bind:value={query}
    aria-label="搜索图标"
  />

  {#if activeTab === 'ai'}
    {#each aiGroups as group (group.key)}
      {#if group.items.length}
        <button
          type="button"
          class="icon-list__group"
          aria-expanded={!collapsed[group.key]}
          onclick={() => toggle(group.key)}
        >
          <span class="icon-list__caret" class:icon-list__caret--collapsed={collapsed[group.key]}>▾</span>
          {group.label}
          <span class="icon-list__group-hint">{group.items.length}</span>
        </button>
        {#if !collapsed[group.key]}
          <div class="icon-list__grid">
            {#each group.items as [name, IconComp] (name)}
              {@render cell(name, IconComp)}
            {/each}
          </div>
        {/if}
      {/if}
    {/each}
  {:else}
    <div class="icon-list__grid">
      {#each flatItems as [name, IconComp] (name)}
        {@render cell(name, IconComp)}
      {/each}
    </div>
  {/if}
</div>

{#snippet cell(name: string, IconComp: Component)}
  <button
    type="button"
    class="icon-list__cell"
    class:icon-list__cell--copied={copied === name}
    title={name}
    onclick={() => copyName(name)}
  >
    <span class="icon-list__glyph"><IconComp size="extra-large" /></span>
    <span class="icon-list__name">{copied === name ? '已复制' : name}</span>
  </button>
{/snippet}

<style>
  .icon-list__badges {
    display: flex;
    gap: 12px;
    margin-block-end: 16px;
  }
  .icon-list__badge {
    display: inline-flex;
    font-size: 12px;
    border-radius: 4px;
    overflow: hidden;
  }
  .icon-list__badge-k {
    padding: 3px 8px;
    background: var(--cd-color-fill-2, #555);
    color: #fff;
  }
  .icon-list__badge-v {
    padding: 3px 8px;
    background: var(--cd-color-primary);
    color: #fff;
  }
  .icon-list__tabs {
    display: flex;
    gap: 24px;
    border-block-end: 1px solid var(--cd-color-border);
    margin-block-end: 16px;
  }
  .icon-list__tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-1);
    font-size: 14px;
    cursor: pointer;
  }
  .icon-list__tab--active {
    color: var(--cd-color-primary);
    font-weight: 600;
  }
  .icon-list__tab--active::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    inset-block-end: -1px;
    block-size: 2px;
    background: var(--cd-color-primary);
  }
  .icon-list__tab-badge {
    padding: 1px 6px;
    border-radius: 8px;
    background: var(--cd-color-primary-light-default, rgba(0, 100, 250, 0.1));
    color: var(--cd-color-primary);
    font-size: 11px;
  }
  .icon-list__search {
    inline-size: 100%;
    max-inline-size: 320px;
    box-sizing: border-box;
    padding: 6px 12px;
    margin-block-end: 16px;
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium, 6px);
    background: var(--cd-color-bg-1);
    color: var(--cd-color-text-0);
    font-size: 14px;
  }
  .icon-list__group {
    display: flex;
    align-items: baseline;
    gap: 8px;
    inline-size: 100%;
    margin: 16px 0 12px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-0);
    font-size: 14px;
    font-weight: 600;
    text-align: start;
    cursor: pointer;
  }
  .icon-list__caret {
    display: inline-block;
    color: var(--cd-color-text-2);
    transition: transform 0.15s;
  }
  .icon-list__caret--collapsed {
    transform: rotate(-90deg);
  }
  .icon-list__group-hint {
    color: var(--cd-color-text-2);
    font-size: 12px;
    font-weight: 400;
  }
  .icon-list__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
    gap: 8px;
  }
  .icon-list__cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 6px;
    border: 1px solid transparent;
    border-radius: var(--cd-border-radius-medium, 6px);
    background: transparent;
    color: var(--cd-color-text-0);
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .icon-list__cell:hover {
    background: var(--cd-color-fill-0);
    border-color: var(--cd-color-border);
  }
  .icon-list__cell--copied {
    border-color: var(--cd-color-primary);
  }
  .icon-list__glyph {
    font-size: 24px;
    line-height: 1;
  }
  .icon-list__name {
    inline-size: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    color: var(--cd-color-text-2);
    font-size: 12px;
  }
</style>
