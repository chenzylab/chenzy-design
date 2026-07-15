<script lang="ts">
  import { Toast, Button } from '@chenzy-design/svelte';

  // 通过唯一的 id 来更新内容（对齐 Semi：对已存在 id 再调 info/success 即原地更新）。
  function show() {
    const id = 'toastid';
    Toast.info({ content: 'Update Content By Id', id });
    setTimeout(() => {
      Toast.success({ content: 'Id By Content Update', id });
    }, 1000);
  }
</script>

<Button type="primary" onclick={show}>Update Content By Id</Button>
