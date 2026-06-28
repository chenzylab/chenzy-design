<script lang="ts">
  import { Menu, Text } from '@chenzy-design/svelte';

  let selected = $state<string | number>('overview');
</script>

<div style="width:200px">
  <Menu
    mode="inline"
    items={[
      { key: 'overview', label: '概览' },
      {
        key: 'settings',
        label: '设置',
        children: [
          { key: 'profile', label: '个人资料' },
          { key: 'security', label: '安全' },
        ],
      },
      { key: 'help', label: '帮助', disabled: true },
    ]}
    selectedKeys={[selected]}
    defaultOpenKeys={['settings']}
    onSelect={(k) => (selected = k)}
  />
  <Text type="tertiary">选中：{selected}</Text>
</div>
