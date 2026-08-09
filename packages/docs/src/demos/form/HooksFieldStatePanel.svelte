<script lang="ts">
  // Hooks 演示辅助子组件：在 Form 后代里用 useFieldState(field) 读指定字段的响应式状态。
  // 对齐 Semi ComponentUsingFieldState（useFieldState(props.field) → 展示 fieldState）。
  // 注：需在模板/$derived 中调用 useFieldState() 才随字段状态更新（同 HooksStatePanel）。
  import { useFieldState } from '@chenzy-design/svelte';

  interface Props {
    field: string;
  }

  const { field }: Props = $props();
</script>

<div>
  <span>【{field}】FieldState read by【useFieldState】：</span>
  <code>{JSON.stringify(useFieldState(field))}</code>
</div>
