<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import {
    IconSemiLogo,
    IconUser,
    IconList,
    IconFolder,
    IconApps,
    IconBell,
    IconStar,
    IconCalendar,
    IconEdit,
    IconBookmark,
  } from '@chenzy-design/icons';

  // 导航样式定义：style 定外层高度、bodyStyle 定列表区高度 →
  // 头部/底部固定，中间列表可滚动。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'order', text: '订单管理', icon: iconList },
    { itemKey: 'res', text: '资源管理', icon: iconFolder },
    {
      itemKey: 'task',
      text: '任务平台',
      icon: iconApps,
      items: [
        { itemKey: 'task-manage', text: '任务管理' },
        { itemKey: 'task-query', text: '用户任务查询' },
      ],
    },
    { itemKey: 'push', text: '推送通知', icon: iconBell },
    { itemKey: 'step', text: '任务', icon: iconStar },
    { itemKey: 'act', text: '活动管理', icon: iconCalendar },
    { itemKey: 'tool', text: '内容工具', icon: iconEdit },
    { itemKey: 'quick', text: '快捷导航', icon: iconBookmark },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconList()}<IconList />{/snippet}
{#snippet iconFolder()}<IconFolder />{/snippet}
{#snippet iconApps()}<IconApps />{/snippet}
{#snippet iconBell()}<IconBell />{/snippet}
{#snippet iconStar()}<IconStar />{/snippet}
{#snippet iconCalendar()}<IconCalendar />{/snippet}
{#snippet iconEdit()}<IconEdit />{/snippet}
{#snippet iconBookmark()}<IconBookmark />{/snippet}

<div style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden; width: 240px;">
  <Nav
    mode="vertical"
    defaultSelectedKeys={['user']}
    {items}
    header={{ logo, text: '运营后台' }}
    footer={{ collapseButton: true }}
    style="height: 520px;"
    bodyStyle="height: 300px;"
  />
</div>
