<script lang="ts">
  // 表单布局 - 水平布局：设置 layout='horizontal' 使表单控件之间水平排列。
  // 对齐 Semi「表单布局」第②个 demo（水平布局最简示例）。
  import { Form } from '@chenzy-design/svelte';
</script>

<Form layout="horizontal">
  <Form.Input field="phone" label="PhoneNumber" placeholder="Enter your phone number" />
  <Form.Input field="password" label="Password" placeholder="Enter your password" />
</Form>
