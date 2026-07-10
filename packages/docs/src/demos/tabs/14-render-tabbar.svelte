<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';
  import type { TabItem } from '@chenzy-design/svelte';

  let active = $state<string | number>('1');
</script>

{#snippet renderBar(list: TabItem[], activeKey: string | number | undefined, setActive: (k: string | number) => void)}
  <div style="padding: 8px; margin-bottom: 8px; border-radius: 6px; background: var(--cd-color-fill-0);">
    <span style="color: var(--cd-color-text-2); font-size: 12px;">二次封装的标签栏，当前 activeKey：{activeKey}</span>
    <div style="display: flex; gap: 8px; margin-top: 8px;">
      {#each list as item (item.itemKey)}
        <button
          type="button"
          onclick={() => setActive(item.itemKey)}
          style="padding: 4px 12px; border-radius: 3px; cursor: pointer; border: 1px solid var(--cd-color-border); background: {activeKey === item.itemKey ? 'var(--cd-color-primary)' : 'transparent'}; color: {activeKey === item.itemKey ? '#fff' : 'var(--cd-color-text-1)'};"
        >
          {item.tab}
        </button>
      {/each}
    </div>
  </div>
{/snippet}

<!-- renderTabBar：完全自绘标签栏；面板内容仍按 activeKey 显隐。 -->
<Tabs value={active} onChange={(k) => (active = k)} renderTabBar={renderBar}>
  <TabPane tab="文档" itemKey="1">文档内容</TabPane>
  <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
  <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
</Tabs>
