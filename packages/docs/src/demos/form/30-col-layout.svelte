<script lang="ts">
  // wrapperCol / labelCol：Form 上统一设置 wrapperCol、labelCol 后，每个 Field
  // 自动改走 24 栏 Grid 布局（Col span/offset），无需手动用 Row/Col 摆放。
  // 严格对齐 Semi「wrapperCol / labelCol」demo。
  import { Form } from '@chenzy-design/svelte';

  const roleOptions = [
    { label: '运营', value: 'operate' },
    { label: '开发', value: 'rd' },
    { label: '产品', value: 'pm' },
    { label: '设计', value: 'ued' },
  ];
</script>

<Form wrapperCol={{ span: 20 }} labelCol={{ span: 2 }} labelPosition="left" labelAlign="right">
  <Form.Input field="name" style="width: 250px" label="姓名" trigger="blur" placeholder="请输入姓名" />
  <Form.Select field="role" label="角色" placeholder="请选择角色" style="width: 250px" optionList={roleOptions} />
</Form>
