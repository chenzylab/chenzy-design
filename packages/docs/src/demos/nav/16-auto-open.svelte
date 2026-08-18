<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconUser, IconStar, IconUserGroup, IconEdit, IconApps, IconSetting } from '@chenzy-design/icons';

  // 超长子导航列表（maxHeight 撑开到 9999，内联展开动画不受限）；
  // defaultSelectedKeys 命中深层子项时会自动展开其所有祖先子导航（对齐 Semi AutoOpen story）。
  const superLargeSubs = Array.from({ length: 60 }, (_, i) => `子项 ${i}`);

  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'union', text: '公会中心', icon: iconStar },
    {
      itemKey: 'union-management',
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
          items: [{ itemKey: 'personnel', text: '人员管理' }, '人员变更'],
        },
      ],
    },
    {
      text: '超长导航列表',
      icon: iconApps,
      itemKey: 'long-list',
      maxHeight: 9999,
      items: superLargeSubs,
    },
    { text: '任务平台', icon: iconSetting, itemKey: 'job', items: ['任务管理', '用户任务查询'] },
  ];
</script>

{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconStar()}<IconStar />{/snippet}
{#snippet iconUserGroup()}<IconUserGroup />{/snippet}
{#snippet iconEdit()}<IconEdit />{/snippet}
{#snippet iconApps()}<IconApps />{/snippet}
{#snippet iconSetting()}<IconSetting />{/snippet}

<!-- 命中「人员管理」后，「审批管理」「运营管理」两级祖先子导航自动展开。 -->
<Nav {items} defaultSelectedKeys={['personnel']} bodyStyle="height: 480px;" />
