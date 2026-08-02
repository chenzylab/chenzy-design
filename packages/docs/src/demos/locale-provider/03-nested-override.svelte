<script lang="ts">
  // 严格复刻 Semi「支持多语言的组件」demo：顶部 Select 切换语言，
  // 下方逐个展示带内置文案的组件，验证切换后全部同步。
  // 本库语言包只有 zh_CN / en_US（Semi 57 个），故切换项为两档。
  //
  // Semi 该 demo 外层还套了 ConfigProvider（为阿拉伯语切 direction='rtl'）；
  // 本库暂无 RTL 语言包，故只用 LocaleProvider。
  import {
    LocaleProvider,
    zh_CN,
    en_US,
    Select,
    Pagination,
    Modal,
    Button,
    Cascader,
    DatePicker,
    TimePicker,
    TreeSelect,
    Table,
    List,
    Calendar,
    Paragraph,
    Transfer,
    Form,
    FormInput,
    Nav,
    type Locale,
  } from '@chenzy-design/svelte';
  import type { ColumnDef } from '@chenzy-design/svelte/table';

  let localeCode = $state<'zh_CN' | 'en_US'>('zh_CN');
  const locale = $derived<Locale>(localeCode === 'zh_CN' ? zh_CN : en_US);

  let modalVisible = $state(false);

  const style = 'margin: 10px';

  const treeData = [
    {
      label: 'Asia',
      value: 'asia',
      key: '1',
      children: [
        {
          label: 'China',
          value: 'china',
          key: '1-0',
          children: [
            { label: 'Beijing', value: 'beijing', key: '1-0-0' },
            { label: 'Shanghai', value: 'shanghai', key: '1-0-1' },
          ],
        },
        {
          label: 'Japan',
          value: 'japan',
          key: '1-1',
          children: [{ label: 'Osaka', value: 'osaka', key: '1-1-0' }],
        },
      ],
    },
  ];

  // Table 的泛型约束是 `T extends Record<string, unknown>`，故补索引签名。
  interface Row extends Record<string, unknown> {
    key: string;
    name: string;
    age: number;
    address: string;
  }
  const columns: ColumnDef<Row>[] = [
    { title: 'Name', width: 250, dataIndex: 'name' },
    { title: 'Age', width: 150, dataIndex: 'age' },
    { title: 'Address', dataIndex: 'address' },
  ];
  const dataSource: Row[] = Array.from({ length: 46 }, (_v, i) => ({
    key: String(i),
    name: `Bytedance ${i}`,
    age: 32,
    address: `Beijing, Haidian. Zhichun Road ${i}`,
  }));
  const transferData = Array.from({ length: 100 }, (_v, i) => ({
    label: `选项名称 ${i}`,
    value: i,
    disabled: false,
    key: i,
  }));
</script>

<div style="border-bottom: 1px solid var(--cd-color-border); padding-bottom: 20px">
  <Select
    prefix="切换语言"
    style="width: 250px"
    value={localeCode}
    optionList={[
      { value: 'zh_CN', label: '简体中文' },
      { value: 'en_US', label: '英语（美）' },
    ]}
    onChange={(v) => (localeCode = v as 'zh_CN' | 'en_US')}
  />
</div>

<LocaleProvider {locale}>
  <h5>Pagination</h5>
  <Pagination total={100} showTotal showSizeChanger {style} showQuickJumper />

  <h5>Modal</h5>
  <div {style}>
    <Button onclick={() => (modalVisible = true)}>Show Modal</Button>
    <Modal
      title="Modal"
      visible={modalVisible}
      onOk={() => (modalVisible = false)}
      onCancel={() => (modalVisible = false)}
    >
      <p>This is the content of a basic modal.</p>
      <p>More content...</p>
    </Modal>
  </div>

  <h5>Select &amp; Cascader</h5>
  <div {style}>
    <Select
      filter
      style="width: 180px"
      optionList={[
        { value: 'abc', label: 'abc' },
        { value: 'vigo', label: 'vigo', disabled: true },
        { value: 'hotsoon', label: 'hotsoon' },
      ]}
    />
    <Cascader style="width: 300px; margin: 10px" {treeData} filterTreeNode prefix="Cascader" />
  </div>

  <h5>DatePicker</h5>
  <DatePicker style="{style}; width: 250px" />
  <DatePicker style="{style}; width: 300px" type="dateTime" />
  <DatePicker style="{style}; width: 300px" type="dateRange" />
  <DatePicker style="{style}; width: 450px" type="dateTimeRange" />

  <h5>TimePicker</h5>
  <TimePicker {style} />
  <TimePicker use12Hours {style} /><br /><br />

  <h5>TreeSelect</h5>
  <TreeSelect
    style="{style}; width: 300px"
    dropdownStyle="max-height: 400px; overflow: auto"
    {treeData}
    filterTreeNode
  />

  <h5>Table</h5>
  <Table {columns} {dataSource} scroll={{ y: 320 }} />

  <h5>Table - Empty</h5>
  <Table {columns} dataSource={[]} scroll={{ y: 320 }} />

  <h5>List - Empty</h5>
  <List header="List" dataSource={[]} />

  <h5>Calendar</h5>
  <Calendar mode="month" />

  <h5>Typography - Copyable</h5>
  <Paragraph copyable>Click to copy text.</Paragraph>

  <h5>Typography - Collapsible</h5>
  <Paragraph ellipsis={{ rows: 3, expandable: true, collapsible: true }} style="width: 300px">
    支持展开和折叠：chenzy-design 的设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的
    Web 应用。
  </Paragraph>

  <h5>Transfer</h5>
  <Transfer style="width: 568px; height: 416px" dataSource={transferData} />

  <h5>Form</h5>
  <Form layout="horizontal" onValueChange={(values) => console.log(values)}>
    <FormInput field="UserName" label={{ text: '角色', optional: true }} style="width: 200px" />
  </Form>

  <h5>Navigation</h5>
  <Nav
    bodyStyle="height: 320px"
    items={[
      { itemKey: 'user', text: '用户管理' },
      { itemKey: 'union', text: '活动管理' },
    ]}
    header={{ text: 'chenzy 数据后台' }}
    footer={{ collapseButton: true }}
  />
</LocaleProvider>
