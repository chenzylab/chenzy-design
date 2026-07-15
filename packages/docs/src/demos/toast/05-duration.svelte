<script lang="ts">
  import { Toast, Button } from '@chenzy-design/svelte';

  // 自定义时长 10s，默认时长为 3s（对齐 Semi）。
  const opts = {
    content: 'Hi, Bytedance dance dance',
    duration: 10,
  };
</script>

<Button onclick={() => Toast.info(opts)}>Close After 10s</Button>
