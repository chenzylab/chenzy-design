<script lang="ts">
  import { Layout, Nav, Button, Avatar, Breadcrumb } from '@chenzy-design/svelte';

  const items = [
    { itemKey: 'home', text: '首页', icon: iconHome },
    { itemKey: 'live', text: '直播', icon: iconLive },
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
{#snippet iconHome()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
{/snippet}
{#snippet iconLive()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49"/></svg>
{/snippet}
{#snippet iconGear()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
{/snippet}
{#snippet iconBell()}
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
{/snippet}
{#snippet iconHelp()}
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
{/snippet}
{#snippet byteLogo()}
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="3" y="5" width="3" height="14" rx="1"/><rect x="9" y="8" width="3" height="11" rx="1"/><rect x="15" y="3" width="3" height="16" rx="1"/><rect x="21" y="9" width="0" height="0"/></svg>
{/snippet}

<!-- 对齐 Semi「顶部导航布局」：Layout 仅描边、Header(bg-1) 内 Nav 横排（header logo + items + footer 操作区），
     Content(bg-0) 放 Breadcrumb + 带边框内容卡，底部 Footer 版权区。 -->
<Layout style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Layout.Header style="background: var(--cd-color-bg-1); padding-inline: 16px;">
    <Nav mode="horizontal" defaultSelectedKeys={['home']} {items} header={{ logo, text: 'chenzy-design' }}>
      {#snippet footerSlot()}
        <div style="display:flex; align-items:center; gap:12px; margin-inline-start:auto;">
          <Button theme="borderless" type="tertiary" icon={iconBell} ariaLabel="通知" />
          <Button theme="borderless" type="tertiary" icon={iconHelp} ariaLabel="帮助" />
          <Avatar size="small" color="var(--cd-color-warning)">YJ</Avatar>
        </div>
      {/snippet}
    </Nav>
  </Layout.Header>
  <Layout.Content padding style="background: var(--cd-color-bg-0);">
    <div style="margin-bottom:16px;">
      <Breadcrumb
        routes={[{ name: '首页' }, { name: '当这个页面标题很长时需要省略' }, { name: '上一页' }, { name: '详情页' }]}
      />
    </div>
    <div
      style="border-radius:10px; border:1px solid var(--cd-color-border); height:200px; padding:24px; color: var(--cd-color-text-2);"
    >
      <p style="margin:0 0 8px;">Hi, chenzy dance dance.</p>
      <p style="margin:0;">Hi, chenzy dance dance.</p>
    </div>
  </Layout.Content>
  <Layout.Footer
    style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; color: var(--cd-color-text-2); background: var(--cd-color-bg-1);"
  >
    <span style="display:flex; align-items:center; gap:8px;">
      {@render byteLogo()}
      <span>Copyright © 2026 chenzy-design. All Rights Reserved.</span>
    </span>
    <span style="display:flex; gap:24px;">
      <span>平台客服</span>
      <span>反馈建议</span>
    </span>
  </Layout.Footer>
</Layout>
