<script lang="ts">
  // 导出 Label、ErrorMessage 使用：当自带布局不满足业务需求、需自行组合位置，但又希望
  // 直接复用 Label / ErrorMessage 的默认样式时，可从 Form 中导出独立使用。
  // 对齐 Semi「导出 Label、ErrorMessage 使用」。
  import { Form } from '@chenzy-design/svelte';
</script>

<Form style="width: 400px">
  <Form.Label text="独立 Label（必填样式）" required />
  <Form.Input field="name" noLabel />
  <Form.ErrorMessage error="我是独立放置的 ErrorMessage" validateStatus="error" />
</Form>
