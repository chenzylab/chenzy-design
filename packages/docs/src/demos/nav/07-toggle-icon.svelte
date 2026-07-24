<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo, IconUser, IconCalendar, IconApps } from '@chenzy-design/icons';

  // 展开收起箭头位置：toggleIconPosition='left' 将子导航展开箭头置于文案前（默认 'right'）。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'union', text: '活动管理', icon: iconCalendar },
    {
      itemKey: 'job',
      text: '任务平台',
      icon: iconApps,
      items: [
        { itemKey: 'job-manage', text: '任务管理' },
        { itemKey: 'job-query', text: '用户任务查询' },
      ],
    },
  ];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconCalendar()}<IconCalendar />{/snippet}
{#snippet iconApps()}<IconApps />{/snippet}

<div style="width: 240px; height: 300px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    toggleIconPosition="left"
    defaultOpenKeys={['job']}
    {items}
    header={{ logo, text: '运营后台' }}
    footer={{ collapseButton: true }}
    style="height: 100%;"
  />
</div>
