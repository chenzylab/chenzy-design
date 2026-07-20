<script lang="ts">
  // 动态表单保留状态（keepState）：默认 Field 卸载后其 value/error/touched 会重置；
  // 设 keepState 后卸载再挂载会自动恢复。严格对齐 Semi「动态表单保留状态（keepState）」demo。
  import { Form, Switch, Button } from '@chenzy-design/svelte';

  let show = $state(true);
</script>

<Form style="width: 450px">
  <Form.Switch field="alwaysShow" label="始终显示的字段" />
  <div style="margin: 12px 0; display: flex; align-items: center">
    <Switch checked={show} onChange={(v) => (show = v)} />
    <span style="margin-left: 8px; color: var(--cd-color-text-2)">显示条件字段</span>
  </div>
  {#if show}
    <Form.Input field="conditionalField" label="条件字段（keepState）" keepState />
    <Form.Input field="noKeepState" label="条件字段（无 keepState）" />
  {/if}
  <Button htmlType="submit">提交</Button>
</Form>
