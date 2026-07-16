<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let type = $state<'line' | 'card' | 'button'>('line');
  let active = $state<string | number>('1');
  const types: Array<'line' | 'card' | 'button'> = ['line', 'card', 'button'];
</script>

<div style="display: flex; gap: 8px; margin-bottom: 16px;">
  {#each types as t (t)}
    <button
      type="button"
      onclick={() => (type = t)}
      style="padding: 4px 12px; border-radius: 3px; cursor: pointer; border: 1px solid var(--cd-color-border); background: {type === t ? 'var(--cd-color-primary-light-default)' : 'transparent'}; color: {type === t ? 'var(--cd-color-primary)' : 'var(--cd-color-text-2)'};"
    >
      {t}
    </button>
  {/each}
</div>

<!-- tabPosition=left：竖向标签栏，支持 line / card / button 三型 -->
<Tabs {type} tabPosition="left" activeKey={active} onChange={(k) => (active = k)}>
  <TabPane tab="文档" itemKey="1">
    <div style="padding: 0 24px;">
      <h3>文档</h3>
      <p style="line-height: 1.8;">chenzy-design 竖向标签栏，标签在左、内容在右。</p>
    </div>
  </TabPane>
  <TabPane tab="快速起步" itemKey="2">
    <div style="padding: 0 24px;"><h3>快速起步</h3><p style="line-height: 1.8;">pnpm add @chenzy-design/svelte</p></div>
  </TabPane>
  <TabPane tab="帮助" itemKey="3">
    <div style="padding: 0 24px;"><h3>帮助</h3><p style="line-height: 1.8;">欢迎提 issue 反馈。</p></div>
  </TabPane>
</Tabs>
