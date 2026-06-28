<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let lineActive = $state<string | number>('a');
  let cardActive = $state<string | number>('a');
  let btnActive = $state<string | number>('a');
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <p style="color: #888; font-size: 12px; margin: 0 0 8px;">line（默认）</p>
    <Tabs type="line" activeKey={lineActive} onChange={(k) => (lineActive = k)}>
      <TabPane tab="Tab A" itemKey="a">内容 A</TabPane>
      <TabPane tab="Tab B" itemKey="b">内容 B</TabPane>
    </Tabs>
  </div>
  <div>
    <p style="color: #888; font-size: 12px; margin: 0 0 8px;">card</p>
    <Tabs type="card" activeKey={cardActive} onChange={(k) => (cardActive = k)}>
      <TabPane tab="Tab A" itemKey="a">内容 A</TabPane>
      <TabPane tab="Tab B" itemKey="b">内容 B</TabPane>
    </Tabs>
  </div>
  <div>
    <p style="color: #888; font-size: 12px; margin: 0 0 8px;">button</p>
    <Tabs type="button" activeKey={btnActive} onChange={(k) => (btnActive = k)}>
      <TabPane tab="日" itemKey="a">按日查看</TabPane>
      <TabPane tab="周" itemKey="b">按周查看</TabPane>
      <TabPane tab="月" itemKey="c">按月查看</TabPane>
    </Tabs>
  </div>
</div>
