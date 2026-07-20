<script lang="ts">
  // Modal 弹出层中的表单：通过 getFormApi 拿到句柄，在弹窗确认时调用 formApi.validate() 集中校验。
  // 对齐 Semi「Modal 弹出层中的表单」。
  import { Form, Modal, Button, Row, Col } from '@chenzy-design/svelte';
  import type { FormApi } from '@chenzy-design/svelte';

  let visible = $state(false);
  let formApi = $state<FormApi | undefined>(undefined);
  const message = '该项为必填项';

  async function handleOk() {
    if (!formApi) return;
    // 本库 validate 返回 Promise<boolean>（校验是否全部通过）；通过才关闭弹窗。
    const valid = await formApi.validate();
    if (valid) {
      console.log(formApi.getValues());
      visible = false;
    }
  }
</script>

<Button onclick={() => (visible = true)}>打开弹窗</Button>
<Modal title="新建" visible={visible} onOk={handleOk} onCancel={() => (visible = false)} style="width: 600px">
  <Form getFormApi={(api) => (formApi = api)}>
    <Row>
      <Col span={11}>
        <Form.Select
          field="region"
          label="国家/地区"
          placeholder="请选择"
          style="width: 100%"
          rules={[{ required: true, message }]}
          optionList={[
            { label: '中国', value: 'China' },
            { label: '美国', value: 'US' },
            { label: '日本', value: 'Japan' },
          ]}
        />
      </Col>
      <Col span={11} offset={2}>
        <Form.Input field="owner" label="业务执行人" trigger="blur" rules={[{ required: true, message }]} />
      </Col>
    </Row>
  </Form>
</Modal>
