<script lang="ts">
  import { Layout, Nav, Avatar, Breadcrumb } from '@chenzy-design/svelte';

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

<div style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Layout>
    <Layout.Header style="background: var(--cd-color-bg-1); padding-inline: 16px;">
      <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
        <Nav mode="horizontal" defaultSelectedKeys={['home']} {items} header={{ logo, text: 'chenzy-design' }} />
        <Avatar size="small" color="var(--cd-color-warning)">YJ</Avatar>
      </div>
    </Layout.Header>
    <Layout.Content padding style="background: var(--cd-color-bg-0);">
      <Breadcrumb routes={[{ label: '首页' }, { label: '组件' }, { label: '详情页' }]} />
      <!-- 顶栏导航的典型内容：一排概览卡 + 主内容卡，避免空旷 -->
      <div style="margin-top:16px; display:flex; gap:12px;">
        {#each [{ k: '今日访问', v: '8,492' }, { k: '订单', v: '326' }, { k: '转化率', v: '4.7%' }] as s (s.k)}
          <div style="flex:1; padding:14px 16px; border-radius:8px; background: var(--cd-color-fill-1);">
            <div style="font-size:12px; color: var(--cd-color-text-3);">{s.k}</div>
            <div style="font-size:20px; font-weight:600; color: var(--cd-color-text-0); margin-top:4px;">{s.v}</div>
          </div>
        {/each}
      </div>
      <div
        style="margin-top:12px; border-radius:8px; border:1px solid var(--cd-color-border); height:96px; display:flex; align-items:center; justify-content:center; color: var(--cd-color-text-3);"
      >
        主内容区
      </div>
    </Layout.Content>
  </Layout>
</div>
