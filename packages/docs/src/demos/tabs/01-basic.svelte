<script lang="ts">
  import { Tabs, TabPane } from '@chenzy-design/svelte';

  let active = $state<string | number>('1');
</script>

<Tabs activeKey={active} onChange={(k) => (active = k)}>
  <TabPane tab="账户设置" itemKey="1">账户信息内容区域</TabPane>
  <TabPane tab="安全设置" itemKey="2">密码与双因素认证</TabPane>
  <TabPane tab="通知设置" itemKey="3" disabled>（已禁用）</TabPane>
</Tabs>
