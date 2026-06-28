<script lang="ts">
  import { Menu, Text } from '@chenzy-design/svelte';

  let selected = $state<string | number>('overview');

  const items = [
    { key: 'overview', label: '概览' },
    {
      key: 'settings',
      label: '设置',
      children: [
        { key: 'profile', label: '个人资料' },
        { key: 'security', label: '安全' },
      ],
    },
    { key: 'about', label: '关于' },
  ];
</script>

<div>
  <Menu
    mode="horizontal"
    {items}
    selectedKeys={[selected]}
    onSelect={(k) => (selected = k)}
  />
  <Text type="tertiary">选中：{selected}</Text>
</div>
