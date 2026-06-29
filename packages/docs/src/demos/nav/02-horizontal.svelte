<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';

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

{#snippet logo()}
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
    <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
  </svg>
{/snippet}

<div style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="horizontal"
    defaultSelectedKeys={['home']}
    {items}
    header={{ logo, text: 'chenzy-design' }}
    style="padding-inline: 16px;"
  />
</div>
