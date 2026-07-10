<script lang="ts">
  import { Tabs, TabPane, Button } from '@chenzy-design/svelte';

  let active = $state<string | number>('1');
</script>

{#snippet extra()}
  <Button size="small" onclick={() => console.log('extra action')}>附加操作</Button>
{/snippet}

<!-- tabBarExtraContent：在标签栏右侧添加附加操作。 -->
<Tabs value={active} onChange={(k) => (active = k)} tabBarExtraContent={extra}>
  <TabPane tab="文档" itemKey="1">文档内容</TabPane>
  <TabPane tab="快速起步" itemKey="2">快速起步内容</TabPane>
  <TabPane tab="帮助" itemKey="3">帮助内容</TabPane>
</Tabs>
