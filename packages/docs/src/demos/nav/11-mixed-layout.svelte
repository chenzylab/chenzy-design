<script lang="ts">
  import { Nav, Avatar, Dropdown, Layout, Breadcrumb, Skeleton, SkeletonParagraph } from '@chenzy-design/svelte';
  import { IconSemiLogo, IconBytedanceLogo, IconApps, IconCalendar, IconList, IconSetting } from '@chenzy-design/icons';

  const { Header, Footer, Sider, Content } = Layout;

  // 顶部水平导航：审批管理带二级子菜单、任务平台带子菜单；footer 用 Dropdown + Avatar 组合。
  const topItems = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'union', text: '活动管理', icon: iconUnion },
    {
      itemKey: 'approve-management',
      text: '审批管理',
      icon: iconApprove,
      items: [
        '入驻审核',
        {
          itemKey: 'operation-management',
          text: '运营管理',
          items: ['人员管理', '人员变更'],
        },
      ],
    },
    {
      text: '任务平台',
      icon: iconJob,
      itemKey: 'job',
      items: ['任务管理', '用户任务查询'],
    },
  ];

  // 左侧垂直导航：与顶部同层级数据结构，作为侧边栏。
  const sideItems = [
    {
      itemKey: 'approve-management',
      text: '审批管理',
      icon: iconApprove,
      items: [
        '入驻审核',
        {
          itemKey: 'operation-management',
          text: '运营管理',
          items: ['人员管理', '人员变更'],
        },
      ],
    },
    {
      text: '任务平台',
      icon: iconJob,
      itemKey: 'job',
      items: ['任务管理', '用户任务查询'],
    },
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'union', text: '活动管理', icon: iconUnion },
  ];

  const routes = ['首页', '当这个页面标题很长时需要省略', '上一页', '详情页'];
</script>

{#snippet logo()}<IconSemiLogo style="height:36px; font-size:36px" />{/snippet}
{#snippet iconUser()}<IconApps />{/snippet}
{#snippet iconUnion()}<IconCalendar />{/snippet}
{#snippet iconApprove()}<IconList />{/snippet}
{#snippet iconJob()}<IconSetting />{/snippet}

{#snippet footerNav()}
  <Dropdown position="bottomEnd">
    <Avatar size="small" color="light-blue" style="margin: 4px">BD</Avatar>
    <span>Bytedancer</span>

    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown.Item>详情</Dropdown.Item>
        <Dropdown.Item>退出</Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
  </Dropdown>
{/snippet}

{#snippet footerContent()}
  <span style="display: flex; align-items: center;">
    <IconBytedanceLogo size="large" style="margin-right: 8px" />
    <span>Copyright © {new Date().getFullYear()} ByteDance. All Rights Reserved.</span>
  </span>
  <span>
    <span style="margin-right: 24px">平台客服</span>
    <span>反馈建议</span>
  </span>
{/snippet}

<Layout style="border: 1px solid var(--cd-color-border);">
  <Header style="background-color: var(--cd-color-bg-1);">
    <div>
      <Nav
        mode="horizontal"
        items={topItems}
        header={{ logo, text: 'Semi 运营后台' }}
        footerSlot={footerNav}
        onSelect={(d) => console.log('trigger onSelect: ', d)}
      />
    </div>
  </Header>
  <Layout hasSider>
    <Sider style="background-color: var(--cd-color-bg-1);">
      <Nav
        style="max-width: 220px; height: 100%;"
        defaultSelectedKeys={['user']}
        items={sideItems}
        footer={{ collapseButton: true }}
      />
    </Sider>
    <Content style="padding: 24px; background-color: var(--cd-color-bg-0);">
      <Breadcrumb style="margin-bottom: 24px;" {routes} />
      <div style="border-radius: 10px; border: 1px solid var(--cd-color-border); height: 376px; padding: 32px;">
        <Skeleton loading placeholder={paragraphPlaceholder}>
          <p>Hi, Bytedance dance dance.</p>
          <p>Hi, Bytedance dance dance.</p>
        </Skeleton>
      </div>
    </Content>
  </Layout>
  <Footer
    style="display: flex; justify-content: space-between; padding: 20px; color: var(--cd-color-text-2); background-color: var(--cd-color-fill-0);"
  >
    {@render footerContent()}
  </Footer>
</Layout>

{#snippet paragraphPlaceholder()}
  <SkeletonParagraph rows={2} />
{/snippet}
