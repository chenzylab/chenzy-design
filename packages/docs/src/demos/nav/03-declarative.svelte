<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
  import { IconForm, IconBadge, IconTree } from '@chenzy-design/icons-lab';

  const { Item, Sub, Header, Footer } = Nav;
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconForm()}<IconForm />{/snippet}
{#snippet iconBadge()}<IconBadge />{/snippet}
{#snippet iconTree()}<IconTree />{/snippet}

<Nav
  mode="vertical"
  defaultOpenKeys={['user', 'union-management']}
  bodyStyle="height: 300px;"
>
  <Header {logo} text="运营后台" />
  <Item itemKey="union" text="活动管理" icon={iconForm} />
  <Sub itemKey="user" text="用户管理" icon={iconBadge}>
    <Item itemKey="active" text="活跃用户" />
    <Item itemKey="negative" text="非活跃用户" />
  </Sub>
  <Sub itemKey="union-management" text="任务管理" icon={iconTree}>
    <Item itemKey="notice" text="任务设置" />
    <Item itemKey="query" text="任务查询" />
    <Item itemKey="info" text="信息录入" />
  </Sub>
  <Footer collapseButton={true} />
</Nav>
