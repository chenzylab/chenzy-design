<script lang="ts">
  import { Tabs, TabPane, Button } from '@chenzy-design/svelte';

  interface Pane {
    title: string;
    content: string;
    itemKey: string;
  }

  let newTabIndex = 0;
  let panes = $state<Pane[]>([
    { title: 'Tab 1', content: 'Content of Tab Pane 1', itemKey: '1' },
    { title: 'Tab 2', content: 'Content of Tab Pane 2', itemKey: '2' },
  ]);
  let active = $state<string | number>('1');

  function add() {
    const index = newTabIndex++;
    const key = `newTab${index}`;
    panes = [...panes, { title: `New Tab ${index}`, content: 'New Tab Pane', itemKey: key }];
    active = key;
  }
  function remove() {
    if (panes.length > 1) {
      panes = panes.slice(0, -1);
      active = panes[panes.length - 1].itemKey;
    }
  }
</script>

{#snippet extra()}
  <div style="display: flex; gap: 8px;">
    <Button size="small" onclick={add}>新增</Button>
    <Button size="small" onclick={remove}>删除</Button>
  </div>
{/snippet}

<!-- 动态更新：通过绑定事件增删标签页。 -->
<Tabs activeKey={active} onChange={(k) => (active = k)} tabBarExtraContent={extra}>
  {#each panes as pane (pane.itemKey)}
    <TabPane tab={pane.title} itemKey={pane.itemKey}>{pane.content}</TabPane>
  {/each}
</Tabs>
