<!--
  仅供 Breadcrumb.kbd.test.ts（browser project）使用的折叠 disclosure 键盘 e2e 夹具。
  maxItemCount=3 + 5 个路由 → 中间折叠为 … 触发器（role=button + tabindex=0，对齐 Semi
  handleCollapse）。Enter 键盘激活「就地展开全部项」（对齐 Semi handleExpand，与 moreType
  无关）；moreType='popover' 只影响触发器内部渲染内容（额外叠加 hover 展开的 Popover 预览，
  见 Breadcrumb.svelte moreContent snippet）。
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
