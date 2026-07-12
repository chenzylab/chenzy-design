<script lang="ts">
  import { Dropdown, Button } from '@chenzy-design/svelte';
  import type { DropdownMenuItem } from '@chenzy-design/svelte';

  // 通过 menu 属性传入 JSON Array 快速配置下拉框（对齐 Semi menu prop）。
  const menu: DropdownMenuItem[] = [
    { node: 'title', name: '分组 1' },
    { node: 'item', name: 'primary', key: 'primary', type: 'primary', onClick: () => console.log('click primary') },
    { node: 'item', name: 'secondary', key: 'secondary', type: 'secondary' },
    { node: 'divider' },
    { node: 'title', name: '分组 2' },
    { node: 'item', name: 'tertiary', key: 'tertiary', type: 'tertiary' },
    { node: 'item', name: 'warning', key: 'warning', type: 'warning', active: true },
    { node: 'item', name: 'danger', key: 'danger', type: 'danger' },
  ];
</script>

<!-- showTick：active 项左侧显示对勾。 -->
<Dropdown trigger="click" showTick position="bottomStart" {menu}>
  <Button type="tertiary">Click Me ▾</Button>
</Dropdown>
