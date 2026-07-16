<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';
  import { IconHome, IconArticle } from '@chenzy-design/icons';
  import type { BreadcrumbRoute } from '@chenzy-design/svelte';

  // route 对象数组（对齐 Semi Route: { name, path, href, icon }）与纯字符串可混用；字符串即 name。
  const stringRoutes = ['Semi-ui', 'Breadcrumb', 'Default'];

  const objectRoutes: Array<BreadcrumbRoute | string> = [
    { path: '/', href: '#', icon: home },
    { path: '/breadcrumb', href: '#', name: 'breadcrumb', icon: article },
    'with icon',
  ];
</script>

{#snippet home()}<IconHome size="small" />{/snippet}
{#snippet article()}<IconArticle size="small" />{/snippet}

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <!-- 纯字符串数组：字符串直接作为 name。 -->
  <Breadcrumb routes={stringRoutes} />

  <!-- route 对象数组：name/path/href/icon 字段驱动渲染，href 渲染为链接，icon 为前置图标。 -->
  <Breadcrumb routes={objectRoutes} />
</div>
