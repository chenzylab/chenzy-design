<script lang="ts">
  import { Form, Button, Text } from '@chenzy-design/svelte';

  let result = $state('');

  // 异步校验：模拟用户名唯一性检查（返回错误串或 undefined 表示通过）
  async function checkUnique(value: unknown): Promise<string | undefined> {
    await new Promise((r) => setTimeout(r, 500));
    return value === 'admin' ? '该用户名已被占用' : undefined;
  }
</script>

<div style="max-width: 400px">
  <!-- 多种校验：required / 内置类型 / 长度 / 自定义同步 / 异步 -->
  <Form onSubmit={(r) => (result = r.valid ? '校验通过' : '校验未通过')}>
    <Form.Input field="user" label="用户名" required rules={[{ validator: checkUnique }]} extraText="试试输入 admin" />
    <Form.Input field="email" label="邮箱" required rules={[{ type: 'email', message: '邮箱格式不正确' }]} />
    <Form.Input
      field="pwd"
      type="password"
      label="密码"
      required
      rules={[{ min: 6, message: '至少 6 位' }]}
    />
    {#snippet footer({ submitting })}
      <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
    {/snippet}
  </Form>
  {#if result}
    <div style="margin-top:8px"><Text type="tertiary">{result}</Text></div>
  {/if}
</div>
