<script lang="ts">
  // Hooks 演示辅助子组件：在 Form 后代里用 useFormApi 拿句柄改值。
  // 对齐 Semi ComponentUsingFormApi（useFormApi().setValue）。
  import { useFormApi, Button } from '@chenzy-design/svelte';

  const formApi = useFormApi();

  function change() {
    formApi?.setValue('name', Math.random());
  }
</script>

<Button onclick={change}>ChangeName By【useFormApi】</Button>
