<script lang="ts">
  // 表单布局 - 垂直布局（默认）：登录表单示例，agree 勾选后才能提交，onSubmit 用 Toast 反馈。
  // 对齐 Semi「表单布局」第①个 demo（垂直布局登录表单），values 经 children 带参
  // snippet 直接读取（对齐 Semi child render function 的 values 参数）。
  import { Form, Button, Toast } from '@chenzy-design/svelte';

  function handleSubmit(r: { valid: boolean; values: Record<string, unknown> }) {
    console.log(r.values);
    Toast.info('表单已提交');
  }
</script>

<Form onSubmit={handleSubmit} style="width: 400px">
  {#snippet children({ values })}
    <Form.Input field="phone" label="PhoneNumber" style="width: 100%" placeholder="Enter your phone number" />
    <Form.Input field="password" label="Password" style="width: 100%" placeholder="Enter your password" />
    <Form.Checkbox field="agree" noLabel>I have read and agree to the terms of service</Form.Checkbox>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <p>
        <span>Or</span>
        <Button theme="borderless" style="color: var(--cd-color-primary); margin-left: 10px; cursor: pointer;">Sign up</Button>
      </p>
      <Button disabled={!values.agree} htmlType="submit" type="tertiary">Log in</Button>
    </div>
  {/snippet}
</Form>
