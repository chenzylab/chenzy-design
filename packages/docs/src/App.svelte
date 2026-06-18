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
  } from '@chenzy-design/svelte';

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
</main>

<style>
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
