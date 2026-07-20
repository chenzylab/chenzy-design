<script lang="ts">
  // Hooks 演示辅助子组件：在 Form 后代里用 useFormState 读响应式 formState。
  // 对齐 Semi ComponentUsingFormState（useFormState() → 展示完整 formState）。
  // 注：需在模板/$derived 中调用 useFormState() 才随表单状态更新（对齐本库 GroupHookPanel 用法），
  // 在 <script> 顶层 const 一次拿到的是快照，不会响应式更新。
  import { useFormState } from '@chenzy-design/svelte';
</script>

<pre style="margin: 0"><code>{JSON.stringify(useFormState() ?? {})}</code></pre>
