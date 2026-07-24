<script lang="ts">
  import { Tabs, sortable, arrayMove } from '@chenzy-design/svelte';
  import type { TabItem } from '@chenzy-design/svelte';

  // 拖拽排序：复用本库 sortable action（core dnd-kit 思路，与 Table 拖拽同源）——
  // 拖拽全程只叠加 CSS transform 不改 DOM，松手时 arrayMove 更新顺序（长度守恒零丢项）。
  // 水平标签栏用 axis:'x'（sortable 支持横/纵两轴）；用数据驱动 tabList 承载
  // （tabList 顺序随数组变，声明式 TabPane 的 mount 顺序收集无法随 keyed 重排更新）。
  // 对齐 Semi「renderTabBar 结合拖拽库」思路，改用本库自建 sortable 零第三方依赖。
  let panes = $state<TabItem[]>([
    { itemKey: '1', tab: '文档' },
    { itemKey: '2', tab: '快速起步' },
    { itemKey: '3', tab: '帮助' },
    { itemKey: '4', tab: '更新日志' },
  ]);
  let active = $state<string | number>('1');

  const onReorder = (from: number, to: number) => {
    panes = arrayMove(panes, from, to);
  };
  const contentOf: Record<string, string> = {
    '1': '文档内容',
    '2': '快速起步内容',
    '3': '帮助内容',
    '4': '更新日志内容',
  };
</script>

{#snippet renderBar(
  list: TabItem[],
  activeKey: string | number | undefined,
  setActive: (k: string | number) => void,
)}
  <div
    use:sortable={{ axis: 'x', getItemCount: () => list.length, onReorder }}
    style="display:flex; gap:4px; margin-bottom:12px; border-bottom:1px solid var(--cd-color-border)"
  >
    {#each list as item (item.itemKey)}
      <div
        role="tab"
        tabindex="0"
        data-sortable-item
        aria-selected={activeKey === item.itemKey}
        onclick={() => setActive(item.itemKey)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActive(item.itemKey);
          }
        }}
        style="padding:8px 16px; cursor:grab; user-select:none; white-space:nowrap; border-bottom:2px solid {activeKey ===
        item.itemKey
          ? 'var(--cd-color-primary)'
          : 'transparent'}; color:{activeKey === item.itemKey
          ? 'var(--cd-color-primary)'
          : 'var(--cd-color-text-1)'}"
      >
        {item.tab}
      </div>
    {/each}
  </div>
{/snippet}

<Tabs tabList={panes} activeKey={active} onChange={(k) => (active = k)} renderTabBar={renderBar}>
  {contentOf[active] ?? ''}
</Tabs>
