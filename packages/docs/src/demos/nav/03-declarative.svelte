<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';

  const { Item, Sub } = Nav;
</script>

{#snippet logo()}
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
    <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
  </svg>
{/snippet}

<div style="width: 240px; height: 300px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    defaultSelectedKeys={['active']}
    defaultOpenKeys={['user']}
    header={{ logo, text: '运营后台' }}
    footer={{ collapseButton: true }}
    style="height: 100%;"
  >
    <Item itemKey="union" text="活动管理" />
    <Sub itemKey="user" text="用户管理">
      <Item itemKey="active" text="活跃用户" />
      <Item itemKey="negative" text="非活跃用户" />
    </Sub>
    <Sub itemKey="task" text="任务管理">
      <Item itemKey="notice" text="任务设置" />
      <Item itemKey="query" text="任务查询" />
    </Sub>
  </Nav>
</div>
