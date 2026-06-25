<!--
  Form a11y 测试夹具：在 Form 内组合 Form.Input（Field+Input）与一个 Form.Field
  自定义控件，覆盖 label 关联（for/id）、aria-required、aria-describedby、
  validateStatus 强制 error → aria-invalid。仅供 Form.a11y.test.ts 使用，不导出。
  通过 renderWithLocale 渲染（harness 会注入空 children 插槽，Form 接受 children 故无碍）。
-->
<script lang="ts">
  import { Form } from './index.js';
  import TextArea from '../textarea/TextArea.svelte';
</script>

<Form initValues={{ name: 'Ada', bio: '' }}>
  <!-- Form.Input：Field + Input，label 经 for/id 关联，required → aria-required -->
  <Form.Input field="name" label="Name" required placeholder="Your name" />

  <!-- Form.Field 自定义控件：validateStatus 强制 error → 控件 aria-invalid，
       extraText → aria-describedby 关联 -->
  <Form.Field field="bio" label="Bio" validateStatus="error" extraText="Some hint">
    {#snippet children({ value, onChange, onBlur, status, id, describedBy, required })}
      <TextArea
        value={value === undefined ? '' : String(value)}
        {id}
        status={status === 'error' ? 'error' : 'default'}
        ariaLabel="Bio"
        {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
        onChange={(v) => onChange(v)}
        onBlur={() => onBlur()}
      />
    {/snippet}
  </Form.Field>
</Form>
