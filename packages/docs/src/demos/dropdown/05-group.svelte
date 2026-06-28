<script lang="ts">
  import { Dropdown, Button } from '@chenzy-design/svelte';

  // type:'group' 分组标题（组内项始终展开）；type:'divider' 分隔符；danger 危险项
  const items = [
    {
      type: 'group' as const,
      label: '文件操作',
      children: [
        { key: 'new', label: '新建' },
        { key: 'open', label: '打开' },
      ],
    },
    { type: 'divider' as const },
    {
      type: 'group' as const,
      label: '编辑操作',
      children: [
        { key: 'cut', label: '剪切' },
        { key: 'paste', label: '粘贴', disabled: true },
      ],
    },
    { type: 'divider' as const },
    { key: 'delete', label: '删除', danger: true },
  ];
</script>

<Dropdown {items} trigger="click">
  {#snippet triggerContent()}
    <Button type="secondary">分组菜单 ▾</Button>
  {/snippet}
</Dropdown>
