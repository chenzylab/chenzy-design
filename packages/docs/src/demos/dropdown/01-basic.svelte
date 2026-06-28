<script lang="ts">
  import { Dropdown, Button, Text } from '@chenzy-design/svelte';

  const items = [
    { key: 'edit', label: '编辑' },
    { key: 'copy', label: '复制' },
    { key: 'delete', label: '删除', danger: true },
  ];

  let selected = $state('');
</script>

<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start">
  <Dropdown {items} trigger="click" onSelect={(k) => (selected = String(k))}>
    {#snippet triggerContent()}
      <Button type="secondary">操作菜单 ▾</Button>
    {/snippet}
  </Dropdown>
  <Text type="tertiary">上次选择：{selected || '（无）'}</Text>
</div>
