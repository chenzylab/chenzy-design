<script lang="ts">
  // 表单布局：labelPosition（top / left）与 labelAlign（left / right）控制 label 位置与文本对齐。
  // 对齐 Semi「表单布局」。
  import { Form, Select, Radio } from '@chenzy-design/svelte';

  let labelPosition = $state<'top' | 'left'>('left');
  let labelAlign = $state<'left' | 'right'>('left');
  const labelWidth = $derived(labelPosition === 'left' ? '120px' : undefined);
</script>

<div style="border-bottom: 1px solid var(--cd-color-border); padding-bottom: 12px; margin-bottom: 12px; display: flex; gap: 24px; align-items: center;">
  <span style="display: inline-flex; gap: 8px; align-items: center;">
    切换 labelPosition：
    <span style="display: inline-block; width: 120px;">
      <Select value={labelPosition} onChange={(v) => (labelPosition = v as 'top' | 'left')}
        optionList={[
          { label: 'top', value: 'top' },
          { label: 'left', value: 'left' },
        ]} />
    </span>
  </span>
  <span style="display: inline-flex; gap: 8px; align-items: center;">
    切换 labelAlign：
    <span style="display: inline-block; width: 120px;">
      <Select value={labelAlign} onChange={(v) => (labelAlign = v as 'left' | 'right')}
        optionList={[
          { label: 'left', value: 'left' },
          { label: 'right', value: 'right' },
        ]} />
    </span>
  </span>
</div>

{#key labelPosition + labelAlign}
  <Form {labelPosition} {labelAlign} {labelWidth} style="width: 600px">
    <Form.Input
      field="input"
      label="手机号码"
      trigger="blur"
      style="width: 200px"
      rules={[
        { required: true, message: 'required error' },
        { validator: (v) => (v === 'semi' ? undefined : 'should be semi') },
      ]}
    />
    <Form.Switch label="是否同意" field="agree" />
    <Form.InputNumber field="price" label="价格" style="width: 200px" />
    <Form.Select label="姓名" field="name" style="width: 200px"
      optionList={[
        { label: 'mike', value: 'mike' },
        { label: 'jane', value: 'jane' },
        { label: 'kate', value: 'kate' },
      ]} />
    <Form.CheckboxGroup label="角色" field="role" direction="horizontal"
      optionList={[
        { label: 'admin', value: 'admin' },
        { label: 'user', value: 'user' },
        { label: 'guest', value: 'guest' },
      ]} />
    <Form.RadioGroup field="gender" label="性别">
      <Radio value="1">man</Radio>
      <Radio value="2">woman</Radio>
    </Form.RadioGroup>
  </Form>
{/key}
