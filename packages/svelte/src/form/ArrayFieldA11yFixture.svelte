<!--
  ArrayField 测试夹具：Form.ArrayField 内一行 Field 显式声明 keepState（应被忽略并
  警告，见 Field.svelte inArrayField 分支），并挂一个 ArrayFieldStatePanel 读
  useArrayFieldState()，供 ArrayField.a11y.test.ts 断言。仅供该测试使用，不导出。
-->
<script lang="ts">
  import { Form } from './index.js';
  import ArrayFieldStatePanel from './ArrayFieldStatePanel.svelte';
</script>

<Form initValues={{ rows: [{ name: 'Ada' }] }}>
  <Form.ArrayField field="rows" initialCount={1}>
    {#snippet children({ arrayFields })}
      {#each arrayFields as row (row.key)}
        <div data-row={row.index}>
          <Form.Input field={row.field('name')} label="Name" keepState />
        </div>
      {/each}
      <ArrayFieldStatePanel />
    {/snippet}
  </Form.ArrayField>
</Form>
