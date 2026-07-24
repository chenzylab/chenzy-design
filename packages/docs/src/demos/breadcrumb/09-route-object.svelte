<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';
  import { IconHome, IconArticle } from '@chenzy-design/icons';
  import type { BreadcrumbRoute } from '@chenzy-design/svelte';

  // route 对象数组（对齐 Semi Route: { name, path, href, icon }）与纯字符串可混用；字符串即 name。
  const objectRoutes: Array<BreadcrumbRoute | string> = [
    { path: '/', href: '#', icon: home },
    { path: '/breadcrumb', href: '#', name: 'breadcrumb', icon: article },
    'with icon',
  ];
</script>

{#snippet home()}<IconHome size="small" />{/snippet}
{#snippet article()}<IconArticle size="small" />{/snippet}

<div>
  <Breadcrumb routes={['Semi-ui', 'Breadcrumb', 'Default']} />
  <br />
  <Breadcrumb routes={objectRoutes} />
  <br />
  <Breadcrumb routes={['首页', '当这个页面标题很长时需要省略', '详情页']} />
</div>
