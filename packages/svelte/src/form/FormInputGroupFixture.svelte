<!--
  FormInputGroup + hooks 测试夹具：Form 内一个 Form.InputGroup 含两个字段，
  组级 label 上提、组内字段走 isInInputGroup 模式（不各自渲 label）；
  一个后代 panel 用 getFieldApi 操作首个字段。仅供 FormInputGroup.test.ts 使用，不导出。
-->
<script lang="ts">
  import { Form } from './index.js';
  import GroupHookPanel from './GroupHookPanel.svelte';
</script>

<Form initValues={{ areaCode: '', phone: '' }}>
  <Form.InputGroup label={{ text: 'Contact', required: true }} extraText="hint text">
    <Form.Input field="areaCode" label="Area code" required />
    <Form.Input field="phone" label="Phone" rules={[{ pattern: /^\d{6,}$/, message: 'phone too short' }]} />
  </Form.InputGroup>
  <GroupHookPanel />
</Form>
