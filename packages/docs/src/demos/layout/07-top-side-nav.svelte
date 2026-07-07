<script lang="ts">
  import { Layout, Nav, Avatar, Breadcrumb } from '@chenzy-design/svelte';

  // Nav 折叠态用 inline-size:100% 吃满容器，需外层 Sider 同步收窄宽度，否则图标会浮在宽栏中间。
  // 接 Nav 的 onCollapseChange → 联动 Sider 的 collapsed，使折叠时侧栏收到 collapsedWidth。
  let sideCollapsed = $state(false);

  const topItems = [
    { itemKey: 'workbench', text: '工作台' },
    { itemKey: 'projects', text: '项目' },
    { itemKey: 'docs', text: '文档' },
  ];

  const sideItems = [
    { itemKey: 'dashboard', text: '仪表盘', icon: iconGrid },
    { itemKey: 'data', text: '基础数据', icon: iconChart },
    {
      itemKey: 'tasks',
      text: '任务平台',
      icon: iconList,
      items: [
        { itemKey: 'task-manage', text: '任务管理' },
        { itemKey: 'task-query', text: '任务查询' },
      ],
    },
    { itemKey: 'setting', text: '设置', icon: iconGear },
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
{#snippet iconGrid()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
{/snippet}
{#snippet iconChart()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
{/snippet}
{#snippet iconList()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
{/snippet}
{#snippet iconGear()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
{/snippet}

<div style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden; height: 420px;">
  <Layout style="height: 100%;">
    <Layout.Header style="background: var(--cd-color-bg-1); padding-inline: 16px;">
      <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
        <Nav mode="horizontal" defaultSelectedKeys={['workbench']} items={topItems} header={{ logo, text: '运营后台' }} />
        <Avatar size="small" color="var(--cd-color-primary)">BD</Avatar>
      </div>
    </Layout.Header>
    <Layout hasSider>
      <Layout.Sider
        width={200}
        collapsedWidth={64}
        collapsed={sideCollapsed}
        style="background: var(--cd-color-bg-1); border-inline-end: 1px solid var(--cd-color-border);"
      >
        <Nav
          mode="vertical"
          defaultSelectedKeys={['dashboard']}
          defaultOpenKeys={['tasks']}
          items={sideItems}
          footer={{ collapseButton: true }}
          onCollapseChange={(c) => (sideCollapsed = c)}
          style="height: 100%;"
        />
      </Layout.Sider>
      <Layout.Content padding style="background: var(--cd-color-bg-0);">
        <Breadcrumb routes={[{ label: '首页' }, { label: '仪表盘' }, { label: '详情页' }]} />
        <div
          style="margin-top:16px; border-radius:10px; border:1px solid var(--cd-color-border); height:240px; padding:24px; color: var(--cd-color-text-2);"
        >
          顶部 + 侧边导航：一般后台平台的标准骨架。顶栏放全局导航与用户区，侧栏放功能导航（可折叠）。
        </div>
      </Layout.Content>
    </Layout>
  </Layout>
</div>
