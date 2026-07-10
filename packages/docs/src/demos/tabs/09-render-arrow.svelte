<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let active = $state<string | number>('Tab-0');
</script>

{#snippet arrow({ type, onClick }: { type: 'start' | 'end'; onClick: () => void })}
  <button
    type="button"
    onclick={onClick}
    style="width: 32px; height: 32px; margin: 0 8px; display: flex; justify-content: center; align-items: center; border-radius: 100%; border: none; background: var(--cd-color-fill-1); color: var(--cd-color-text-0); cursor: pointer;"
  >
    {type === 'start' ? '←' : '→'}
  </button>
{/snippet}

<div style="width: 50%; min-width: 320px;">
  <!-- renderArrow：自定义滚动折叠模式下的前/后切换箭头。 -->
  <Tabs type="card" collapsible renderArrow={arrow} value={active} onChange={(k) => (active = k)}>
    {#each keys as i (i)}
      <TabPane tab={`Tab-${i}`} itemKey={`Tab-${i}`}>Content of card tab {i}</TabPane>
    {/each}
  </Tabs>
</div>
