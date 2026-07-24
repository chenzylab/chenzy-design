<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';
  import type { TabItem } from '@chenzy-design/svelte';

  // 拖拽排序：本库无 dnd-kit 依赖，通过 renderTabBar 自绘标签栏 + 原生 HTML5 draggable
  // 重排本地 panes 顺序实现（对齐 Semi「renderTabBar 结合拖拽库」的思路，改用零依赖自建拖拽）。
  let panes = $state([
    { itemKey: '1', tab: '文档', content: '文档内容' },
    { itemKey: '2', tab: '快速起步', content: '快速起步内容' },
    { itemKey: '3', tab: '帮助', content: '帮助内容' },
    { itemKey: '4', tab: '更新日志', content: '更新日志内容' },
  ]);
  let active = $state<string | number>('1');
  let dragKey = $state<string | number | null>(null);

  // 拖拽经过某标签时，把被拖项移动到该标签位置（基于 itemKey 稳定重排）。
  function moveTo(overKey: string | number) {
    if (dragKey === null || dragKey === overKey) return;
    const from = panes.findIndex((p) => p.itemKey === dragKey);
    const to = panes.findIndex((p) => p.itemKey === overKey);
    if (from === -1 || to === -1) return;
    const next = [...panes];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    panes = next;
  }
</script>

{#snippet renderBar(
  list: TabItem[],
  activeKey: string | number | undefined,
  setActive: (k: string | number) => void,
)}
  <div style="display:flex; gap:4px; margin-bottom:12px; border-bottom:1px solid var(--cd-color-border)">
    {#each list as item (item.itemKey)}
      <div
        role="tab"
        tabindex="0"
        draggable="true"
        aria-selected={activeKey === item.itemKey}
        ondragstart={() => (dragKey = item.itemKey)}
        ondragenter={() => moveTo(item.itemKey)}
        ondragover={(e) => e.preventDefault()}
        ondragend={() => (dragKey = null)}
        onclick={() => setActive(item.itemKey)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActive(item.itemKey);
          }
        }}
        style="padding:8px 16px; cursor:grab; user-select:none; border-bottom:2px solid {activeKey ===
        item.itemKey
          ? 'var(--cd-color-primary)'
          : 'transparent'}; color:{activeKey === item.itemKey
          ? 'var(--cd-color-primary)'
          : 'var(--cd-color-text-1)'}; background:{dragKey === item.itemKey
          ? 'var(--cd-color-fill-0)'
          : 'transparent'}"
      >
        {item.tab}
      </div>
    {/each}
  </div>
{/snippet}

<Tabs activeKey={active} onChange={(k) => (active = k)} renderTabBar={renderBar}>
  {#each panes as pane (pane.itemKey)}
    <TabPane tab={pane.tab} itemKey={pane.itemKey}>{pane.content}</TabPane>
  {/each}
</Tabs>
