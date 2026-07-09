<script lang="ts">
  import { Breadcrumb, Text } from '@chenzy-design/svelte';
  import type { BreadcrumbRoute } from '@chenzy-design/svelte';

  const routes: BreadcrumbRoute[] = [
    { name: '工作台', href: '#' },
    { name: '项目管理', href: '#' },
    { name: '设计系统', href: '#' },
    { name: '当前任务' },
  ];

  let activeIndex = $state(1);
  let lastClicked = $state('—');

  function handleClick(route: BreadcrumbRoute, index: number) {
    activeIndex = index;
    lastClicked = route.name ?? '';
  }
</script>

<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start">
  <Breadcrumb {routes} {activeIndex} onClick={handleClick} />
  <Text type="tertiary">当前选中（activeIndex={activeIndex}）：{lastClicked}</Text>
</div>
