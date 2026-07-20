<script lang="ts">
  // 通过 render 属性传入：把声明控件的带参 snippet 传给 Form 的 render prop
  //（对齐 Semi render props）。入参 { formState, formApi }。
  import { Form } from '@chenzy-design/svelte';
  import type { FormState } from '@chenzy-design/svelte';
</script>

<Form layout="horizontal" onChange={(v) => console.log(v)} {render} />

{#snippet render({ formState }: { formState: FormState })}
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
