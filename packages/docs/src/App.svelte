<script lang="ts">
  import {
    Button,
    Icon,
    Divider,
    Space,
    Title,
    Text,
    Paragraph,
    Link,
    Row,
    Col,
    Layout,
    Input,
    Textarea,
    Switch,
    Checkbox,
    CheckboxGroup,
    Radio,
    RadioGroup,
    InputNumber,
    Rating,
    Slider,
    Form,
    Select,
    AutoComplete,
    TagInput,
    ColorPicker,
    DatePicker,
    TimePicker,
    Cascader,
    TreeSelect,
    Transfer,
    Upload,
    Breadcrumb,
    Pagination,
    Steps,
    Tabs,
    Dropdown,
    Menu,
    Anchor,
    Tag,
    Avatar,
    Badge,
    Card,
    Tooltip,
    Popover,
    Empty,
    Descriptions,
    Collapse,
    Timeline,
    List,
    Image,
    Highlight,
    VirtualList,
    Carousel,
    Tree,
    Table,
    Calendar,
    ScrollList,
    OverflowList,
    Spin,
    Progress,
    Skeleton,
    SkeletonAvatar,
    SkeletonTitle,
    SkeletonParagraph,
    SkeletonImage,
    SkeletonButton,
    Banner,
    Modal,
    Drawer,
    Popconfirm,
    Toast,
    notification,
    BackTop,
    LocaleProvider,
    zh_CN,
    en_US,
    ConfigProvider,
    ResizeObserver,
    LottieIcon,
  } from '@chenzy-design/svelte';
  import type { LottiePlayerFactory } from '@chenzy-design/svelte';

  // 演示用 mock player（真实场景注入 lottie-web 的 loadAnimation 包装）。
  // 这里用一个 CSS 旋转的方块模拟动画播放/暂停。
  const mockPlayer: LottiePlayerFactory = ({ container, autoplay }) => {
    const el = document.createElement('div');
    el.style.cssText =
      'width:100%;height:100%;border-radius:3px;background:var(--cd-color-primary);' +
      'animation:cd-demo-spin 1s linear infinite;animation-play-state:paused';
    container.appendChild(el);
    const setState = (s: string) => (el.style.animationPlayState = s);
    if (autoplay) setState('running');
    return {
      play: () => setState('running'),
      pause: () => setState('paused'),
      stop: () => {
        setState('paused');
        el.style.transform = 'rotate(0deg)';
      },
      goToFrame: () => setState('paused'),
      destroy: () => el.remove(),
    };
  };

  const bigData = Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `第 ${i + 1} 行` }));
  let carouselIdx = $state(0);

  const treeData = [
    {
      key: 'design',
      label: '设计',
      children: [
        { key: 'figma', label: 'Figma 规范' },
        { key: 'token', label: 'Design Token' },
      ],
    },
    {
      key: 'dev',
      label: '研发',
      children: [
        { key: 'fe', label: '前端' },
        {
          key: 'be',
          label: '后端',
          children: [
            { key: 'api', label: 'API' },
            { key: 'db', label: '数据库' },
          ],
        },
      ],
    },
    { key: 'qa', label: '测试' },
  ];
  let treeSel = $state<string | number>('figma');
  let treeChecked = $state<(string | number)[]>([]);

  type TableRow = {
    key: number;
    name: string;
    age: number;
    city: string;
    [k: string]: unknown;
  };
  const tableData: TableRow[] = [
    { key: 1, name: '陈一', age: 32, city: '杭州' },
    { key: 2, name: '林二', age: 28, city: '上海' },
    { key: 3, name: '王三', age: 45, city: '北京' },
    { key: 4, name: '赵四', age: 23, city: '深圳' },
    { key: 5, name: '孙五', age: 38, city: '广州' },
    { key: 6, name: '周六', age: 30, city: '成都' },
    { key: 7, name: '吴七', age: 26, city: '武汉' },
  ];
  const tableColumns = [
    { dataIndex: 'name', title: '姓名', sorter: true },
    { dataIndex: 'age', title: '年龄', sorter: true, align: 'right' as const },
    { dataIndex: 'city', title: '城市' },
  ];
  let tableSelected = $state<(string | number)[]>([]);

  // Calendar：锚定到固定月份（2026-06）便于演示事件
  const calAnchor = new Date(2026, 5, 1);
  const calEvents = [
    { key: 'm1', start: new Date(2026, 5, 3), title: '周会' },
    { key: 'm2', start: new Date(2026, 5, 10), title: '设计评审' },
    { key: 'm3', start: new Date(2026, 5, 10), title: '需求对齐' },
    { key: 'm4', start: new Date(2026, 5, 10), title: '联调' },
    { key: 'm5', start: new Date(2026, 5, 10), title: '复盘' },
    { key: 'm6', start: new Date(2026, 5, 15), end: new Date(2026, 5, 17), title: '出差', color: 'var(--cd-color-warning)' },
    { key: 'm7', start: new Date(2026, 5, 22), title: '发版', color: 'var(--cd-color-success)' },
  ];
  let calSelectedText = $state('（未选）');

  const hourData = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
    disabled: i === 3 || i === 4,
  }));
  let pickedHour = $state<string | number>(9);

  const overflowTags = ['设计', '研发', '测试', '产品', '运营', '市场', '财务', '法务'];
  let overflowWidth = $state(400);
  let overflowHidden = $state(0);

  let spinWrap = $state(true);

  let progressPct = $state(45);

  let skeletonLoading = $state(true);

  let bannerOpen = $state(true);

  let modalOpen = $state(false);
  let dangerModalOpen = $state(false);

  let drawerRight = $state(false);
  let drawerLeft = $state(false);
  let drawerBottom = $state(false);

  let popResult = $state('（无）');

  let localeIsZh = $state(true);

  let submitted = $state('');
  let selVal = $state<string | number>('');
  let multiVal = $state<(string | number)[]>([]);
  let acVal = $state('');
  let tags = $state<string[]>(['svelte', 'vite']);
  let color = $state('#3366ff');
  let dateVal = $state<Date | null>(null);
  let timeVal = $state<Date | null>(null);
  let cascaderVal = $state<(string | number)[]>([]);
  let treeVal = $state<string | number | null>(null);
  let transferVal = $state<(string | number)[]>(['b']);
  let page = $state(1);
  let step = $state(1);
  let activeTab = $state<string | number>('a');
  let lastDropdown = $state('');
  const tabList = [
    { tab: '账户', itemKey: 'a' },
    { tab: '安全', itemKey: 'b' },
    { tab: '通知', itemKey: 'c', disabled: true },
  ];
  const dropdownItems = [
    { key: 'edit', label: '编辑' },
    { key: 'copy', label: '复制' },
    { key: 'delete', label: '删除', danger: true },
  ];
  let menuSelected = $state<string | number>('overview');
  const menuItems = [
    { key: 'overview', label: '概览' },
    {
      key: 'settings',
      label: '设置',
      children: [
        { key: 'profile', label: '个人资料' },
        { key: 'security', label: '安全' },
      ],
    },
    { key: 'help', label: '帮助', disabled: true },
  ];
  let anchorKey = $state('#sec-1');
  const anchorLinks = [
    { key: '#sec-1', href: '#sec-1', title: '第一节' },
    { key: '#sec-2', href: '#sec-2', title: '第二节' },
    { key: '#sec-3', href: '#sec-3', title: '第三节' },
  ];
  const transferData = [
    { key: 'a', label: '北京' },
    { key: 'b', label: '上海' },
    { key: 'c', label: '广州' },
    { key: 'd', label: '深圳' },
  ];
  const regionData = [
    {
      label: '浙江',
      value: 'zj',
      children: [
        { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
        { label: '宁波', value: 'nb', children: [{ label: '海曙区', value: 'hs' }] },
      ],
    },
    {
      label: '江苏',
      value: 'js',
      children: [{ label: '南京', value: 'nj', children: [{ label: '玄武区', value: 'xw' }] }],
    },
  ];
  const orgTree = [
    {
      key: 'eng',
      label: '研发',
      children: [
        { key: 'fe', label: '前端' },
        { key: 'be', label: '后端' },
      ],
    },
    { key: 'design', label: '设计' },
  ];
  const fruitOptions = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橙子', value: 'orange' },
    { label: '葡萄', value: 'grape' },
  ];

  let collapsed = $state(false);
  let inputVal = $state('');
  let switchOn = $state(true);
  let checks = $state<(string | number)[]>(['a']);
  let radioVal = $state<string | number | boolean>('1');
  let numVal = $state<number | null>(3);
  let rateVal = $state(2.5);
  let sliderVal = $state(40);
  let rangeVal = $state<[number, number]>([20, 60]);

  let theme = $state<'light' | 'dark'>('light');
  $effect(() => {
    document.documentElement.dataset.theme = theme;
  });
</script>

<main class="p-6">
  <header class="flex items-center justify-between mb-6">
    <Title heading={3}>chenzy-design · M1 Basic</Title>
    <Button
      type="tertiary"
      onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}
    >
      切换主题：{theme}
    </Button>
  </header>

  <Title heading={5}>Button</Title>
  <Space wrap>
    <Button type="primary">主要按钮</Button>
    <Button type="secondary">次要</Button>
    <Button type="tertiary">文字</Button>
    <Button type="warning">警告</Button>
    <Button type="danger">危险</Button>
    <Button type="primary" disabled>禁用</Button>
    <Button type="primary" loading>加载中</Button>
  </Space>

  <Divider />

  <Title heading={5}>Icon</Title>
  <Space>
    <Icon size="small">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
      </svg>
    </Icon>
    <Icon status="success">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </Icon>
    <Icon status="error" size="large">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
      </svg>
    </Icon>
    <Icon spin label="加载中">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round" />
      </svg>
    </Icon>
  </Space>

  <Divider>分割线带文字</Divider>

  <Title heading={5}>Typography</Title>
  <Paragraph>
    这是一段正文 <Text type="secondary">次要文字</Text>、
    <Text mark>高亮</Text>、<Text code>code</Text>、
    <Text delete>删除线</Text>、<Text strong>加粗</Text>，以及
    <Link href="https://semi.design" target="_blank">一个链接</Link>。
  </Paragraph>

  <Divider dashed />

  <Title heading={5}>Space（vertical）</Title>
  <Space direction="vertical" align="start">
    <Text>第一行</Text>
    <Text type="tertiary">第二行</Text>
    <Button type="primary" size="small">一个按钮</Button>
  </Space>

  <Divider />

  <Title heading={5}>Grid（24 栅格 + gutter）</Title>
  <Row gutter={16}>
    <Col span={6}><div class="demo-cell">span 6</div></Col>
    <Col span={6}><div class="demo-cell">span 6</div></Col>
    <Col span={6}><div class="demo-cell">span 6</div></Col>
    <Col span={6}><div class="demo-cell">span 6</div></Col>
  </Row>
  <div style="height: 8px"></div>
  <Row gutter={16}>
    <Col span={8}><div class="demo-cell">span 8</div></Col>
    <Col span={8} offset={4}><div class="demo-cell">span 8 offset 4</div></Col>
  </Row>

  <Divider />

  <Title heading={5}>Layout（可折叠侧栏）</Title>
  <div class="demo-layout">
    <Layout hasSider>
      <Layout.Sider {collapsed} collapsible width={160} collapsedWidth={56}>
        <div class="demo-sider-body">侧栏</div>
      </Layout.Sider>
      <Layout>
        <Layout.Header>
          <div class="demo-bar">
            <Button
              size="small"
              type="tertiary"
              onclick={() => (collapsed = !collapsed)}
            >
              {collapsed ? '展开' : '收起'}
            </Button>
            <Text strong>页头</Text>
          </div>
        </Layout.Header>
        <Layout.Content padding>主体内容区</Layout.Content>
        <Layout.Footer>页脚</Layout.Footer>
      </Layout>
    </Layout>
  </div>

  <Divider />

  <Title heading={5}>M2 Input</Title>
  <Space direction="vertical" align="start">
    <Space>
      <Input
        placeholder="请输入"
        clearable
        value={inputVal}
        onChange={(v) => (inputVal = v)}
      />
      <Input type="password" placeholder="密码" />
      <Input status="error" placeholder="错误态" />
      <Input disabled placeholder="禁用" />
    </Space>
    <Text type="tertiary">受控值：{inputVal || '（空）'}</Text>

    <Textarea placeholder="多行文本，autosize" autosize showCount maxLength={100} />

    <Space>
      <Switch value={switchOn} onChange={(v) => (switchOn = v)} />
      <Text>开关：{switchOn ? '开' : '关'}</Text>
      <Switch disabled />
      <Switch loading />
    </Space>

    <CheckboxGroup
      value={checks}
      onChange={(v) => (checks = v)}
      options={[
        { label: '选项 A', value: 'a' },
        { label: '选项 B', value: 'b' },
        { label: '选项 C（禁用）', value: 'c', disabled: true },
      ]}
    />
    <Text type="tertiary">已选：{checks.join(', ') || '（无）'}</Text>

    <RadioGroup
      value={radioVal}
      onChange={(v) => (radioVal = v)}
      options={[
        { label: '单选 1', value: '1' },
        { label: '单选 2', value: '2' },
        { label: '单选 3', value: '3' },
      ]}
    />
    <Text type="tertiary">当前：{radioVal}</Text>
  </Space>

  <Divider />

  <Title heading={5}>M2 数值组件</Title>
  <Space direction="vertical" align="start">
    <Space>
      <InputNumber value={numVal} min={0} max={10} onChange={(v) => (numVal = v)} />
      <Text type="tertiary">数值：{numVal}</Text>
    </Space>

    <Space>
      <Rating value={rateVal} allowHalf onChange={(v) => (rateVal = v)} />
      <Text type="tertiary">评分：{rateVal}</Text>
    </Space>

    <div style="width: 280px">
      <Slider value={sliderVal} onChange={(v) => (sliderVal = v as number)} />
      <Text type="tertiary">单值：{sliderVal}</Text>
    </div>

    <div style="width: 280px">
      <Slider
        range
        value={rangeVal}
        onChange={(v) => (rangeVal = v as [number, number])}
      />
      <Text type="tertiary">区间：{rangeVal[0]} – {rangeVal[1]}</Text>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>Form（校验 + 提交）</Title>
  <div style="max-width: 360px">
    <Form
      onSubmit={(r) =>
        (submitted = r.valid ? `提交成功：${JSON.stringify(r.values)}` : '校验未通过')}
    >
      <Form.Input field="email" label="邮箱" required rules={[{ type: 'email' }]} />
      <Form.Input field="name" label="昵称" required />
      {#snippet footer({ submitting })}
        <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
      {/snippet}
    </Form>
    <Text type="tertiary">{submitted}</Text>
  </div>

  <Divider />

  <Title heading={5}>Select / AutoComplete</Title>
  <Space direction="vertical" align="start">
    <div style="width: 220px">
      <Select
        options={fruitOptions}
        value={selVal}
        clearable
        onChange={(v) => (selVal = v as string | number)}
      />
      <Text type="tertiary">单选：{selVal || '（未选）'}</Text>
    </div>

    <div style="width: 260px">
      <Select
        options={fruitOptions}
        multiple
        filter
        value={multiVal}
        onChange={(v) => (multiVal = v as (string | number)[])}
      />
      <Text type="tertiary">多选：{multiVal.join(', ') || '（无）'}</Text>
    </div>

    <div style="width: 220px">
      <AutoComplete
        data={['gmail.com', 'outlook.com', 'qq.com', '163.com']}
        value={acVal}
        placeholder="输入邮箱后缀"
        onChange={(v) => (acVal = v)}
      />
      <Text type="tertiary">输入：{acVal || '（空）'}</Text>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>TagInput / ColorPicker</Title>
  <Space direction="vertical" align="start">
    <div style="width: 320px">
      <TagInput
        value={tags}
        separator={[',', 'Enter']}
        placeholder="输入后回车或逗号"
        onChange={(t) => (tags = t)}
      />
      <Text type="tertiary">标签：{tags.join(' / ') || '（无）'}</Text>
    </div>

    <Space>
      <ColorPicker
        value={color}
        presets={['#3366ff', '#16a34a', '#ef4444', '#f59e0b']}
        onChange={(c) => (color = c)}
      />
      <Text type="tertiary">颜色：{color}</Text>
    </Space>
  </Space>

  <Divider />

  <Title heading={5}>DatePicker / TimePicker</Title>
  <Space direction="vertical" align="start">
    <Space>
      <DatePicker value={dateVal} onChange={(d) => (dateVal = d)} />
      <Text type="tertiary">
        日期：{dateVal ? dateVal.toLocaleDateString('zh-CN') : '（未选）'}
      </Text>
    </Space>
    <Space>
      <TimePicker value={timeVal} onChange={(t) => (timeVal = t)} />
      <Text type="tertiary">
        时间：{timeVal ? timeVal.toLocaleTimeString('zh-CN') : '（未选）'}
      </Text>
    </Space>
  </Space>

  <Divider />

  <Title heading={5}>Cascader / TreeSelect</Title>
  <Space direction="vertical" align="start">
    <div style="width: 240px">
      <Cascader
        treeData={regionData}
        value={cascaderVal}
        clearable
        onChange={(p) => (cascaderVal = p)}
      />
      <Text type="tertiary">级联：{cascaderVal.join(' / ') || '（未选）'}</Text>
    </div>
    <div style="width: 240px">
      <TreeSelect
        treeData={orgTree}
        value={treeVal}
        clearable
        defaultExpandAll
        onChange={(k) => (treeVal = k)}
      />
      <Text type="tertiary">树选：{treeVal ?? '（未选）'}</Text>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>Transfer / Upload</Title>
  <Space direction="vertical" align="start">
    <Transfer
      dataSource={transferData}
      value={transferVal}
      titles={['可选城市', '已选城市']}
      onChange={(keys) => (transferVal = keys)}
    />
    <Text type="tertiary">已选：{transferVal.join(', ') || '（无）'}</Text>

    <Upload multiple drag accept="image/*" />
  </Space>

  <Divider />

  <Title heading={5}>M3 导航：Breadcrumb / Pagination / Steps</Title>
  <Space direction="vertical" align="start">
    <Breadcrumb
      routes={[
        { label: '首页', href: '#' },
        { label: '组件', href: '#' },
        { label: '导航' },
      ]}
    />

    <Pagination total={256} currentPage={page} showTotal onChange={(p) => (page = p)} />
    <Text type="tertiary">当前页：{page}</Text>

    <div style="width: 480px">
      <Steps
        current={step}
        clickable
        steps={[
          { title: '填写信息', description: '基本资料' },
          { title: '确认订单', description: '核对内容' },
          { title: '完成', description: '提交成功' },
        ]}
        onChange={(c) => (step = c)}
      />
    </div>
    <Text type="tertiary">当前步：{step}</Text>
  </Space>

  <Divider />

  <Title heading={5}>Tabs / Dropdown</Title>
  <Space direction="vertical" align="start">
    <div style="width: 360px">
      <Tabs {tabList} value={activeTab} onChange={(k) => (activeTab = k)} />
    </div>
    <Text type="tertiary">当前标签：{activeTab}</Text>

    <Tabs {tabList} type="card" value={activeTab} onChange={(k) => (activeTab = k)} />

    <Dropdown
      items={dropdownItems}
      trigger="click"
      onSelect={(k) => (lastDropdown = String(k))}
    >
      {#snippet triggerContent()}
        <Button type="secondary">操作菜单 ▾</Button>
      {/snippet}
    </Dropdown>
    <Text type="tertiary">上次选择：{lastDropdown || '（无）'}</Text>
  </Space>

  <Divider />

  <Title heading={5}>Menu / Anchor</Title>
  <div style="display: flex; gap: 24px; align-items: flex-start">
    <div style="width: 200px">
      <Menu
        items={menuItems}
        selectedKeys={[menuSelected]}
        defaultOpenKeys={['settings']}
        onSelect={(k) => (menuSelected = k)}
      />
      <Text type="tertiary">菜单选中：{menuSelected}</Text>
    </div>
    <div style="width: 160px">
      <Anchor links={anchorLinks} value={anchorKey} onChange={(k) => (anchorKey = k)} />
      <Text type="tertiary">锚点：{anchorKey}</Text>
    </div>
  </div>

  <Divider />

  <Title heading={5}>M4 展示：Tag / Avatar / Badge / Card</Title>
  <Space direction="vertical" align="start">
    <Space>
      <Tag color="primary">主要</Tag>
      <Tag color="success" type="solid">成功</Tag>
      <Tag color="danger" type="ghost">危险</Tag>
      <Tag closable>可关闭</Tag>
      <Tag checkable>可选中</Tag>
    </Space>

    <Space>
      <Avatar>U</Avatar>
      <Avatar shape="square" color="primary">陈</Avatar>
      <Avatar size="large" src="https://invalid.example/x.png" alt="降级A" />
      <Avatar dot status="error">E</Avatar>
    </Space>

    <Space>
      <Badge count={5}><Avatar shape="square">消</Avatar></Badge>
      <Badge count={128}><Avatar shape="square">多</Avatar></Badge>
      <Badge dot><Avatar shape="square">点</Avatar></Badge>
      <Badge status="success" count="在线" />
    </Space>

    <div style="width: 280px">
      <Card title="卡片标题" bordered hoverable>
        {#snippet extra()}<Text type="tertiary">更多</Text>{/snippet}
        这是卡片正文内容。
        {#snippet actions()}
          <Button type="tertiary" size="small">操作一</Button>
          <Button type="tertiary" size="small">操作二</Button>
        {/snippet}
      </Card>
    </div>

    <Space>
      <Tooltip content="这是一条提示文字" placement="top">
        <Button type="secondary">悬停看提示</Button>
      </Tooltip>
      <Tooltip content="点击触发的提示" trigger="click" theme="light">
        <Button type="secondary">点击提示</Button>
      </Tooltip>
      <Popover title="弹出卡片" trigger="click" position="bottom">
        {#snippet contentSlot()}
          <div style="width: 160px">这是 Popover 的富内容区域。</div>
        {/snippet}
        <Button type="primary">点击弹出</Button>
      </Popover>
    </Space>

    <div data-testid="tooltip-collision" style="display:flex; justify-content:space-between; margin-top:8px">
      <Tooltip content="贴顶触发 flip：请求 top，空间不足应翻到 bottom" placement="top" defaultOpen>
        <Button type="secondary">贴顶</Button>
      </Tooltip>
      <Tooltip content="贴右触发 flip：请求 right，空间不足应翻到 left" placement="right" defaultOpen>
        <Button type="secondary">贴右</Button>
      </Tooltip>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>Empty / Descriptions / Collapse / Timeline</Title>
  <Space direction="vertical" align="start">
    <Empty image="noResult" description="换个关键词试试" />

    <div style="width: 420px">
      <Descriptions
        bordered
        column={2}
        data={[
          { label: '姓名', value: '陈某' },
          { label: '年龄', value: 28 },
          { label: '邮箱', value: 'a@b.com', span: 2 },
          { label: '备注', value: null },
        ]}
      />
    </div>

    <div style="width: 420px">
      <Collapse panels={[{ key: 'p1', header: '面板一' }, { key: 'p2', header: '面板二' }]}>
        {#snippet children({ key })}
          {#if key === 'p1'}面板一的内容{:else}面板二的内容{/if}
        {/snippet}
      </Collapse>
    </div>

    <Timeline
      dataSource={[
        { content: '创建订单', time: '09:00' },
        { content: '已发货', time: '12:30', color: 'var(--cd-color-success)' },
        { content: '运输中', time: '15:00' },
      ]}
      pending="等待签收"
    />
  </Space>

  <Divider />

  <Title heading={5}>List / Image / Highlight</Title>
  <Space direction="vertical" align="start">
    <div style="width: 320px">
      <List
        bordered
        header="任务列表"
        dataSource={[
          { key: 1, name: '设计评审' },
          { key: 2, name: '前端开发' },
          { key: 3, name: '联调测试' },
        ]}
      >
        {#snippet renderItem(item)}
          <span>{(item as { name: string }).name}</span>
        {/snippet}
      </List>
    </div>

    <Image
      src="https://invalid.example/photo.jpg"
      alt="示例图片"
      width={160}
      height={100}
      preview
    />

    <Highlight
      sourceString="chenzy-design 是一套对标 Semi 的 Svelte 组件库"
      searchWords={['design', 'Svelte']}
    />
  </Space>

  <Divider />

  <Title heading={5}>VirtualList（1 万行） / Carousel</Title>
  <Space direction="vertical" align="start">
    <div style="width: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px">
      <VirtualList data={bigData} height={200} itemSize={36} getKey={(it) => it.id}>
        {#snippet renderItem(item)}
          <div style="padding: 0 12px; line-height: 36px; border-bottom: 1px solid var(--cd-color-border)">
            {(item as { text: string }).text}
          </div>
        {/snippet}
      </VirtualList>
    </div>

    <div style="width: 360px">
      <Carousel
        slides={[slideA, slideB, slideC]}
        value={carouselIdx}
        onChange={(i) => (carouselIdx = i)}
        height={160}
      />
    </div>
    <Text type="tertiary">当前轮播：{carouselIdx + 1}</Text>
  </Space>

  <Divider />

  <Title heading={5}>Tree</Title>
  <div style="display: flex; align-items: flex-start; gap: 48px; flex-wrap: wrap">
    <div style="width: 240px">
      <Text type="tertiary">单选 + 默认展开全部</Text>
      <Tree
        {treeData}
        defaultExpandAll
        value={treeSel}
        onChange={(info) => (treeSel = info.value as string | number)}
        ariaLabel="部门树"
      />
      <Text type="tertiary">已选：{treeSel}</Text>
    </div>

    <div style="width: 240px">
      <Text type="tertiary">可勾选（父子联动）+ 可搜索</Text>
      <Tree
        {treeData}
        checkable
        filterable
        defaultExpandAll
        checkedKeys={treeChecked}
        onCheck={(info) => (treeChecked = info.checked)}
        ariaLabel="可勾选部门树"
      />
      <Text type="tertiary">已勾选 {treeChecked.length} 项</Text>
    </div>
  </div>

  <Divider />

  <Title heading={5}>Table</Title>
  <Text type="tertiary">可排序（姓名/年龄）+ 行选择 + 分页（每页 5）</Text>
  <Table
    columns={tableColumns}
    dataSource={tableData}
    rowKey="key"
    bordered
    stripe
    pagination={{ pageSize: 5 }}
    rowSelection={{
      selectedRowKeys: tableSelected,
      onChange: (keys) => (tableSelected = keys),
    }}
  />
  <Text type="tertiary">已选 {tableSelected.length} 行</Text>

  <Divider />

  <Title heading={5}>Calendar（月视图）</Title>
  <Text type="tertiary">事件展示 + 6/10 当天溢出折叠 + 跨天事件</Text>
  <Calendar
    defaultValue={calAnchor}
    events={calEvents}
    maxEventsPerDay={3}
    onSelect={(info) => (calSelectedText = info.date.toLocaleDateString('zh-CN'))}
  />
  <Text type="tertiary">选中日期：{calSelectedText}</Text>

  <Divider />

  <Title heading={5}>ScrollList（滚轮选择）</Title>
  <Text type="tertiary">滚动 / 点击 / 方向键选择小时（03、04 禁用）</Text>
  <div style="width: 80px">
    <ScrollList
      data={hourData}
      defaultValue={9}
      ariaLabel="小时"
      onChange={(info) => (pickedHour = info.value)}
    />
  </div>
  <Text type="tertiary">选中小时：{pickedHour}</Text>

  <Divider />

  <Title heading={5}>OverflowList（溢出折叠）</Title>
  <Text type="tertiary">拖动滑块改变容器宽度，溢出标签自动收纳进 +N</Text>
  <input type="range" min="120" max="640" bind:value={overflowWidth} style="width: 320px; display: block" aria-label="容器宽度" />
  <div style="width: {overflowWidth}px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px">
    <OverflowList
      items={overflowTags}
      ariaLabel="部门标签"
      onOverflowChange={(info) => (overflowHidden = info.overflowCount)}
    >
      {#snippet item({ item })}
        <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
      {/snippet}
    </OverflowList>
  </div>
  <Text type="tertiary">容器宽 {overflowWidth}px，已折叠 {overflowHidden} 项</Text>

  <Divider />

  <Title heading={5}>Spin（加载指示器）</Title>
  <div style="display:flex; align-items:center; gap:48px; flex-wrap:wrap">
    <div>
      <Text type="tertiary">三尺寸 inline</Text>
      <div style="display:flex; align-items:center; gap:24px; margin-top:8px">
        <Spin size="small" />
        <Spin size="default" />
        <Spin size="large" />
      </div>
    </div>
    <div>
      <Text type="tertiary">带文案</Text>
      <div style="margin-top:8px"><Spin tip="加载中" /></div>
    </div>
  </div>

  <div style="margin-top:16px">
    <Button onclick={() => (spinWrap = !spinWrap)}>{spinWrap ? '停止' : '开始'}加载</Button>
    <div style="margin-top:8px; width:280px">
      <Spin spinning={spinWrap} tip="数据加载中">
        <div style="padding:24px; background:var(--cd-color-fill-0); border-radius:8px; line-height:1.8">
          这是被包裹的卡片内容。<br />加载时上方会覆盖半透明遮罩 + 居中指示器，内容不可交互。
        </div>
      </Spin>
    </div>
  </div>

  <Divider />

  <Title heading={5}>Progress（进度条）</Title>
  <input type="range" min="0" max="100" bind:value={progressPct} style="width:320px; display:block" aria-label="进度" />
  <div style="max-width:400px; margin-top:12px; display:flex; flex-direction:column; gap:12px">
    <Progress percent={progressPct} ariaLabel="普通进度" />
    <Progress percent={progressPct} status="success" ariaLabel="成功进度" />
    <Progress percent={progressPct} status="error" ariaLabel="失败进度" />
    <Progress percent={progressPct} size="small" ariaLabel="小尺寸进度" />
  </div>
  <div style="display:flex; gap:32px; align-items:center; margin-top:16px; flex-wrap:wrap">
    <Progress type="circle" percent={progressPct} ariaLabel="环形进度" />
    <Progress type="circle" percent={100} status="success" successWhenFull ariaLabel="完成环形" />
    <Progress type="dashboard" percent={progressPct} ariaLabel="仪表盘进度" />
    <Progress type="line" indeterminate ariaLabel="不确定进度" />
  </div>

  <Divider />

  <Title heading={5}>Skeleton（骨架屏）</Title>
  <div style="display:flex; gap:48px; flex-wrap:wrap; align-items:flex-start">
    <div>
      <Text type="tertiary">静态原子形状</Text>
      <div style="display:flex; gap:16px; align-items:center; margin-top:8px">
        <SkeletonAvatar />
        <SkeletonAvatar shape="square" size="large" />
        <SkeletonButton pill />
        <SkeletonImage width={120} height={80} />
      </div>
    </div>
  </div>

  <div style="margin-top:16px">
    <Button onclick={() => (skeletonLoading = !skeletonLoading)}>
      {skeletonLoading ? '加载完成' : '重新加载'}
    </Button>
    <div style="width:360px; margin-top:12px; padding:16px; border:1px solid var(--cd-color-border); border-radius:8px">
      <Skeleton loading={skeletonLoading} active>
        {#snippet placeholder()}
          <div style="display:flex; gap:16px">
            <SkeletonAvatar size="large" />
            <div style="flex:1">
              <SkeletonTitle width="50%" />
              <div style="margin-top:12px">
                <SkeletonParagraph rows={3} />
              </div>
            </div>
          </div>
        {/snippet}
        <div style="display:flex; gap:16px">
          <div style="width:40px; height:40px; border-radius:50%; background:var(--cd-color-primary); flex:0 0 auto"></div>
          <div>
            <strong>陈一</strong>
            <p style="margin:8px 0 0; color:var(--cd-color-text-1); line-height:1.6">
              这是加载完成后的真实内容。骨架屏在数据返回前占位，避免布局抖动。
            </p>
          </div>
        </div>
      </Skeleton>
    </div>
  </div>

  <Divider />

  <Title heading={5}>Banner（横幅）</Title>
  <div style="display:flex; flex-direction:column; gap:12px; max-width:640px">
    <Banner type="info" title="系统提示" description="这是一条信息横幅，用于展示当前页面的全局状态。" />
    <Banner type="success" title="保存成功" description="你的更改已成功保存。" />
    <Banner type="warning" fullMode={false} bordered title="存储空间不足" description="剩余空间不足 10%，请及时清理。" />
    <Banner type="danger" fullMode={false} bordered title="订阅已过期" description="高级功能已停用，续费后立即恢复。">
      {#snippet action({ close })}
        <Button type="primary" size="small" onclick={close}>立即续费</Button>
      {/snippet}
    </Banner>
  </div>

  <div style="margin-top:16px; max-width:640px">
    <Button onclick={() => (bannerOpen = true)} disabled={bannerOpen}>显示可关闭横幅</Button>
    <div style="margin-top:8px">
      <Banner
        type="info"
        open={bannerOpen}
        onOpenChange={(info) => (bannerOpen = info.open)}
        title="可关闭横幅"
        description="点击右侧关闭按钮收起，受控 open 状态。"
      />
    </div>
  </div>

  <Divider />

  <Title heading={5}>Modal（模态对话框）</Title>
  <div style="display:flex; gap:12px">
    <Button type="primary" onclick={() => (modalOpen = true)}>打开对话框</Button>
    <Button type="danger" onclick={() => (dangerModalOpen = true)}>删除确认</Button>
  </div>

  <Modal
    open={modalOpen}
    title="编辑资料"
    onOpenChange={(o) => (modalOpen = o)}
    onOk={() => (modalOpen = false)}
  >
    <p style="margin:0; line-height:1.8">
      这是模态对话框的内容区。打开时焦点被捕获在面板内，Tab 循环不逃逸；按 Esc 或点击遮罩可关闭；背景滚动被锁定。
    </p>
  </Modal>

  <Modal
    open={dangerModalOpen}
    title="删除项目"
    okType="danger"
    okText="删除"
    onOpenChange={(o) => (dangerModalOpen = o)}
    onOk={() => (dangerModalOpen = false)}
  >
    <p style="margin:0; line-height:1.8">
      确定删除此项目？此操作不可撤销，项目下的全部数据将被永久移除。
    </p>
  </Modal>

  <Divider />

  <Title heading={5}>Drawer（抽屉 / SideSheet）</Title>
  <div style="display:flex; gap:12px">
    <Button type="primary" onclick={() => (drawerRight = true)}>右侧抽屉</Button>
    <Button onclick={() => (drawerLeft = true)}>左侧抽屉</Button>
    <Button onclick={() => (drawerBottom = true)}>底部抽屉</Button>
  </div>

  <Drawer
    open={drawerRight}
    placement="right"
    title="编辑用户"
    onOpenChange={(o) => (drawerRight = o)}
  >
    <p style="margin:0; line-height:1.8">
      右侧抽屉从视口右边缘滑入，承载较长的编辑表单。按 Esc 或点击遮罩关闭，背景滚动被锁定，焦点被捕获在面板内。
    </p>
    {#snippet footer()}
      <Button onclick={() => (drawerRight = false)}>取消</Button>
      <Button type="primary" onclick={() => (drawerRight = false)}>保存</Button>
    {/snippet}
  </Drawer>

  <Drawer
    open={drawerLeft}
    placement="left"
    size="small"
    title="导航菜单"
    onOpenChange={(o) => (drawerLeft = o)}
  >
    <p style="margin:0; line-height:1.8">左侧小尺寸抽屉，常用于移动端导航菜单。</p>
  </Drawer>

  <Drawer
    open={drawerBottom}
    placement="bottom"
    title="筛选条件"
    onOpenChange={(o) => (drawerBottom = o)}
  >
    <p style="margin:0; line-height:1.8">底部抽屉从下方滑入，适合筛选面板等场景。</p>
  </Drawer>

  <Divider />

  <Title heading={5}>Popconfirm（气泡确认）</Title>
  <div style="display:flex; gap:24px; padding:40px 0">
    <Popconfirm
      type="danger"
      title="确定删除该项？"
      content="此操作无法撤销。"
      okText="删除"
      onConfirm={() => (popResult = '已删除')}
      onCancel={() => (popResult = '已取消')}
    >
      {#snippet trigger()}
        <Button type="danger">删除</Button>
      {/snippet}
    </Popconfirm>

    <Popconfirm
      placement="bottom"
      title="确定提交？"
      onConfirm={() => (popResult = '已提交')}
    >
      {#snippet trigger()}
        <Button type="primary">提交</Button>
      {/snippet}
    </Popconfirm>

    <Popconfirm
      type="warning"
      placement="right"
      title="退出登录？"
      content="退出后需重新登录。"
      onConfirm={() => (popResult = '已退出')}
    >
      {#snippet trigger()}
        <Button>退出</Button>
      {/snippet}
    </Popconfirm>
  </div>
  <Text type="tertiary">操作结果：{popResult}</Text>

  <Divider />

  <Title heading={5}>Toast（轻提示 · 命令式）</Title>
  <div style="display:flex; gap:12px; flex-wrap:wrap">
    <Button onclick={() => Toast.info('这是一条信息提示')}>info</Button>
    <Button type="primary" onclick={() => Toast.success('已保存草稿')}>success</Button>
    <Button type="warning" onclick={() => Toast.warning('存储空间不足')}>warning</Button>
    <Button type="danger" onclick={() => Toast.error('网络异常，请重试')}>error</Button>
    <Button onclick={() => Toast.loading('正在上传…', { duration: 0 })}>loading（常驻）</Button>
    <Button onclick={() => Toast.destroyAll()}>清空全部</Button>
  </div>

  <Divider />

  <Title heading={5}>Notification（通知提醒框 · 命令式）</Title>
  <div style="display:flex; gap:12px; flex-wrap:wrap">
    <Button type="primary" onclick={() => notification.success({ title: '上传完成', content: '文件已成功保存到云端。' })}>success（右上）</Button>
    <Button onclick={() => notification.info({ title: '新消息', content: '你有一条新的待办事项。', placement: 'topLeft' })}>info（左上）</Button>
    <Button type="warning" onclick={() => notification.warning({ title: '存储空间不足', content: '剩余空间不足 10%。', placement: 'bottomRight' })}>warning（右下）</Button>
    <Button type="danger" onclick={() => notification.error({ title: '保存失败', content: '网络中断，未保存的更改已暂存本地。', duration: 0 })}>error（常驻）</Button>
    <Button onclick={() => notification.destroyAll()}>清空全部</Button>
  </div>

  <Divider />

  <Title heading={5}>LocaleProvider（语言上下文 · renderless）</Title>
  <Button onclick={() => (localeIsZh = !localeIsZh)}>切换语言：{localeIsZh ? '中文' : 'English'}</Button>
  <div style="margin-top:8px">
    <LocaleProvider locale={localeIsZh ? zh_CN : en_US}>
      {#snippet children({ locale, t, formatNumber, direction })}
        <div style="line-height:2">
          <div>生效 locale：<strong>{locale}</strong>（方向 {direction}）</div>
          <div>Modal.okText：<strong>{t('Modal.okText')}</strong> / Modal.cancelText：<strong>{t('Modal.cancelText')}</strong></div>
          <div>Pagination.total：<strong>{t('Pagination.total', { total: 1234 })}</strong></div>
          <div>格式化数字 1234567.89：<strong>{formatNumber(1234567.89)}</strong></div>
        </div>
      {/snippet}
    </LocaleProvider>
  </div>

  <div style="margin-top:16px" data-testid="i18n-consumer-demo">
    <Text type="tertiary">下列组件被同一 LocaleProvider 包裹，其内部文案应随上方语言切换：</Text>
    <LocaleProvider locale={localeIsZh ? zh_CN : en_US}>
      <div style="margin-top:8px; max-width:420px">
        <Empty />
        <div style="margin-top:8px">
          <Pagination total={1234} showTotal currentPage={1} pageSize={10} />
        </div>
      </div>
    </LocaleProvider>
  </div>

  <Divider />

  <Title heading={5}>ConfigProvider（全局配置 · 局部暗色作用域）</Title>
  <Text type="tertiary">用 ConfigProvider wrap + theme=dark 在子树内建立独立暗色作用域</Text>
  <ConfigProvider wrap theme="dark">
    <div style="margin-top:8px; padding:24px; border-radius:8px; background:var(--cd-color-bg-0); color:var(--cd-color-text-0)">
      <p style="margin:0 0 12px; line-height:1.8">
        这个区块被 ConfigProvider theme="dark" 包裹，内部所有 <code>var(--cd-color-*)</code> 自动切换为暗色调色板。
      </p>
      <div style="display:flex; gap:12px">
        <Button type="primary">主要按钮</Button>
        <Button>次要按钮</Button>
        <Tag color="success">标签</Tag>
      </div>
    </div>
  </ConfigProvider>

  <Divider />

  <Title heading={5}>ResizeObserver（尺寸监听 · renderless）</Title>
  <Text type="tertiary">拖拽右下角调整容器大小，slot 实时显示尺寸</Text>
  <div style="margin-top:8px; resize:both; overflow:auto; width:280px; height:120px; min-width:160px; min-height:80px; border:1px dashed var(--cd-color-border); border-radius:8px">
    <ResizeObserver>
      {#snippet children({ width, height })}
        <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--cd-color-text-1)">
          {Math.round(width)} × {Math.round(height)} px
        </div>
      {/snippet}
    </ResizeObserver>
  </div>

  <Divider />

  <Title heading={5}>LottieIcon（动画图标 · 依赖注入 player）</Title>
  <Text type="tertiary">库不绑定 lottie-web，用户注入 player 工厂；此处用 mock player 演示</Text>
  <div style="display:flex; gap:32px; align-items:center; margin-top:8px">
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" decorative={false} label="自动播放" />
      <Text type="tertiary">auto（自动播放）</Text>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" trigger="hover" decorative={false} label="悬停播放" />
      <Text type="tertiary">hover（悬停播放）</Text>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" reducedMotion decorative={false} label="降级静止" />
      <Text type="tertiary">reducedMotion（静止）</Text>
    </div>
  </div>
</main>

<BackTop visibilityHeight={300} />

{#snippet slideA()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-primary);color:#fff;font-size:20px">幻灯片 1</div>
{/snippet}
{#snippet slideB()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-success);color:#fff;font-size:20px">幻灯片 2</div>
{/snippet}
{#snippet slideC()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-warning);color:#fff;font-size:20px">幻灯片 3</div>
{/snippet}

<style>
  @keyframes -global-cd-demo-spin {
    to {
      transform: rotate(360deg);
    }
  }
  .demo-cell {
    background: var(--cd-color-primary);
    color: var(--cd-color-text-inverse);
    text-align: center;
    padding: var(--cd-spacing-2);
    border-radius: var(--cd-radius-1);
    font-size: var(--cd-font-size-1);
  }
  .demo-layout {
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-2);
    overflow: hidden;
    height: 220px;
  }
  .demo-sider-body {
    padding: var(--cd-spacing-3);
    color: var(--cd-color-text-1);
  }
  .demo-bar {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-3);
    padding-inline: var(--cd-spacing-3);
    height: 100%;
  }
</style>
