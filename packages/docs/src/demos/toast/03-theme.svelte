<script lang="ts">
  import { Toast, Button, Space } from '@chenzy-design/svelte';

  // 多色样式：theme='light' 浅色填充样式提高与界面的对比，默认为 'normal' 的白色模式（对齐 Semi）。
  const opts = {
    content: 'Hi, Bytedance dance dance',
    duration: 3,
    theme: 'light' as const,
  };
</script>

<Space wrap>
  <Button onclick={() => Toast.info(opts)}>Info</Button>
  <Button onclick={() => Toast.success(opts)}>Success</Button>
  <Button type="warning" onclick={() => Toast.warning(opts)}>Warning</Button>
  <Button type="danger" onclick={() => Toast.error(opts)}>Error</Button>
</Space>
