<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  // more 传数字：把末尾 4 个 Tab 收入「更多」下拉。
  const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let active = $state<string | number>('Tab-0');
</script>

<div style="width: 60%; min-width: 320px;">
  <Tabs type="card" more={4} value={active} onChange={(k) => (active = k)}>
    {#each keys as i (i)}
      <TabPane tab={`Tab-${i}`} itemKey={`Tab-${i}`}>Content of card tab {i}</TabPane>
    {/each}
  </Tabs>
</div>
