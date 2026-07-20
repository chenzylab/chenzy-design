<script lang="ts">
  // 已支持的表单控件全家福：Input / InputNumber / Select / DatePicker / TimePicker /
  // TreeSelect / Cascader / TagInput / TextArea / CheckboxGroup / RadioGroup / Slider /
  // Rating / Switch，均从 Form 导出后自动接管数据流。对齐 Semi「已支持的表单控件」。
  import { Form, Button, Space, Radio } from '@chenzy-design/svelte';

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
    role: 'ued',
    switch: true,
    business: ['ulikeCam'],
  };
</script>

<Form {initValues} style="width: 100%" onValueChange={(v) => console.log(v)}>
  <Form.Section text="基本信息">
    <Form.Input field="name" label="名称（Input）" trigger="blur" />
    <Form.DatePicker field="date" label="日期（DatePicker）" />
    <Form.Select
      field="role"
      label="角色（Select）"
      placeholder="请选择你的角色"
      optionList={[
        { label: '运营', value: 'operate' },
        { label: '开发', value: 'rd' },
        { label: '产品', value: 'pm' },
        { label: '设计', value: 'ued' },
      ]}
    />
    <Form.Select
      field="business"
      label="业务线（多选 Select）"
      multiple
      placeholder="请选择业务线"
      optionList={[
        { label: 'Semi', value: 'abc' },
        { label: '轻颜相机', value: 'ulikeCam' },
        { label: '今日头条', value: 'toutiao' },
      ]}
    />
    <Form.TreeSelect
      field="tree"
      label="节点（TreeSelect）"
      placeholder="请选择服务节点"
      {treeData}
    />
    <Form.Cascader
      field="area"
      label="地区（Cascader）"
      placeholder="请选择所在地区"
      {treeData}
    />
    <Form.TagInput field="product" label="产品（TagInput）" placeholder="请输入产品" />
  </Form.Section>
  <Form.Section text="资源详情">
    <Form.TextArea field="description" label="申请理由（TextArea）" placeholder="请填写申请理由" />
    <Form.CheckboxGroup
      field="type"
      label="申请类型（CheckboxGroup）"
      direction="horizontal"
      initValue={['user']}
      optionList={[
        { label: 'admin', value: 'admin' },
        { label: 'user', value: 'user' },
        { label: 'guest', value: 'guest' },
      ]}
    />
    <Form.RadioGroup field="isMonopolize" label="是否独占资源（RadioGroup）">
      <Radio value={1}>是</Radio>
      <Radio value={0}>否</Radio>
    </Form.RadioGroup>
    <Form.TimePicker field="time" label="截止时刻（TimePicker）" />
    <Form.InputNumber field="number" label="申请数量（InputNumber）" initValue={20} />
    <Form.Slider field="range" label="报警阈值(%)（Slider）" initValue={10} />
    <Form.Switch field="switch" label="开关（Switch）" />
    <Form.Rating field="rating" label="满意度（Rating）" initValue={2} />
  </Form.Section>
  <Form.Checkbox field="agree" noLabel>我已阅读并清楚相关规定（Checkbox）</Form.Checkbox>
  {#snippet footer()}
    <Space>
      <Button type="primary" htmlType="submit">提交</Button>
      <Button htmlType="reset">重置</Button>
    </Space>
  {/snippet}
</Form>
