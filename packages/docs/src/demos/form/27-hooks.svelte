<script lang="ts">
  // Hooks 的使用：在放置于 Form 内部的子组件中，用 useFormApi / useFormState /
  // getFieldApi / useFieldState 直接访问父级 Form 的状态与操作方法，无需通过 props 层层传递。
  // 对齐 Semi「Hooks 的使用」四个 hooks 全覆盖：useFormApi、useFormState、useFieldApi(→ 本库
  // getFieldApi)、useFieldState。
  // 注：Svelte 无 hooks 惯例，这里以 getContext 等价形态提供，须在子组件 init 期调用，故拆为
  // 独立子组件 HooksApiPanel / HooksStatePanel / HooksFieldApiPanel / HooksFieldStatePanel。
  import { Form } from '@chenzy-design/svelte';
  import HooksApiPanel from './HooksApiPanel.svelte';
  import HooksStatePanel from './HooksStatePanel.svelte';
  import HooksFieldApiPanel from './HooksFieldApiPanel.svelte';
  import HooksFieldStatePanel from './HooksFieldStatePanel.svelte';
</script>

<Form style="width: 400px">
  <Form.Input field="name" initValue="mike" />
  <HooksApiPanel />
  <h5 style="margin: 16px 0 8px">FormState read by【useFormState】：</h5>
  <HooksStatePanel />
  <h5 style="margin: 16px 0 8px">useFieldApi</h5>
  <HooksFieldApiPanel />
  <h5 style="margin: 16px 0 8px">useFieldState</h5>
  <Form.Input field="country" initValue="china" />
  <HooksFieldStatePanel field="name" />
  <HooksFieldStatePanel field="country" />
</Form>
