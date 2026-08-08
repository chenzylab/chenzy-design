<script lang="ts">
  import {
    Layout,
    Nav,
    Button,
    Avatar,
    Breadcrumb,
    Skeleton,
    SkeletonParagraph,
  } from '@chenzy-design/svelte';
  import {
    IconSemiLogo,
    IconBell,
    IconHelpCircle,
    IconBytedanceLogo,
    IconHome,
    IconHistogram,
    IconLive,
    IconSetting,
  } from '@chenzy-design/icons';

  const sideItems = [
    { itemKey: 'Home', text: '首页', icon: iconHome },
    { itemKey: 'Histogram', text: '基础数据', icon: iconHistogram },
    { itemKey: 'Live', text: '测试功能', icon: iconLive },
    { itemKey: 'Setting', text: '设置', icon: iconSetting },
  ];
</script>

{#snippet iconHome()}<IconHome size="large" />{/snippet}
{#snippet iconHistogram()}<IconHistogram size="large" />{/snippet}
{#snippet iconLive()}<IconLive size="large" />{/snippet}
{#snippet iconSetting()}<IconSetting size="large" />{/snippet}

{#snippet logo()}
  <IconSemiLogo style="height: 36px; font-size: 36px;" />
{/snippet}

{#snippet bellIcon()}<IconBell size="large" />{/snippet}
{#snippet helpIcon()}<IconHelpCircle size="large" />{/snippet}

<Layout style="border: 1px solid var(--cd-color-border);">
  <Layout.Header style="background: var(--cd-color-bg-1);">
    <div>
      <Nav mode="horizontal" defaultSelectedKeys={['Home']}>
        <Nav.Header {logo} />
        <span style="color: var(--cd-color-text-2);">
          <span style="margin-right: 24px; color: var(--cd-color-text-0); font-weight: 600;">
            模版推荐
          </span>
          <span style="margin-right: 24px;">所有模版</span>
          <span>我的模版</span>
        </span>
        <Nav.Footer>
          <Button
            theme="borderless"
            icon={bellIcon}
            style="color: var(--cd-color-text-2); margin-right: 12px;"
          />
          <Button
            theme="borderless"
            icon={helpIcon}
            style="color: var(--cd-color-text-2); margin-right: 12px;"
          />
          <Avatar color="orange" size="small">YJ</Avatar>
        </Nav.Footer>
      </Nav>
    </div>
  </Layout.Header>
  <Layout>
    <Layout.Sider style="background: var(--cd-color-bg-1);">
      <Nav
        style="max-width: 220px; height: 100%;"
        defaultSelectedKeys={['Home']}
        items={sideItems}
        footer={{ collapseButton: true }}
      />
    </Layout.Sider>
    <Layout.Content style="padding: 24px; background: var(--cd-color-bg-0);">
      <Breadcrumb
        style="margin-bottom: 24px;"
        routes={['首页', '当这个页面标题很长时需要省略', '上一页', '详情页']}
      />
      <div
        style="border-radius: 10px; border: 1px solid var(--cd-color-border); height: 376px; padding: 32px;"
      >
        <Skeleton loading>
          {#snippet placeholder()}
            <SkeletonParagraph rows={2} />
          {/snippet}
          <p>Hi, Bytedance dance dance.</p>
          <p>Hi, Bytedance dance dance.</p>
        </Skeleton>
      </div>
    </Layout.Content>
  </Layout>
  <Layout.Footer
    style="display: flex; justify-content: space-between; padding: 20px; color: var(--cd-color-text-2); background: var(--cd-color-fill-0);"
  >
    <span style="display: flex; align-items: center;">
      <IconBytedanceLogo size="large" style="margin-right: 8px;" />
      <span>Copyright © 2023 ByteDance. All Rights Reserved. </span>
    </span>
    <span>
      <span style="margin-right: 24px;">平台客服</span>
      <span>反馈建议</span>
    </span>
  </Layout.Footer>
</Layout>
