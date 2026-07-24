<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';

  const items = [
    { itemKey: 'home', text: '首页' },
    { itemKey: 'live', text: '直播' },
    {
      itemKey: 'approve',
      text: '审批管理',
      items: [
        { itemKey: 'entry', text: '入驻审核' },
        { itemKey: 'ops', text: '运营管理' },
      ],
    },
    { itemKey: 'setting', text: '设置' },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}

<div style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="horizontal"
    defaultSelectedKeys={['home']}
    {items}
    header={{ logo, text: 'chenzy-design' }}
    style="padding-inline: 16px;"
  />
</div>
