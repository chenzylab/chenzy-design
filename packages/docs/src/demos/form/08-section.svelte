<script lang="ts">
  import { Form, Button, Text } from '@chenzy-design/svelte';

  let result = $state('');
</script>

<div style="max-width: 400px">
  <!-- Form.Section 分组：把字段按语义分区，带分区标题 -->
  <Form onSubmit={(r) => (result = r.valid ? '提交成功' : '校验未通过')}>
    <Form.Section text="基本信息">
      <Form.Input field="name" label="姓名" required />
      <Form.Input field="phone" label="手机号" rules={[{ pattern: /^1\d{10}$/, message: '手机号格式不正确' }]} />
    </Form.Section>
    <Form.Section text="账号设置">
      <Form.Input field="user" label="用户名" required />
      <Form.Input field="pwd" type="password" label="密码" required rules={[{ min: 6 }]} />
    </Form.Section>
    {#snippet footer({ submitting })}
      <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
    {/snippet}
  </Form>
  {#if result}
    <div style="margin-top:8px"><Text type="tertiary">{result}</Text></div>
  {/if}
</div>
