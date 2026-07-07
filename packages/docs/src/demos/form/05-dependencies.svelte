<script lang="ts">
  import { Form, Button, Text } from '@chenzy-design/svelte';

  let result = $state('');
</script>

<div style="max-width: 400px">
  <!-- dependencies：确认密码依赖密码字段，密码变化时自动重校验 -->
  <Form onSubmit={(r) => (result = r.valid ? '两次密码一致' : '校验未通过')}>
    <Form.Input field="pwd" type="password" label="密码" required rules={[{ min: 6, message: '至少 6 位' }]} />
    <Form.Input
      field="confirm"
      type="password"
      label="确认密码"
      required
      dependencies={['pwd']}
      rules={[
        {
          validator: (value, values) =>
            value === (values as { pwd?: string }).pwd ? undefined : '两次输入不一致',
        },
      ]}
    />
    {#snippet footer({ submitting })}
      <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
    {/snippet}
  </Form>
  {#if result}
    <div style="margin-top:8px"><Text type="tertiary">{result}</Text></div>
  {/if}
</div>
