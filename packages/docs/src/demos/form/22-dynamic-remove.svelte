<script lang="ts">
  // 动态删减表单项：带参 snippet 拿 formState，按某字段值条件渲染 / 卸载其他字段。
  // 严格对齐 Semi「动态删减表单项」demo（name + isAnchor + 条件 liveRoom + 提交）。
  import { Form, Button } from '@chenzy-design/svelte';
</script>

<Form style="width: 450px">
  {#snippet children({ formState })}
    <Form.Input field="name" label="用户名称:" />
    <Form.RadioGroup
      field="isAnchor"
      label="是否已注册主播"
      options={[
        { label: 'yes', value: 'yes' },
        { label: 'no', value: 'no' },
      ]}
    />
    {#if formState.values.isAnchor === 'yes'}
      <Form.Input field="liveRoom" label="直播间名称" />
    {/if}
    <Button htmlType="submit">提交</Button>
  {/snippet}
</Form>
