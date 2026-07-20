<script lang="ts">
  // 通过 props.component：把整个内部结构以带参 snippet 传给 Form 的 component prop
  //（对齐 Semi props.component）。入参 { formState, formApi }。
  import { Form } from '@chenzy-design/svelte';
  import type { FormState } from '@chenzy-design/svelte';
</script>

<Form layout="horizontal" onChange={(v) => console.log(v)} {component} />

{#snippet component({ formState }: { formState: FormState })}
  <Form.Input field="Role" style="width: 176px" />
  <Form.Input field="UserName" style="width: 80px" />
  <Form.Input field="Password" style="width: 176px" />
  <code style="margin-top: 24px">{JSON.stringify(formState.values)}</code>
{/snippet}
