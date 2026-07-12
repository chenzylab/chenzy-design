<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';

  // 导航样式定义：style 定外层高度、bodyStyle 定列表区高度 →
  // 头部/底部固定，中间列表可滚动。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconDot },
    { itemKey: 'order', text: '订单管理', icon: iconDot },
    { itemKey: 'res', text: '资源管理', icon: iconDot },
    {
      itemKey: 'task',
      text: '任务平台',
      icon: iconDot,
      items: [
        { itemKey: 'task-manage', text: '任务管理' },
        { itemKey: 'task-query', text: '用户任务查询' },
      ],
    },
    { itemKey: 'push', text: '推送通知', icon: iconDot },
    { itemKey: 'step', text: '任务', icon: iconDot },
    { itemKey: 'act', text: '活动管理', icon: iconDot },
    { itemKey: 'tool', text: '内容工具', icon: iconDot },
    { itemKey: 'quick', text: '快捷导航', icon: iconDot },
  ];
</script>

{#snippet logo()}
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
    <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
  </svg>
{/snippet}
{#snippet iconDot()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8" /></svg>
{/snippet}

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
