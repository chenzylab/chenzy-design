<script lang="ts">
  import { Form } from '@chenzy-design/svelte';
</script>

<div style="max-width: 400px; display: flex; flex-direction: column; gap: 24px;">
  <div>
    <p style="color: #888; font-size: 12px; margin: 0 0 8px;">left（默认）</p>
    <Form labelPosition="left">
      <Form.Input field="a" label="用户名" />
      <Form.Input field="b" label="密码" />
    </Form>
  </div>
  <div>
    <p style="color: #888; font-size: 12px; margin: 0 0 8px;">top</p>
    <Form labelPosition="top">
      <Form.Input field="c" label="用户名" />
      <Form.Input field="d" label="密码" />
    </Form>
  </div>
  <div>
    <p style="color: #888; font-size: 12px; margin: 0 0 8px;">inset</p>
    <Form labelPosition="inset">
      <Form.Input field="e" label="用户名" />
      <Form.Input field="f" label="密码" />
    </Form>
  </div>
</div>
