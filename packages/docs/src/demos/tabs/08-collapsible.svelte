<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let active = $state<string | number>('Tab-0');
</script>

<div style="width: 60%; min-width: 320px;">
  <!-- collapsible：横向溢出时显示前/后切换箭头，可滚动查看被裁切的标签。 -->
  <Tabs type="card" collapsible value={active} onChange={(k) => (active = k)}>
    {#each keys as i (i)}
      <TabPane tab={`Tab-${i}`} itemKey={`Tab-${i}`}>Content of card tab {i}</TabPane>
    {/each}
  </Tabs>
</div>
