<script lang="ts">
  // 内嵌 Label：labelPosition='inset' 把 Label 内嵌在控件内部左侧。
  // 支持该功能的控件：Input / InputNumber / DatePicker / TimePicker / Select /
  // TreeSelect / Cascader / TagInput。对齐 Semi「内嵌 Label」。
  import { Form } from '@chenzy-design/svelte';
</script>

<Form labelPosition="inset" layout="horizontal">
  <Form.Input field="name" label="姓名" trigger="blur" style="width: 250px" placeholder="请输入姓名" initValue="semi" />
  <Form.Select
    field="role"
    label="角色"
    style="width: 250px"
    initValue="rd"
    optionList={[
      { label: '运营', value: 'operate' },
      { label: '开发', value: 'rd' },
      { label: '产品', value: 'pm' },
      { label: '设计', value: 'ued' },
    ]}
  />
  <Form.DatePicker field="date" label="开始日期" style="width: 250px" />
</Form>
