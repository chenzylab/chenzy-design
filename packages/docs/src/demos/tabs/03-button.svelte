<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let active = $state<string | number>('1');
</script>

<Tabs type="button" activeKey={active} onChange={(k) => (active = k)}>
  <TabPane tab="文档" itemKey="1">文档</TabPane>
  <TabPane tab="快速起步" itemKey="2">快速起步</TabPane>
  <TabPane tab="帮助" itemKey="3">帮助</TabPane>
</Tabs>
