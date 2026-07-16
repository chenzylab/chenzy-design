<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import type { NavSelectData, NavOpenChangeData } from '@chenzy-design/svelte';

  // 受控属性：selectedKeys / openKeys / isCollapsed 全部受控，配合回调回写。
  let selectedKeys = $state<string[]>(['setting']);
  let openKeys = $state<string[]>(['mgmt']);
  let isCollapsed = $state(false);

  const items = [
    { itemKey: 'user', text: '用户管理' },
    {
      itemKey: 'mgmt',
      text: '任务管理',
      items: [
        { itemKey: 'notice', text: '任务设置' },
        { itemKey: 'setting', text: '信息录入' },
      ],
    },
  ];
</script>

<div style="width: 240px; height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    {selectedKeys}
    {openKeys}
    {isCollapsed}
    {items}
    footer={{ collapseButton: true }}
    onSelect={(d: NavSelectData) => (selectedKeys = d.selectedKeys as string[])}
    onOpenChange={(d: NavOpenChangeData) => (openKeys = d.openKeys as string[])}
    onCollapseChange={(c) => (isCollapsed = c)}
    style="height: 100%;"
  />
</div>
