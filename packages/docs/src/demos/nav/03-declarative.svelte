<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';

  const { Item, Sub } = Nav;
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}

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
