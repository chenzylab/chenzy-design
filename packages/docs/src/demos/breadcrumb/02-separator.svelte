<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';

  const routes = [
    { label: '首页', href: '#' },
    { label: '组件库', href: '#' },
    { label: 'Breadcrumb' },
  ];
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <Breadcrumb separator=">" {routes} />
  <Breadcrumb separator="·" {routes} />
  <Breadcrumb separator="→" {routes} />
</div>
