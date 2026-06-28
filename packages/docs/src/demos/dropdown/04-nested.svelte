<script lang="ts">
  import { Dropdown, Button } from '@chenzy-design/svelte';

  // 普通项含 children 即为可展开的子菜单，可多层嵌套
  const items = [
    { key: 'new', label: '新建' },
    {
      key: 'export',
      label: '导出为',
      children: [
        { key: 'pdf', label: 'PDF' },
        { key: 'png', label: 'PNG' },
        {
          key: 'more',
          label: '更多格式',
          children: [
            { key: 'svg', label: 'SVG' },
            { key: 'webp', label: 'WebP' },
          ],
        },
      ],
    },
    { key: 'share', label: '分享' },
  ];
</script>

<Dropdown {items} trigger="click">
  {#snippet triggerContent()}
    <Button type="secondary">文件菜单 ▾</Button>
  {/snippet}
</Dropdown>
