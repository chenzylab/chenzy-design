<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';
  import { IconSemiLogo, IconUser, IconCalendar, IconList, IconApps } from '@chenzy-design/icons';

  // 非受控属性：defaultSelectedKeys / defaultOpenKeys / defaultIsCollapsed
  // 仅设初值，之后由组件内部维护状态。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'union', text: '活动管理', icon: iconCalendar },
    {
      itemKey: 'mgmt',
      text: '任务管理',
      icon: iconList,
      items: [
        { itemKey: 'notice', text: '公告设置' },
        { itemKey: 'query', text: '任务查询' },
        { itemKey: 'input', text: '信息录入' },
      ],
    },
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
{#snippet iconList()}<IconList />{/snippet}
{#snippet iconApps()}<IconApps />{/snippet}

<div style="width: 240px; height: 340px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    defaultOpenKeys={['mgmt']}
    defaultSelectedKeys={['input']}
    {items}
    header={{ logo, text: '运营后台' }}
    footer={{ collapseButton: true }}
    style="height: 100%;"
  />
</div>
