<script lang="ts">
  // 自定义校验（含异步）：rules[].validator 可返回 Promise，异步校验期间显示 validating 提示。
  // 对齐 Semi「自定义校验」的异步场景。
  import { Form, Button } from '@chenzy-design/svelte';

  // 模拟异步校验：用户名 "semi" 视为已被占用。
  function checkNameAvailable(v: unknown): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(v !== 'semi'), 800);
    });
  }
</script>

<Form style="width: 400px">
  <Form.Input
    field="name"
    label="用户名"
    trigger="blur"
    extraText="试试输入 semi（会异步校验为已占用）"
    rules={[
      { required: true, message: '请输入用户名' },
      {
        validator: async (v) => {
          const ok = await checkNameAvailable(v);
          return ok ? undefined : '该用户名已被占用';
        },
      },
    ]}
  />
  {#snippet footer()}
    <Button htmlType="submit">提交</Button>
  {/snippet}
</Form>
