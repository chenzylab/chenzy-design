<script lang="ts">
  // Hooks 的使用：在放置于 Form 内部的子组件中，用 useFormApi / useFormState 直接访问
  // 父级 Form 的 formApi / formState，无需通过 props 层层传递。
  // 对齐 Semi「Hooks 的使用」（useFormApi 改值 + useFormState 读态）。
  // 注：Svelte 无 hooks 惯例，这里以 getContext 等价形态提供 useFormApi/useFormState，
  // 须在子组件 init 期调用，故拆为独立子组件 HooksApiPanel / HooksStatePanel。
  import { Form } from '@chenzy-design/svelte';
  import HooksApiPanel from './HooksApiPanel.svelte';
  import HooksStatePanel from './HooksStatePanel.svelte';
</script>

<Form style="width: 400px">
  <Form.Input field="name" label="用户名" initValue="mike" />
  <HooksApiPanel />
  <h5 style="margin: 16px 0 8px">FormState read by【useFormState】：</h5>
  <HooksStatePanel />
</Form>
