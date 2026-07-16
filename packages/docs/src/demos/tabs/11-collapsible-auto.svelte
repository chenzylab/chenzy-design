<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let count = $state(8);
  const tabs = $derived(Array.from({ length: count }, (_, i) => i));
  let active = $state<string | number>('0');
</script>

<div>
  <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
    <button type="button" onclick={() => (count = Math.max(3, count - 2))} style="padding: 4px 12px; border-radius: 3px; border: 1px solid var(--cd-color-border); background: transparent; cursor: pointer;">减少 Tab</button>
    <button type="button" onclick={() => (count = Math.min(15, count + 2))} style="padding: 4px 12px; border-radius: 3px; border: 1px solid var(--cd-color-border); background: transparent; cursor: pointer;">增加 Tab</button>
    <span style="color: var(--cd-color-text-2);">当前 Tab 数量：{count}</span>
  </div>

  <!-- collapsible="auto"：自动检测溢出——溢出才显示切换箭头，容器变宽/标签变少能全显时自动退出。 -->
  <div style="border: 1px solid var(--cd-color-border); padding: 12px; max-width: 400px;">
    <p style="margin: 0 0 8px; color: var(--cd-color-text-2); font-size: 12px;">固定宽度 400px 容器</p>
    <Tabs type="card" collapsible="auto" activeKey={active} onChange={(k) => (active = k)}>
      {#each tabs as i (i)}
        <TabPane tab={`Tab-${i + 1}`} itemKey={`${i}`}>Content of Tab {i + 1}</TabPane>
      {/each}
    </Tabs>
  </div>
</div>
