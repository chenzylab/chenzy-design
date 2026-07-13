<script lang="ts">
  import { Popconfirm, Button } from '@chenzy-design/svelte';

  function onConfirm() {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
  }
</script>

<Popconfirm
  title="确定是否要保存此修改？"
  content="此修改将不可逆"
  {onConfirm}
>
  <Button>保存（延时关闭）</Button>
</Popconfirm>
