<script lang="ts">
  // 基本写法：从 Form 导出表单控件，加 field 属性即接管数据流。
  // label 可传字符串，也可传对象形态（配置 extra / optional 等）。extra 支持 Snippet，
  // 可放 Tooltip + 具名图标（对齐 Semi label.extra: ReactNode）。
  import { Form, Tooltip } from '@chenzy-design/svelte';
  import { IconHelpCircle } from '@chenzy-design/icons';
</script>

<Form layout="horizontal" onValueChange={(v) => console.log(v)}>
  <Form.Input field="UserName" label="用户名" style="width: 80px" />
  <Form.Input
    field="Password"
    label={{ text: '密码', extra: passwordExtra }}
    style="width: 176px"
  />
  <Form.Select
    field="Role"
    label={{ text: '角色', optional: true }}
    style="width: 176px"
    optionList={[
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
      { label: '访客', value: 'guest' },
    ]}
  />
</Form>

{#snippet passwordExtra()}
  <Tooltip content="详情">
    <IconHelpCircle style="color: var(--cd-color-text-2)" />
  </Tooltip>
{/snippet}
