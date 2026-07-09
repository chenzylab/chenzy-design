<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import type { NavSelectData } from '@chenzy-design/svelte';

  // multiple 多选：点击叠加选中，再次点击取消（onDeselect）。
  let selected = $state<string[]>(['home', 'orders']);

  const items = [
    { itemKey: 'home', text: '仪表盘' },
    { itemKey: 'orders', text: '订单管理' },
    { itemKey: 'goods', text: '商品管理' },
    { itemKey: 'report', text: '数据报表' },
  ];
</script>

<div style="width: 240px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    multiple
    selectedKeys={selected}
    {items}
    onSelect={(d: NavSelectData) => (selected = d.selectedKeys as string[])}
    onDeselect={(d: NavSelectData) => (selected = d.selectedKeys as string[])}
  />
</div>
<p style="margin-top: 8px; color: var(--cd-color-text-2); font-size: 13px;">
  已选：{selected.join('、') || '无'}
</p>
