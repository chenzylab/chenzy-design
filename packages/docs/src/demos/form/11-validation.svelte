<script lang="ts">
  // 配置初始值与校验规则：initValues 统一设初始值，rules 声明校验规则（基于 async-validator）；
  // stopValidateWithError 命中首条错误即停止后续 rule。对齐 Semi「配置初始值与校验规则」。
  import { Form, Button } from '@chenzy-design/svelte';

  const initValues = { name: 'semi', shortcut: 'se' };
</script>

<Form {initValues} style="width: 400px">
  <Form.Input
    field="name"
    label="名称"
    trigger="blur"
    rules={[
      { required: true, message: 'required error' },
      { validator: (v) => (v === 'semi' ? undefined : 'should be semi') },
      { validator: (v) => (typeof v === 'string' && v.startsWith('se') ? undefined : 'should startsWith se') },
    ]}
  />
  <Form.Input
    field="shortcut"
    label="缩写"
    stopValidateWithError
    rules={[
      { required: true, message: 'required error' },
      { validator: (v) => (v === 'semi' ? undefined : 'should be semi') },
      { validator: (v) => (typeof v === 'string' && v.startsWith('se') ? undefined : 'should startsWith se') },
    ]}
  />
  {#snippet footer()}
    <Button htmlType="submit">提交</Button>
  {/snippet}
</Form>
