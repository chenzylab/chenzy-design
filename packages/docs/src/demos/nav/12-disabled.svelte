<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconUser, IconStar, IconSetting } from '@chenzy-design/icons';

  // disabled 可加在叶子项、子导航标题、子导航内的子项上，逐级独立生效（对齐 Semi DisabledNav story）。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser, disabled: true },
    { itemKey: 'union', text: '公会中心', icon: iconStar },
    {
      itemKey: 'job',
      text: '任务平台',
      icon: iconSetting,
      disabled: true,
      items: [{ itemKey: 'job-manage', text: '任务管理', disabled: true }, '用户任务查询'],
    },
    {
      itemKey: 'star',
      text: '收藏夹',
      icon: iconStar,
      items: [{ itemKey: 'like', text: '我的喜欢', disabled: true }, '点赞'],
    },
  ];
</script>

{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconStar()}<IconStar />{/snippet}
{#snippet iconSetting()}<IconSetting />{/snippet}

<div>
  <Nav
    {items}
    bodyStyle="height: 320px;"
    defaultOpenKeys={['job', 'star']}
    defaultSelectedKeys={['union']}
    footer={{ collapseButton: true }}
  />
  <Nav mode="horizontal" {items} bodyStyle="width: 100%;" />
</div>
