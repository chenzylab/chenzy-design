<script lang="ts">
  import { Form, Button, Text } from '@chenzy-design/svelte';

  let result = $state('');
</script>

<div style="max-width: 360px;">
  <Form
    onSubmit={(r) =>
      (result = r.valid ? `提交成功：${JSON.stringify(r.values)}` : '校验未通过')}
  >
    <Form.Input field="email" label="邮箱" required rules={[{ type: 'email' }]} />
    <Form.Input field="name" label="昵称" required />
    {#snippet footer({ submitting })}
      <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
    {/snippet}
  </Form>
  {#if result}
    <Text type="tertiary" style="margin-top: 8px;">{result}</Text>
  {/if}
</div>
