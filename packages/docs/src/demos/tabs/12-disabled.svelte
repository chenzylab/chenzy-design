<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let active = $state<string | number>('1');
</script>

<Tabs value={active} onChange={(k) => (active = k)}>
  <TabPane tab="文档" itemKey="1">文档内容</TabPane>
  <TabPane tab="快速起步" itemKey="2" disabled>（已禁用，无法切换）</TabPane>
  <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
</Tabs>
