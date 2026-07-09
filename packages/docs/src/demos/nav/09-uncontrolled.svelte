<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';

  // 非受控属性：defaultSelectedKeys / defaultOpenKeys / defaultIsCollapsed
  // 仅设初值，之后由组件内部维护状态。
  const items = [
    { itemKey: 'user', text: '用户管理', icon: iconDot },
    { itemKey: 'union', text: '活动管理', icon: iconDot },
    {
      itemKey: 'mgmt',
      text: '任务管理',
      icon: iconDot,
      items: [
        { itemKey: 'notice', text: '公告设置' },
        { itemKey: 'query', text: '任务查询' },
        { itemKey: 'input', text: '信息录入' },
      ],
    },
    {
      itemKey: 'job',
      text: '任务平台',
      icon: iconDot,
      items: [
        { itemKey: 'job-manage', text: '任务管理' },
        { itemKey: 'job-query', text: '用户任务查询' },
      ],
    },
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
