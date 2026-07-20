<script lang="ts">
  // Form.InputGroup：把多个表单控件组合为一组，仅需一个属于整组的 Label，
  // 组内控件无缝拼接，GroupError 聚合组内错误。对齐 Semi「使用 InputGroup 组合多个 Field」。
  import { Form, Button } from '@chenzy-design/svelte';
</script>

<Form onSubmit={(r) => console.log(r.values)} labelPosition="top" style="width: 400px">
  <Form.InputGroup label={{ text: '手机号码', required: true }} labelPosition="top">
    <Form.Select
      style="width: 150px"
      field="phonePrefix"
      initValue="+86"
      rules={[{ required: true }]}
      showClear
      optionList={[
        { label: '美国 +1', value: '+1' },
        { label: '香港 +852', value: '+852' },
        { label: '中国 +86', value: '+86' },
        { label: '日本 +81', value: '+81' },
      ]}
    />
    <Form.Input
      initValue="18912345678"
      style="width: 250px"
      field="phoneNumber"
      rules={[{ required: true }]}
      showClear
    />
  </Form.InputGroup>
  <Form.Input field="name" label="姓名" trigger="blur" initValue="Semi" />
  {#snippet footer()}
    <Button htmlType="submit">提交</Button>
  {/snippet}
</Form>
