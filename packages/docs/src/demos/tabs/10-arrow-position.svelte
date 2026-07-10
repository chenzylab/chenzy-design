<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const positions: Array<'start' | 'both' | 'end'> = ['start', 'both', 'end'];
  let active = $state<string | number>('Tab-0');
</script>

<div style="display: flex; flex-direction: column; gap: 24px; width: 60%; min-width: 320px;">
  {#each positions as pos (pos)}
    <div>
      <p style="color: var(--cd-color-text-2); font-size: 12px; margin: 0 0 8px;">arrowPosition="{pos}"</p>
      <!-- arrowPosition：控制滚动折叠模式下前/后箭头的渲染位置。 -->
      <Tabs type="card" collapsible arrowPosition={pos} value={active} onChange={(k) => (active = k)}>
        {#each keys as i (i)}
          <TabPane tab={`Tab-${i}`} itemKey={`Tab-${i}`}>Content of card tab {i}</TabPane>
        {/each}
      </Tabs>
    </div>
  {/each}
</div>
