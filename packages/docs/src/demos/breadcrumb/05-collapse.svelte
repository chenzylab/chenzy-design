<script lang="ts">
  import { Breadcrumb, Text } from '@chenzy-design/svelte';
  import type { BreadcrumbRoute } from '@chenzy-design/svelte';

  const routes: BreadcrumbRoute[] = [
    { name: '首页', href: '#' },
    { name: '一级目录', href: '#' },
    { name: '二级目录', href: '#' },
    { name: '三级目录', href: '#' },
    { name: '四级目录', href: '#' },
    { name: '当前页' },
  ];

  let picked = $state('—');
</script>

<div style="display:flex; flex-direction:column; gap:20px; align-items:flex-start">
  <div>
    <Text type="tertiary">moreType="default"（默认）：点击三点图标就地展开全部</Text>
    <Breadcrumb maxItemCount={3} {routes} />
  </div>

  <div>
    <Text type="tertiary">moreType="popover"：悬浮三点图标弹出可点击的折叠项菜单</Text>
    <Breadcrumb
      maxItemCount={3}
      moreType="popover"
      {routes}
      onClick={(r) => (picked = r.name ?? '')}
    />
    <Text type="tertiary">点击折叠项：{picked}</Text>
  </div>
</div>
