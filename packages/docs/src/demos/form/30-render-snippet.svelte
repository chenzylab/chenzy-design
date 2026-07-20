<script lang="ts">
  // 带参 snippet 写法：Form 的 children snippet 可带参 { formState, formApi }，在 Form 结构
  // 内部直接拿到实时的 formState / formApi / values。等价于 Semi 的 render props /
  // child render function / props.component 三种写法（Svelte 用带参 snippet 统一表达）。
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
    <code style="margin-top: 24px">{JSON.stringify(formState)}</code>
  {/snippet}
</Form>
