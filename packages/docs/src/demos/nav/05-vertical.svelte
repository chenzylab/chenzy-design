<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo, IconGridSquare, IconList, IconSetting } from '@chenzy-design/icons';

  const items = [
    { itemKey: 'dashboard', text: '仪表盘', icon: iconGrid },
    { itemKey: 'orders', text: '订单管理', icon: iconList },
    {
      itemKey: 'settings',
      text: '系统设置',
      icon: iconGear,
      items: [
        { itemKey: 'general', text: '通用' },
        { itemKey: 'security', text: '安全' },
      ],
    },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconGrid()}<IconGridSquare />{/snippet}
{#snippet iconList()}<IconList />{/snippet}
{#snippet iconGear()}<IconSetting />{/snippet}

<div style="width: 240px; height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    defaultSelectedKeys={['dashboard']}
    defaultOpenKeys={['settings']}
    {items}
    header={{ logo, text: '运营后台' }}
    footer={{ collapseButton: true }}
    style="height: 100%;"
  />
</div>
