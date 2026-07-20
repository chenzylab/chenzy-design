<script lang="ts">
  // 表单联动：监听 Field 的 onChange，用 formApi 修改另一个 Field 的值，实现字段间联动。
  // 严格对齐 Semi「表单联动」demo（Note + Sex + Submit/reset，Note 随 Sex 变化）。
  import { Form, Button, Row } from '@chenzy-design/svelte';
  import type { FormApi } from '@chenzy-design/svelte';

  let formApi = $state<FormApi | undefined>(undefined);

  function handleSelectChange(value: unknown) {
    const text = value === 'male' ? 'Hi male' : 'Hi female!';
    formApi?.setValue('Note', text);
  }
</script>

<Form getFormApi={(api) => (formApi = api)} onChange={(v) => console.log(v)} style="width: 250px">
  <span>Note will change after Sex select</span>
  <Form.Input field="Note" style="width: 250px" />
  <Form.Select field="Sex" onChange={handleSelectChange} style="width: 250px"
    optionList={[
      { label: 'female', value: 'female' },
      { label: 'male', value: 'male' },
    ]}
  />
  <Row>
    <Button type="primary" htmlType="submit" style="margin-right: 8px">Submit</Button>
    <Button htmlType="reset">reset</Button>
  </Row>
</Form>
