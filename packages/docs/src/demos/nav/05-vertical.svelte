<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
  import { IconBadge, IconTreeSelect, IconForm, IconBanner } from '@chenzy-design/icons-lab';

  // 对齐 Semi 文档「垂直布局」示例（icons-lab 具名图标 + 顶部第4项「公告管理」子导航）。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconBadge },
    { itemKey: 'union', text: '活动管理', icon: iconTreeSelect },
    {
      itemKey: 'union-management',
      text: '任务管理',
      icon: iconForm,
      items: [
        { itemKey: 'notice', text: '任务设置' },
        { itemKey: 'query', text: '任务查询' },
        { itemKey: 'input', text: '信息录入' },
      ],
    },
    {
      itemKey: 'job',
      text: '公告管理',
      icon: iconBanner,
      items: [
        { itemKey: 'job-push', text: '推送管理' },
        { itemKey: 'job-query', text: '已推送查询' },
      ],
    },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconBadge()}<IconBadge />{/snippet}
{#snippet iconTreeSelect()}<IconTreeSelect />{/snippet}
{#snippet iconForm()}<IconForm />{/snippet}
{#snippet iconBanner()}<IconBanner />{/snippet}

<div style="width: 100%;">
  <Nav
    defaultSelectedKeys={['user']}
    defaultOpenKeys={['union-management']}
    {items}
    bodyStyle="height: 300px;"
    header={{ logo, text: '运营后台' }}
    footer={{ collapseButton: true }}
  />
</div>
