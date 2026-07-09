<script lang="ts">
  import { Breadcrumb, Text } from '@chenzy-design/svelte';
  import type { BreadcrumbRoute } from '@chenzy-design/svelte';

  const routes: BreadcrumbRoute[] = [
    { name: '首页', href: '#' },
    { name: '当这个页面标题很长很长很长时需要省略', href: '#' },
    { name: '另一个同样很长很长很长会被省略号截断的当前页标题' },
  ];
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start; max-inline-size:420px">
  <div>
    <Text type="tertiary">默认行为：超出 150px 截断，hover 显示完整名</Text>
    <Breadcrumb showTooltip {routes} />
  </div>

  <div>
    <Text type="tertiary">自定义宽度：showTooltip={'{ width: 220 }'}</Text>
    <Breadcrumb showTooltip={{ width: 220 }} {routes} />
  </div>

  <div>
    <Text type="tertiary">从中间省略：showTooltip={'{ ellipsisPos: "middle" }'}</Text>
    <Breadcrumb showTooltip={{ ellipsisPos: 'middle' }} {routes} />
  </div>
</div>
