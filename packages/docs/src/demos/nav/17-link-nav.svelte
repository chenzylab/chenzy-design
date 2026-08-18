<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconUser, IconStar, IconUserGroup, IconEdit, IconSetting } from '@chenzy-design/icons';

  // link 用于叶子项渲染为原生 <a href>，可与不带 link 的项混用（对齐 Semi LinkNav story）。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser, link: 'https://example.com/user' },
    { itemKey: 'union', text: '公会中心', icon: iconStar },
    {
      itemKey: 'union-management',
      link: 'https://example.com/union-management',
      text: '公会管理',
      icon: iconUserGroup,
      items: ['公告设置', '公会查询', '信息录入'],
    },
    {
      itemKey: 'approve-management',
      text: '审批管理',
      icon: iconEdit,
      items: [
        '入驻审核',
        {
          itemKey: 'operation-management',
          text: '运营管理',
          items: ['人员管理', '人员变更'],
        },
      ],
    },
    { text: '任务平台', icon: iconSetting, itemKey: 'job', items: ['任务管理', '用户任务查询'] },
  ];
</script>

{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconStar()}<IconStar />{/snippet}
{#snippet iconUserGroup()}<IconUserGroup />{/snippet}
{#snippet iconEdit()}<IconEdit />{/snippet}
{#snippet iconSetting()}<IconSetting />{/snippet}

<Nav
  {items}
  bodyStyle="height: 320px;"
  header={{ text: 'chenzy-design', link: 'https://example.com', linkOptions: { target: '_blank' } }}
  footer={{ collapseButton: true }}
/>
