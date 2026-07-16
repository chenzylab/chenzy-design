<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let lineActive = $state<string | number>('1');
  let cardActive = $state<string | number>('1');
  let btnActive = $state<string | number>('1');
  let slashActive = $state<string | number>('1');
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <p style="color: var(--cd-color-text-2); font-size: 12px; margin: 0 0 8px;">line（线条式，默认）</p>
    <Tabs type="line" activeKey={lineActive} onChange={(k) => (lineActive = k)}>
      <TabPane tab="文档" itemKey="1">文档内容</TabPane>
      <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
      <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
    </Tabs>
  </div>
  <div>
    <p style="color: var(--cd-color-text-2); font-size: 12px; margin: 0 0 8px;">card（卡片式）</p>
    <Tabs type="card" activeKey={cardActive} onChange={(k) => (cardActive = k)}>
      <TabPane tab="文档" itemKey="1">文档内容</TabPane>
      <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
      <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
    </Tabs>
  </div>
  <div>
    <p style="color: var(--cd-color-text-2); font-size: 12px; margin: 0 0 8px;">button（按钮式）</p>
    <Tabs type="button" activeKey={btnActive} onChange={(k) => (btnActive = k)}>
      <TabPane tab="日" itemKey="1">按日查看</TabPane>
      <TabPane tab="周" itemKey="2">按周查看</TabPane>
      <TabPane tab="月" itemKey="3">按月查看</TabPane>
    </Tabs>
  </div>
  <div>
    <p style="color: var(--cd-color-text-2); font-size: 12px; margin: 0 0 8px;">slash（斜线式）</p>
    <Tabs type="slash" activeKey={slashActive} onChange={(k) => (slashActive = k)}>
      <TabPane tab="文档" itemKey="1">文档内容</TabPane>
      <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
      <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
    </Tabs>
  </div>
</div>
