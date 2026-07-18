<script lang="ts">
  // Hooks：外部预建 createForm + <Form form={...}>（父层立即操作），
  // 后代 useFormApi / useFormState / getFieldApi（见 HookPanel）。对齐 Semi useForm/useFormApi/useFieldApi。
  import { Form, Button, Space, Text, createForm } from '@chenzy-design/svelte';
  import HookPanel from './HookPanel.svelte';

  // 外部预建 form：Svelte 中 createForm() 同步返回真 api，父组件立即可调（无需 React Proxy 延迟绑定）。
  const form = createForm({ initialValues: { name: '' } });
  let snapshot = $state('');
</script>

<div style="max-width: 420px">
  <Text type="tertiary">外部 createForm() + &lt;Form form=&#123;form&#125;&gt;，父层直接操作：</Text>
  <Space style="margin:8px 0">
    <Button size="small" onclick={() => form.setValue('name', '父层直接写入')}>父层写 name</Button>
    <Button size="small" type="tertiary" onclick={() => (snapshot = JSON.stringify(form.getValues()))}>
      读当前值
    </Button>
  </Space>
  {#if snapshot}
    <div style="margin-bottom:8px"><Text type="tertiary">{snapshot}</Text></div>
  {/if}

  <Form {form}>
    <Form.Input field="name" label="姓名" required />
    <!-- 后代组件用 hooks 拿句柄 -->
    <HookPanel />
  </Form>
</div>
