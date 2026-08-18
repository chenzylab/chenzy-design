<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
  import { IconBadge, IconTreeSelect, IconBreadcrumb, IconSteps } from '@chenzy-design/icons-lab';

  // 对齐 Semi 文档「水平布局」示例（icons-lab 具名图标 + 三级嵌套审批管理子导航）。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconBadge },
    { itemKey: 'union', text: '活动管理', icon: iconTreeSelect },
    {
      itemKey: 'approve-management',
      text: '审批管理',
      icon: iconBreadcrumb,
      items: [
        { itemKey: 'entry', text: '入驻审核' },
        {
          itemKey: 'operation-management',
          text: '运营管理',
          items: [
            { itemKey: 'personnel', text: '人员管理' },
            { itemKey: 'personnel-change', text: '人员变更' },
          ],
        },
      ],
    },
    {
      itemKey: 'job',
      text: '任务平台',
      icon: iconSteps,
      items: [
        { itemKey: 'job-manage', text: '任务管理' },
        { itemKey: 'job-query', text: '用户任务查询' },
      ],
    },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconBadge()}<IconBadge />{/snippet}
{#snippet iconTreeSelect()}<IconTreeSelect />{/snippet}
{#snippet iconBreadcrumb()}<IconBreadcrumb />{/snippet}
{#snippet iconSteps()}<IconSteps />{/snippet}

<div style="width: 100%;">
  <Nav
    mode="horizontal"
    defaultSelectedKeys={['user']}
    {items}
    header={{ logo, text: 'chenzy-design' }}
  />
</div>
