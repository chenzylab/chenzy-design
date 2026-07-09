<!--
  仅供 Breadcrumb.kbd.test.ts（browser project）使用的折叠 disclosure 键盘 e2e 夹具。
  maxItemCount=3 + 5 个路由 → 中间折叠为 … 触发器；moreType='popover' 使其成为
  click 触发的 disclosure：折叠触发器经 Popover 包裹（cd-popover__trigger 承载 role=button
  + aria-haspopup + aria-expanded），Enter/Space 展开浮层菜单（role=menu，portal 到 body）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Breadcrumb from './Breadcrumb.svelte';
  import type { BreadcrumbRoute } from './types.js';

  const routes: BreadcrumbRoute[] = [
    { name: 'Home', href: '#home' },
    { name: 'Library', href: '#library' },
    { name: 'Data', href: '#data' },
    { name: 'Reports', href: '#reports' },
    { name: 'Q3', href: '#q3' },
  ];
</script>

<LocaleProvider locale="en_US">
  <Breadcrumb {routes} maxItemCount={3} moreType="popover" />
</LocaleProvider>
