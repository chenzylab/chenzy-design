<script lang="ts">
  import { Form, Button, Space, Text, type FormApi } from '@chenzy-design/svelte';

  let api = $state<FormApi | null>(null);
  let result = $state('');
</script>

<div style="max-width: 400px">
  <!-- getFormApi：拿到内部句柄，在表单外部命令式操作 -->
  <Form getFormApi={(a) => (api = a)} onSubmit={(r) => (result = JSON.stringify(r.values))}>
    <Form.Input field="name" label="姓名" required />
    <Form.Input field="email" label="邮箱" rules={[{ type: 'email' }]} />
  </Form>
  <Space style="margin-top:12px">
    <Button size="small" onclick={() => api?.setValues({ name: '张三', email: 'zhangsan@example.com' })}>
      填充示例
    </Button>
    <Button size="small" type="tertiary" onclick={() => api?.reset()}>重置</Button>
    <Button size="small" type="tertiary" onclick={async () => (result = (await api?.validate()) ? '校验通过' : '校验失败')}>
      校验
    </Button>
  </Space>
  {#if result}
    <div style="margin-top:8px"><Text type="tertiary">{result}</Text></div>
  {/if}
</div>
