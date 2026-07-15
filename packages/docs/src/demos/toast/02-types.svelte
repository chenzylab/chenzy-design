<script lang="ts">
  import { Toast, Button } from '@chenzy-design/svelte';

  // 其他提示类型：成功、失败、警告（对齐 Semi）。
  const opts = {
    content: 'Hi, Bytedance dance dance',
    duration: 3,
  };
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button onclick={() => Toast.success('Hi, Bytedance dance dance')}>Success</Button>
  <Button type="warning" onclick={() => Toast.warning(opts)}>Warning</Button>
  <Button type="danger" onclick={() => Toast.error(opts)}>Error</Button>
</div>
