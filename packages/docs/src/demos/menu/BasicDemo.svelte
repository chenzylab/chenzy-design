<script lang="ts">
  import { Menu, Button, Text } from '@chenzy-design/svelte';

  let menuSelected = $state<string | number>('overview');
  let menuCollapsed = $state(true);
  let menuMultiple = $state<(string | number)[]>(['overview']);
  let navCurrent = $state<string | number>('nav-docs');

  function toggleMenuMultiple(k: string | number) {
    menuMultiple = menuMultiple.includes(k)
      ? menuMultiple.filter((x) => x !== k)
      : [...menuMultiple, k];
  }

  // hover 浮层菜单：含两级嵌套，验证多级浮层
  const menuPopupItems = [
    { key: 'overview', label: '概览' },
    {
      key: 'settings',
      label: '设置',
      children: [
        { key: 'profile', label: '个人资料' },
        {
          key: 'security',
          label: '安全',
          children: [
            { key: 'password', label: '修改密码' },
            { key: '2fa', label: '两步验证' },
          ],
        },
      ],
    },
    { key: 'about', label: '关于' },
  ];

  // divider 分隔符 + group 分组标题
  const menuGroupItems = [
    {
      type: 'group' as const,
      key: 'g-main',
      label: '主导航',
      children: [
        { key: 'overview', label: '概览' },
        { key: 'analytics', label: '分析' },
      ],
    },
    { type: 'divider' as const },
    {
      type: 'group' as const,
      key: 'g-manage',
      label: '管理',
      children: [
        { key: 'users', label: '用户' },
        {
          key: 'settings',
          label: '设置',
          children: [
            { key: 'profile', label: '个人资料' },
            { key: 'security', label: '安全' },
          ],
        },
      ],
    },
    { type: 'divider' as const },
    { key: 'help', label: '帮助', disabled: true },
  ];

  // navigation 用途：站点导航，叶子带 href 渲染原生 <a>，含 inline 子导航
  const navItems = [
    { key: 'nav-home', label: '首页', href: '#nav-home' },
    {
      key: 'nav-docs',
      label: '文档',
      children: [
        { key: 'nav-start', label: '快速开始', href: '#nav-start' },
        { key: 'nav-guide', label: '指南', href: '#nav-guide' },
      ],
    },
    { type: 'divider' as const },
    { key: 'nav-blog', label: '博客', href: '#nav-blog' },
    { key: 'nav-ext', label: 'GitHub', href: 'https://github.com', target: '_blank', rel: 'noopener noreferrer' },
    { key: 'nav-off', label: '停用项', href: '#nav-off', disabled: true },
  ];
</script>

<div style="display:flex; flex-direction:column; gap:24px">
  <div style="display: flex; gap: 24px; align-items: flex-start">
    <div style="width: 200px" data-testid="menu-icon">
      <Text type="tertiary">inline 内联展开（带图标）</Text>
      {#snippet iconOverview()}<span>📊</span>{/snippet}
      {#snippet iconSettings()}<span>⚙️</span>{/snippet}
      {#snippet iconHelp()}<span>❓</span>{/snippet}
      <Menu
        items={[
          { key: 'overview', label: '概览', icon: iconOverview },
          {
            key: 'settings',
            label: '设置',
            icon: iconSettings,
            children: [
              { key: 'profile', label: '个人资料' },
              { key: 'security', label: '安全' },
            ],
          },
          { key: 'help', label: '帮助', icon: iconHelp, disabled: true },
        ]}
        mode="inline"
        selectedKeys={[menuSelected]}
        defaultOpenKeys={['settings']}
        onSelect={(k) => (menuSelected = k)}
      />
      <Text type="tertiary">菜单选中：{menuSelected}</Text>
    </div>

    <div style="width: 200px" data-testid="menu-popup">
      <Text type="tertiary">vertical hover 浮层（多级）</Text>
      <Menu
        items={menuPopupItems}
        mode="vertical"
        selectedKeys={[menuSelected]}
        onSelect={(k) => (menuSelected = k)}
      />
    </div>
  </div>

  <div data-testid="menu-multiple">
    <Text type="tertiary">multiple 多选（点击 toggle，多项可同时高亮 + 勾选）</Text>
    <div style="width: 200px">
      <Menu
        mode="inline"
        multiple
        items={[
          { key: 'overview', label: '概览' },
          { key: 'analytics', label: '分析' },
          { key: 'reports', label: '报表' },
          { key: 'settings', label: '设置' },
        ]}
        selectedKeys={menuMultiple}
        onSelect={(k) => toggleMenuMultiple(k)}
      />
      <Text type="tertiary">已选：{menuMultiple.join(', ') || '（无）'}</Text>
    </div>
  </div>

  <div data-testid="menu-horizontal">
    <Text type="tertiary">horizontal 菜单栏（hover 子菜单 + ←→ 导航）</Text>
    <Menu
      items={menuPopupItems}
      mode="horizontal"
      selectedKeys={[menuSelected]}
      onSelect={(k) => (menuSelected = k)}
    />
  </div>

  <div data-testid="menu-collapsed">
    <Text type="tertiary">inlineCollapsed 折叠图标轨（只显图标 + hover 浮层）</Text>
    {#snippet iconCOverview()}<span>📊</span>{/snippet}
    {#snippet iconCSettings()}<span>⚙️</span>{/snippet}
    {#snippet iconCHelp()}<span>❓</span>{/snippet}
    <div>
      <Button size="small" onclick={() => (menuCollapsed = !menuCollapsed)}>
        {menuCollapsed ? '展开' : '收起'}
      </Button>
    </div>
    <div style="margin-top:8px">
      <Menu
        mode="inline"
        inlineCollapsed={menuCollapsed}
        items={[
          { key: 'overview', label: '概览', icon: iconCOverview },
          {
            key: 'settings',
            label: '设置',
            icon: iconCSettings,
            children: [
              { key: 'profile', label: '个人资料' },
              { key: 'security', label: '安全' },
            ],
          },
          { key: 'help', label: '帮助', icon: iconCHelp, disabled: true },
        ]}
        defaultOpenKeys={['settings']}
        selectedKeys={[menuSelected]}
        onSelect={(k) => (menuSelected = k)}
      />
    </div>
  </div>

  <div data-testid="menu-divider-group">
    <Text type="tertiary">divider 分隔符 + group 分组标题（inline）</Text>
    <div style="width: 200px">
      <Menu
        mode="inline"
        items={menuGroupItems}
        defaultOpenKeys={['settings']}
        selectedKeys={[menuSelected]}
        onSelect={(k) => (menuSelected = k)}
      />
    </div>
  </div>

  <div data-testid="menu-navigation">
    <Text type="tertiary">
      purpose="navigation" 站点导航（nav landmark + 原生 &lt;a href&gt;，aria-current=page，Tab 键序）
    </Text>
    <div style="width: 200px; margin-top:8px">
      <Menu
        mode="inline"
        purpose="navigation"
        items={navItems}
        defaultOpenKeys={['nav-docs']}
        selectedKeys={[navCurrent]}
        ariaLabel="主站导航"
        onSelect={(k) => (navCurrent = k)}
      />
    </div>
    <Text type="tertiary">horizontal navigation（顶部导航栏）</Text>
    <Menu
      mode="horizontal"
      purpose="navigation"
      items={navItems}
      selectedKeys={[navCurrent]}
      ariaLabel="顶部站点导航"
      onSelect={(k) => (navCurrent = k)}
    />
    <Text type="tertiary">当前：{navCurrent}</Text>
  </div>
</div>
