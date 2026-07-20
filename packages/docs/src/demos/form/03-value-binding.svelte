<script lang="ts">
  // 表单控件值的绑定：field 可为简单字符串，也可含 . 或 [] 支持多级嵌套。
  // children 带参 snippet 可实时拿到 formState.values（对齐 Semi child render function）。
  import { Form, Row, Col, TextArea } from '@chenzy-design/svelte';
</script>

<Form>
  {#snippet children({ formState })}
    <Row>
      <Col span={12}>
        <Form.Input field="username" placeholder="请尝试输入值" />
        <Form.Input field="user[0]" placeholder="请尝试输入值" />
        <Form.Input field="siblings.1" placeholder="请尝试输入值" />
        <Form.Input field="parents[0].name" placeholder="请尝试输入值" />
      </Col>
      <Col span={10} offset={1} style="margin-top: 12px">
        <Form.Label text="FormState 实时映射值：" />
        <TextArea value={JSON.stringify(formState.values, null, 2)} rows={6} />
      </Col>
    </Row>
  {/snippet}
</Form>
