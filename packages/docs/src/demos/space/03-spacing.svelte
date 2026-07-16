<script lang="ts">
  import { Space, Tabs, TabPane, Button } from '@chenzy-design/svelte';

  let active = $state<string | number>('1');
  const marginTop = 'margin-top:15px;';
</script>

<Tabs type="line" activeKey={active} onChange={(k) => (active = k)}>
  <TabPane tab="tight" itemKey="1">
    <Space spacing="tight" style={marginTop}>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
    </Space>
  </TabPane>
  <TabPane tab="medium" itemKey="2">
    <Space spacing="medium" style={marginTop}>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
    </Space>
  </TabPane>
  <TabPane tab="loose" itemKey="3">
    <Space spacing="loose" style={marginTop}>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
    </Space>
  </TabPane>
  <TabPane tab="array" itemKey="4">
    <Space spacing={[8, 16]} wrap style={marginTop}>
      {#each Array(10) as _, i (i)}
        <Button theme="solid" type="primary">按钮</Button>
      {/each}
    </Space>
  </TabPane>
</Tabs>
