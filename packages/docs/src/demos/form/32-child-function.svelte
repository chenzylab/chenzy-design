<script lang="ts">
  // 通过 child render function：Form 的 children 是带参 snippet，return 出所有表单控件
  //（对齐 Semi child render function）。入参 { formState, values, formApi }。
  import { Form } from '@chenzy-design/svelte';
</script>

<Form layout="horizontal" onChange={(v) => console.log(v)}>
  {#snippet children({ formState })}
    <Form.Select
      field="Role"
      label="角色"
      style="width: 176px"
      optionList={[
        { label: '管理员', value: 'admin' },
        { label: '普通用户', value: 'user' },
        { label: '访客', value: 'guest' },
      ]}
    />
    <Form.Input field="UserName" label="用户名" style="width: 80px" />
    <Form.Input field="Password" label="密码" style="width: 176px" />
    <code style="margin-top: 24px">{JSON.stringify(formState.values)}</code>
  {/snippet}
</Form>
