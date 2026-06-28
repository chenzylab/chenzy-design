<script lang="ts">
  import { Breadcrumb, Text } from '@chenzy-design/svelte';
  import type { BreadcrumbRoute } from '@chenzy-design/svelte';

  const routes: BreadcrumbRoute[] = [
    { label: '首页', href: '#' },
    { label: '一级目录', href: '#' },
    { label: '二级目录', href: '#' },
    { label: '三级目录', href: '#' },
    { label: '四级目录', href: '#' },
    { label: '当前页' },
  ];

  let picked = $state('—');
</script>

<div style="display:flex; flex-direction:column; gap:20px; align-items:flex-start">
  <div>
    <Text type="tertiary">默认折叠：点击 … 就地展开全部</Text>
    <Breadcrumb maxItemCount={3} {routes} />
  </div>

  <div>
    <Text type="tertiary">moreType="popover"：… 弹出可点击的折叠项菜单</Text>
    <Breadcrumb
      maxItemCount={3}
      moreType="popover"
      {routes}
      onClick={(r) => (picked = r.label)}
    />
    <Text type="tertiary">点击折叠项：{picked}</Text>
  </div>

  <div>
    <Text type="tertiary">moreType="tooltip"：… 悬浮提示被折叠的层级</Text>
    <Breadcrumb maxItemCount={3} moreType="tooltip" {routes} />
  </div>
</div>
