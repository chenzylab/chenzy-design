<script lang="ts">
  // 已支持的表单控件全家福：Input / InputNumber / Select / DatePicker / TimePicker /
  // TreeSelect / Cascader / TagInput / TextArea / CheckboxGroup / RadioGroup / Slider /
  // Rating / Switch / Upload，均从 Form 导出后自动接管数据流。严格对齐 Semi「已支持的
  // 表单控件」demo：Row/Col 双列布局、initValues、rules、extraText 自定义节点逐条复刻。
  import { Form, Button, Space, Radio, Row, Col } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';

  const treeData = [
    {
      label: '亚洲',
      value: 'Asia',
      key: '0',
      children: [
        {
          label: '中国',
          value: 'China',
          key: '0-0',
          children: [
            { label: '北京', value: 'Beijing', key: '0-0-0' },
            { label: '上海', value: 'Shanghai', key: '0-0-1' },
          ],
        },
      ],
    },
    { label: '北美洲', value: 'North America', key: '1' },
  ];

  const initValues = {
    name: 'semi',
    business: ['ulikeCam'],
    role: 'ued',
    switch: true,
    files: [
      {
        uid: '1',
        name: 'vigo.png',
        status: 'success' as const,
        // 本库 FileItem.size 为原始字节数（对齐组件自身契约，非 Semi 的格式化字符串）。
        size: 130 * 1024,
      },
      {
        uid: '2',
        name: 'resso.jpeg',
        status: 'validateFail' as const,
        size: 222 * 1024,
        percent: 50,
      },
      {
        uid: '3',
        name: 'douyin.jpeg',
        status: 'uploading' as const,
        size: 222 * 1024,
        percent: 50,
      },
    ],
  };
</script>

<Form {initValues} style="padding: 10px; width: 100%" onValueChange={(v) => console.log(v)}>
  <Form.Section text="基本信息">
    <Row>
      <Col span={12}>
        <Form.Input field="name" label="名称（Input）" initValue="mikeya" style="width: 90%" trigger="blur" />
      </Col>
      <Col span={12}>
        <Form.DatePicker field="date" label="日期（DatePicker）" style="width: 90%" initValue={new Date()} placeholder="请选择生效日期" />
      </Col>
    </Row>
    <Row>
      <Col span={12}>
        <Form.Select
          field="role"
          label="角色（Select）"
          style="width: 90%"
          placeholder="请选择你的角色"
          optionList={[
            { label: '运营', value: 'operate' },
            { label: '开发', value: 'rd' },
            { label: '产品', value: 'pm' },
            { label: '设计', value: 'ued' },
          ]}
        />
      </Col>
      <Col span={12}>
        <Form.Select
          field="business"
          label="业务线（多选Select）"
          multiple
          style="width: 90%"
          placeholder="请选择业务线"
          extraText={businessExtra}
          optionList={[
            { label: 'Semi', value: 'abc' },
            { label: '轻颜相机', value: 'ulikeCam' },
            { label: '今日头条', value: 'toutiao' },
          ]}
        />
      </Col>
    </Row>
    <Row>
      <Col span={12}>
        <Form.Cascader field="area" label="地区（Cascader）" style="width: 90%" placeholder="请选择所在地区" {treeData} />
      </Col>
      <Col span={12}>
        <Form.TreeSelect field="tree" label="节点（TreeSelect）" style="width: 90%" placeholder="请选择服务节点" {treeData} filterTreeNode />
      </Col>
    </Row>
    <Row>
      <Col span={12}>
        <Form.TagInput field="product" label="产品（TagInput）" initValue={['abc', 'ulikeCam']} placeholder="请输入产品" style="width: 90%" />
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Form.Upload field="files" label="证明文件（Upload）" action="//semi.design/api/upload">
          {#snippet children()}
            <Button icon={uploadIcon} theme="light">点击上传</Button>
          {/snippet}
        </Form.Upload>
      </Col>
    </Row>
  </Form.Section>
  <Form.Section text="资源详情">
    <Row>
      <Col span={12}>
        <Form.TextArea field="description" label="申请理由（TextArea）" placeholder="请填写申请资源理由" style="width: 90%; height: 120px" />
      </Col>
      <Col span={12}>
        <Form.CheckboxGroup
          field="type"
          label="申请类型（CheckboxGroup）"
          direction="horizontal"
          initValue={['user', 'admin']}
          rules={[{ required: true }]}
          options={[
            { label: 'admin', value: 'admin' },
            { label: 'user', value: 'user' },
            { label: 'guest', value: 'guest' },
            { label: 'root', value: 'root' },
          ]}
        />
        <Form.RadioGroup
          field="isMonopolize"
          label="是否独占资源（Radio）"
          rules={[{ type: 'boolean' }, { required: true, message: '必须选择是否独占 ' }]}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </Form.RadioGroup>
      </Col>
    </Row>
    <Row>
      <Col span={12}>
        <Form.TimePicker field="time" label="截止时刻（TimePicker）" style="width: 90%" />
      </Col>
      <Col span={12}>
        <Form.InputNumber field="number" label="申请数量（InputNumber）" initValue={20} style="width: 90%" />
      </Col>
    </Row>
    <Row>
      <Col span={12}>
        <Form.Slider field="range" label="资源使用报警阈值(%)（Slider）" initValue={10} style="width: 90%" />
      </Col>
      <Col span={12}>
        <Form.Switch field="switch" label="开关(Switch)" />
      </Col>
    </Row>
    <Row>
      <Col span={12}>
        <Form.Rating field="rating" label="满意度(Rating)" initValue={2} style="width: 90%" />
      </Col>
    </Row>
  </Form.Section>
  <Form.Checkbox field="agree" noLabel>我已阅读并清楚相关规定（Checkbox）</Form.Checkbox>
  {#snippet footer()}
    <Space>
      <Button type="primary" htmlType="submit">提交(submit)</Button>
      <Button htmlType="reset">重置(reset)</Button>
    </Space>
  {/snippet}
</Form>

{#snippet uploadIcon()}<IconUpload />{/snippet}
{#snippet businessExtra()}
  <div style="color: var(--cd-color-primary); font-size: 14px; user-select: none; cursor: pointer">
    没有找到合适的业务线？
  </div>
{/snippet}
