<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
  import {
    IconTreeSelect,
    IconForm,
    IconTree,
    IconBanner,
    IconBadge,
    IconNotification,
    IconSteps,
    IconTabs,
    IconNavigation,
  } from '@chenzy-design/icons-lab';

  // 导航样式定义：style 定外层高度、bodyStyle 定列表区高度 →
  // 头部/底部固定，中间列表可滚动。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconBadge },
    { itemKey: 'order', text: '订单管理', icon: iconBanner },
    { itemKey: 'res', text: '资源管理', icon: iconTreeSelect },
    {
      itemKey: 'task',
      text: '任务平台',
      icon: iconForm,
      items: [
        { itemKey: 'task-manage', text: '任务管理' },
        { itemKey: 'task-query', text: '用户任务查询' },
      ],
    },
    { itemKey: 'push', text: '推送通知', icon: iconNotification },
    { itemKey: 'step', text: '任务', icon: iconSteps },
    { itemKey: 'act', text: '活动管理', icon: iconTree },
    { itemKey: 'tool', text: '内容工具', icon: iconTabs },
    { itemKey: 'quick', text: '快捷导航', icon: iconNavigation },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconBadge()}<IconBadge />{/snippet}
{#snippet iconBanner()}<IconBanner />{/snippet}
{#snippet iconTreeSelect()}<IconTreeSelect />{/snippet}
{#snippet iconForm()}<IconForm />{/snippet}
{#snippet iconNotification()}<IconNotification />{/snippet}
{#snippet iconSteps()}<IconSteps />{/snippet}
{#snippet iconTree()}<IconTree />{/snippet}
{#snippet iconTabs()}<IconTabs />{/snippet}
{#snippet iconNavigation()}<IconNavigation />{/snippet}

<Nav
  mode="vertical"
  defaultSelectedKeys={['user']}
  {items}
  header={{ logo, text: '运营后台' }}
  footer={{ collapseButton: true }}
  style="height: 520px;"
  bodyStyle="height: 300px;"
/>
