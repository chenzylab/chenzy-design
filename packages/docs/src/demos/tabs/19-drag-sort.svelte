<script lang="ts">
  import { Tabs, TabItem, sortable, arrayMove } from '@chenzy-design/svelte';
  import { IconFile, IconGlobe, IconLive, IconEdit } from '@chenzy-design/icons';
  import type { PlainTab } from '@chenzy-design/svelte';

  // 拖拽排序：复用本库 sortable action（core dnd-kit 思路，与 Table 拖拽同源）+ 真实
  // TabItem 组件渲染标签外观（对齐 Semi demo「直接复用 Tabs.TabItem，保留官方样式」的思路，
  // 含 icon 透传）。拖拽全程只叠加 CSS transform 不改 DOM，松手时 arrayMove 更新顺序（长度
  // 守恒零丢项）。水平标签栏用 axis:'x'（sortable 支持横/纵两轴）；用数据驱动 tabList 承载
  // （tabList 顺序随数组变，声明式 TabPane 的 mount 顺序收集无法随 keyed 重排更新）。
  interface PaneMeta {
    itemKey: string;
    tab: string;
    iconKey: 'file' | 'globe' | 'live' | 'edit';
  }

  let panes = $state<PaneMeta[]>([
    { itemKey: '1', tab: '文档', iconKey: 'file' },
    { itemKey: '2', tab: '快速起步', iconKey: 'globe' },
    { itemKey: '3', tab: '幻灯片', iconKey: 'live' },
    { itemKey: '4', tab: '表单', iconKey: 'edit' },
  ]);
  let active = $state<string | number>('1');

  const onReorder = (from: number, to: number) => {
    panes = arrayMove(panes, from, to);
  };
  const contentOf: Record<string, string> = {
    '1': '文档内容',
    '2': '快速起步内容',
    '3': '幻灯片内容',
    '4': '表单内容',
  };
</script>

{#snippet iconFile()}<IconFile />{/snippet}
{#snippet iconGlobe()}<IconGlobe />{/snippet}
{#snippet iconLive()}<IconLive />{/snippet}
{#snippet iconEdit()}<IconEdit />{/snippet}

{#snippet renderBar(
  list: PlainTab[],
  activeKey: string | number | undefined,
  setActive: (k: string | number) => void,
)}
  {@const iconMap = { file: iconFile, globe: iconGlobe, live: iconLive, edit: iconEdit }}
  <div
    class="cd-tabs-bar cd-tabs-bar-line cd-tabs-bar-top"
    role="tablist"
    use:sortable={{ axis: 'x', getItemCount: () => list.length, onReorder }}
  >
    {#each list as item (item.itemKey)}
      {@const meta = panes.find((p) => p.itemKey === item.itemKey)}
      <TabItem
        itemKey={item.itemKey}
        tab={item.tab}
        icon={meta ? iconMap[meta.iconKey] : undefined}
        selected={activeKey === item.itemKey}
        size="large"
        type="line"
        tabPosition="top"
        style="cursor: grab;"
        onClick={(key) => setActive(key)}
      />
    {/each}
  </div>
{/snippet}

<Tabs
  tabList={panes.map((p) => ({ itemKey: p.itemKey, tab: p.tab }))}
  activeKey={active}
  onChange={(k) => (active = k)}
  renderTabBar={renderBar}
>
  {contentOf[active] ?? ''}
</Tabs>
