<script lang="ts">
  import { Layout, Nav, Avatar, Breadcrumb, Skeleton, SkeletonParagraph } from '@chenzy-design/svelte';

  const sideItems = [
    { itemKey: 'Home', text: '首页' },
    { itemKey: 'Histogram', text: '基础数据' },
    { itemKey: 'Live', text: '测试功能' },
    { itemKey: 'Setting', text: '设置' },
  ];
</script>

{#snippet logo()}
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
    <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
    <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
  </svg>
{/snippet}

{#snippet navFooter()}
  <Avatar color="orange" size="small">YJ</Avatar>
{/snippet}

<Layout style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Layout.Sider style="background: var(--cd-color-bg-1);">
    <Nav
      style="max-width: 220px; height: 100%;"
      defaultSelectedKeys={['Home']}
      items={sideItems}
      header={{ logo, text: 'chenzy Design' }}
      footer={{ collapseButton: true }}
    />
  </Layout.Sider>
  <Layout>
    <Layout.Header style="background: var(--cd-color-bg-1);">
      <Nav mode="horizontal" footerSlot={navFooter} style="width: 100%;" />
    </Layout.Header>
    <Layout.Content style="padding: 24px; background: var(--cd-color-bg-0);">
      <Breadcrumb
        style="margin-bottom: 24px;"
        routes={['首页', '当这个页面标题很长时需要省略', '上一页', '详情页']}
      />
      <div
        style="border-radius: 10px; border: 1px solid var(--cd-color-border); height: 260px; padding: 32px;"
      >
        <Skeleton loading>
          {#snippet placeholder()}
            <SkeletonParagraph rows={3} />
          {/snippet}
          <p>Hi, chenzy design.</p>
        </Skeleton>
      </div>
    </Layout.Content>
    <Layout.Footer
      style="display: flex; justify-content: space-between; padding: 20px; color: var(--cd-color-text-2); background: var(--cd-color-fill-0);"
    >
      <span>Copyright © 2024 chenzy design. All Rights Reserved.</span>
      <span>
        <span style="margin-right: 24px;">平台客服</span>
        <span>反馈建议</span>
      </span>
    </Layout.Footer>
  </Layout>
</Layout>
