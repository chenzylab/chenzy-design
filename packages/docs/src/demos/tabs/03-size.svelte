<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let large = $state<string | number>('1');
  let medium = $state<string | number>('1');
  let small = $state<string | number>('1');
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <p style="color: var(--cd-color-text-2); font-size: 12px; margin: 0 0 8px;">large（默认）</p>
    <Tabs size="large" activeKey={large} onChange={(k) => (large = k)}>
      <TabPane tab="文档" itemKey="1">文档内容</TabPane>
      <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
      <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
    </Tabs>
  </div>
  <div>
    <p style="color: var(--cd-color-text-2); font-size: 12px; margin: 0 0 8px;">medium</p>
    <Tabs size="medium" activeKey={medium} onChange={(k) => (medium = k)}>
      <TabPane tab="文档" itemKey="1">文档内容</TabPane>
      <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
      <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
    </Tabs>
  </div>
  <div>
    <p style="color: var(--cd-color-text-2); font-size: 12px; margin: 0 0 8px;">small</p>
    <Tabs size="small" activeKey={small} onChange={(k) => (small = k)}>
      <TabPane tab="文档" itemKey="1">文档内容</TabPane>
      <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
      <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
    </Tabs>
  </div>
</div>
