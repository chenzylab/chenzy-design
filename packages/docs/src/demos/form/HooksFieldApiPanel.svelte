<script lang="ts">
  // Hooks 演示辅助子组件：在 Form 后代里用 getFieldApi(field) 拿指定字段的 API 改值。
  // 对齐 Semi ComponentUsingFieldApi（useFieldApi('name').setValue）。
  import { getFieldApi, Button } from '@chenzy-design/svelte';

  const nameFieldApi = getFieldApi('name');

  function change() {
    nameFieldApi.setValue(Math.random());
  }
</script>

<Button onclick={change}>Click Me!!! changeNameBy【getFieldApi】</Button>
