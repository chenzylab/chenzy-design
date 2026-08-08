<script lang="ts">
  // 严格复刻 Semi「RTL/LTR」demo：ButtonGroup 切 direction，下方五段
  // （Buttons / Input / Navigation / Display / Feedback）整体镜像。
  // React→Svelte 映射：Steps.Step / Timeline.Item / Breadcrumb.Item 用本库同名子组件；
  // icon 由 ReactNode 改 Snippet；Notification/Toast/Modal 的命令式调用需自行传 direction
  // （对齐 Semi 注意事项：命令式浮层不在 context 子树内）。
  import {
    ConfigProvider,
    ButtonGroup,
    Button,
    Row,
    Col,
    notification,
    Toast,
    modal,
    DatePicker,
    TimePicker,
    Timeline,
    TimelineItem,
    Popover,
    Tag,
    Tooltip,
    Badge,
    Avatar,
    Steps,
    Pagination,
    Breadcrumb,
    BreadcrumbItem,
    Rating,
    Nav,
    Spin,
    Cascader,
    Radio,
    Select,
    Input,
    TextArea,
    Checkbox,
    Switch,
    Text,
  } from '@chenzy-design/svelte';
  import {
    IconVigoLogo,
    IconEdit,
    IconCamera,
    IconList,
    IconSidebar,
    IconChevronDown,
  } from '@chenzy-design/icons';

  let direction = $state<'ltr' | 'rtl' | undefined>(undefined);

  const flexStyle = 'display: flex; margin-bottom: 32px; flex-wrap: wrap';
  const titleStyle = 'margin: 50px 0 16px 0';
  const rowStyle = 'margin: 16px 10px';
  const badgeStyle = 'width: 42px; height: 42px; border-radius: 4px; display: inline-block';
  const tagStyle = 'margin-right: 8px; margin-bottom: 8px';

  const opts = $derived({
    title: 'Hi,Bytedance',
    content: 'ies dance dance dance',
    duration: 3,
    direction,
  });

  const treeData = [
    {
      label: '浙江省',
      value: 'zhejiang',
      children: [
        {
          label: '杭州市',
          value: 'hangzhou',
          children: [
            { label: '西湖区', value: 'xihu' },
            { label: '萧山区', value: 'xiaoshan' },
            { label: '临安区', value: 'linan' },
          ],
        },
        {
          label: '宁波市',
          value: 'ningbo',
          children: [
            { label: '海曙区', value: 'haishu' },
            { label: '江北区', value: 'jiangbei' },
          ],
        },
      ],
    },
  ];

  const douyinOptions = [
    { value: 'abc', label: '抖音' },
    { value: 'hotsoon', label: '火山' },
    { value: 'pipixia', label: '皮皮虾', disabled: true },
    { value: 'xigua', label: '西瓜视频' },
  ];

  const navItems = [
    { itemKey: 'user', text: 'Option1', icon: iconEdit },
    { itemKey: 'union', text: 'Option2', icon: iconCamera },
    {
      itemKey: 'approve-management',
      text: 'Group3',
      icon: iconList,
      items: ['3-1', '3-2'],
    },
  ];
</script>

{#snippet iconEdit()}<IconEdit />{/snippet}
{#snippet iconCamera()}<IconCamera />{/snippet}
{#snippet iconList()}<IconList />{/snippet}
{#snippet iconSidebar()}<IconSidebar />{/snippet}
{#snippet iconChevronDown()}<IconChevronDown />{/snippet}
{#snippet iconVigo()}<IconVigoLogo />{/snippet}

<div>
  <div style="margin-bottom: 20px">
    <ButtonGroup>
      <Button onclick={() => (direction = 'ltr')}>LTR</Button>
      <Button onclick={() => (direction = 'rtl')}>RTL</Button>
    </ButtonGroup>
  </div>
  <ConfigProvider {direction}>
    <Row><h3 style={titleStyle}>Buttons</h3></Row>
    <Row style={rowStyle}>
      <Button loading={true} theme="solid" style="margin-right: 8px">加载</Button>
      <Button icon={iconSidebar} theme="solid" style="margin-right: 8px">收起</Button>
      <Button icon={iconChevronDown} theme="solid" iconPosition="right" style="margin-right: 8px">
        展开选项
      </Button>
      <br /><br />
      <ButtonGroup>
        <Button>拷贝</Button>
        <Button>查询</Button>
        <Button>剪切</Button>
      </ButtonGroup>
    </Row>

    <Row><h3 style={titleStyle}>Input</h3></Row>
    <Row style={rowStyle} gutter={16}>
      <Col span={12}>
        <Input placeholder="输入框" />
        <br /><br />
        <Input disabled placeholder="输入框" />
        <br /><br />
        <Input prefix="Prefix" showClear />
        <br /><br />
        <Input suffix={suffixText} showClear />
        <br /><br />
        <TextArea placeholder="文本框" maxCount={100} />
        <br /><br />
        <div style={flexStyle}>
          <Switch style="margin-right: 8px" defaultChecked={true} />
          <Switch style="margin-right: 8px" />
          <Switch disabled defaultChecked={true} style="margin-right: 8px" />
        </div>
        <div style={flexStyle}>
          <Checkbox style="margin-right: 8px" defaultChecked>多选框</Checkbox>
          <Checkbox style="margin-right: 8px" disabled defaultChecked>禁用的多选框</Checkbox>
          <Checkbox style="margin-right: 8px">禁用的多选框</Checkbox>
        </div>
        <div style="{flexStyle}; margin-bottom: 0">
          <Radio style="margin-right: 8px" defaultChecked>单选框</Radio>
          <Radio style="margin-right: 8px" disabled defaultChecked>禁用的单选框</Radio>
          <Radio style="margin-right: 8px">禁用的单选框</Radio>
        </div>
      </Col>
      <Col span={12}>
        <DatePicker onChange={(_date, dateString) => console.log(dateString)} style="width: 100%" />
        <br /><br />
        <TimePicker style="width: 100%" />
        <br /><br />
        <Select style="width: 100%" placeholder="选择器-单选" optionList={douyinOptions} />
        <br /><br />
        <Select disabled style="width: 100%" placeholder="选择器-禁用" optionList={douyinOptions} />
        <br /><br />
        <Select multiple style="width: 100%" placeholder="选择器-多选" optionList={douyinOptions} />
        <br /><br />
        <Cascader style="width: 100%" {treeData} placeholder="级联选择器" />
      </Col>
    </Row>

    <Row><h3 style={titleStyle}>Navigation</h3></Row>
    <Row style={rowStyle}>
      <Breadcrumb>
        <BreadcrumbItem>Semi-ui</BreadcrumbItem>
        <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
        <BreadcrumbItem>Default</BreadcrumbItem>
      </Breadcrumb>
      <Nav mode="horizontal" items={navItems} />
      <br /><br />
      <Pagination total={80} showSizeChanger />
      <br />
      <Steps current={1}>
        <Steps.Step title="Finished" description="This is a description." />
        <Steps.Step title="In Progress" description="This is a description." />
        <Steps.Step title="Waiting" description="This is a description." />
      </Steps>
      <br />
      <Steps current={1} status="error">
        <Steps.Step title="Finished" description="This is a description" />
        <Steps.Step title="In Process" description="This is a description" />
        <Steps.Step title="Waiting" description="This is a description" />
      </Steps>
    </Row>

    <Row><h3 style={titleStyle}>Display</h3></Row>
    <Row style={rowStyle}>
      <div style="display: flex">
        <div style="padding: 8px">
          <Badge count={5} theme="solid">
            <Avatar color="blue" shape="square" style={badgeStyle}>XZ</Avatar>
          </Badge>
        </div>
        <div style="padding: 8px">
          <Badge count={5} theme="light">
            <Avatar color="cyan" shape="square" style={badgeStyle}>YB</Avatar>
          </Badge>
        </div>
        <div style="padding: 8px">
          <Badge count={5} theme="inverted">
            <Avatar color="indigo" shape="square" style={badgeStyle}>LX</Avatar>
          </Badge>
        </div>
        <div style="padding: 8px">
          <Badge dot theme="solid">
            <Avatar color="light-blue" shape="square" style={badgeStyle}>YZ</Avatar>
          </Badge>
        </div>
        <div style="padding: 8px">
          <Badge dot theme="light">
            <Avatar color="teal" shape="square" style={badgeStyle}>HW</Avatar>
          </Badge>
        </div>
        <div style="padding: 8px; border-radius: 4px; background-color: var(--cd-color-fill-0)">
          <Badge dot theme="inverted">
            <Avatar color="green" shape="square" style={badgeStyle}>XM</Avatar>
          </Badge>
        </div>
      </div>
      <br />
      <div>
        <Tag color="grey" style={tagStyle}>grey tag</Tag>
        <Tag color="blue" style={tagStyle}>blue tag</Tag>
        <Tag color="blue" type="ghost" style={tagStyle}>ghost tag</Tag>
        <Tag color="blue" type="solid" style={tagStyle}>solid tag</Tag>
        <Tag color="red" style={tagStyle}>red tag</Tag>
        <Tag color="green" style={tagStyle}>green tag</Tag>
        <Tag color="orange" style={tagStyle}>orange tag</Tag>
        <Tag color="teal" style={tagStyle}>teal tag</Tag>
        <Tag color="violet" style={tagStyle}>violet tag</Tag>
        <Tag color="white" style={tagStyle}>white tag</Tag>
      </div>
      <br />
      <div style="display: flex; align-items: center">
        <Popover content="hi semi-design" style="padding: 8px">
          <Tag style="margin-right: 8px">I am Popover</Tag>
        </Popover>
        <Tooltip content="hi semi-design">
          <Tag style="margin-right: 8px">I am Tooltip</Tag>
        </Tooltip>
        <Rating defaultValue={3} size="small" style="margin-right: 8px" />
      </div>
      <br />
      <Timeline>
        <TimelineItem time="2019-07-14 10:35" type="ongoing">审核中</TimelineItem>
        <TimelineItem time="2019-06-13 16:17" type="success">发布成功</TimelineItem>
        <TimelineItem time="2019-05-14 18:34" type="error">审核失败</TimelineItem>
      </Timeline>
    </Row>

    <Row><h3 style={titleStyle}>Feedback</h3></Row>
    <Row style={rowStyle}>
      <Button type="primary" onclick={() => notification.success(opts)} style={tagStyle}>
        成功信息的通知
      </Button>
      <Button onclick={() => notification.info(opts)} style={tagStyle}>提示信息的通知</Button>
      <Button type="warning" onclick={() => notification.warning(opts)} style={tagStyle}>
        警告信息的通知
      </Button>
      <Button type="danger" onclick={() => notification.error(opts)} style={tagStyle}>
        失败信息的通知
      </Button>
      <Button style={tagStyle} icon={iconVigo} onclick={() => notification.info({ ...opts, icon: iconVigo })} />
      <br />
      <Button type="primary" onclick={() => modal.success(opts)} style={tagStyle}>成功信息的弹窗</Button>
      <Button onclick={() => modal.info(opts)} style={tagStyle}>提示信息的弹窗</Button>
      <Button type="warning" onclick={() => modal.warning(opts)} style={tagStyle}>警告信息的弹窗</Button>
      <Button type="danger" onclick={() => modal.error(opts)} style={tagStyle}>失败信息的弹窗</Button>
      <br />
      <Button type="primary" onclick={() => Toast.success(opts)} style={tagStyle}>成功信息的提示</Button>
      <Button onclick={() => Toast.info(opts)} style={tagStyle}>提示信息的提示</Button>
      <Button type="warning" onclick={() => Toast.warning(opts)} style={tagStyle}>警告信息的提示</Button>
      <Button type="danger" onclick={() => Toast.error(opts)} style={tagStyle}>失败信息的提示</Button>
      <br /><br />
      <Spin tip="I am loading...">
        <div
          style="background-color: var(--cd-color-primary-light-default); border: 1px solid var(--cd-color-primary); border-radius: 4px; padding: 16px 10px"
        >
          <p>Here are some texts.</p>
          <p>And more texts on the way.</p>
        </div>
      </Spin>
    </Row>
  </ConfigProvider>
</div>

{#snippet suffixText()}
  <Text strong type="secondary" style="margin: 0 8px">Suffix</Text>
{/snippet}
