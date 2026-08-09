<!--
  测试辅助子组件：在 Form.ArrayField 后代里用 useArrayFieldState() 读 inArrayField
  （对齐 Semi useArrayFieldState）。须是独立组件——hooks 只能在组件 init 期调用，
  snippet 内联调用不是新组件实例，不满足这一约束。仅供 ArrayField.a11y.test.ts 使用。
-->
<script lang="ts">
  import { useArrayFieldState } from './hooks.js';

  const state = useArrayFieldState();
</script>

<span data-testid="in-array-field">{String(state?.inArrayField)}</span>
