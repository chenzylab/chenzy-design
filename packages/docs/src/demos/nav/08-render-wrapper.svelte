<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import type { NavItemDef } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  // 配合路由：renderWrapper 在每个导航项外包一层自定义组件（如路由库的 Link），
  // 点击导航项即触发路由跳转。对齐 Semi navigation-with-react-router 场景。
  const routerMap: Record<string, string> = {
    home: '/',
    about: '/about',
    dashboard: '/dashboard',
    nothing: '/nothing-here',
  };

  const items = [
    { itemKey: 'home', text: 'Home' },
    { itemKey: 'about', text: 'About' },
    {
      itemKey: 'sub',
      text: 'Sub',
      items: [
        { itemKey: 'dashboard', text: 'Dashboard' },
        { itemKey: 'nothing', text: 'Nothing Here' },
      ],
    },
  ];
</script>

{#snippet wrapper({ item, children }: { item: NavItemDef; isSubNav: boolean; children: Snippet })}
  <a
    href={routerMap[String(item.itemKey)] ?? '#'}
    style="text-decoration: none; color: inherit; display: block;"
    onclick={(e) => e.preventDefault()}
  >
    {@render children()}
  </a>
{/snippet}

<div style="width: 240px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav mode="vertical" defaultSelectedKeys={['home']} {items} renderWrapper={wrapper} />
</div>
