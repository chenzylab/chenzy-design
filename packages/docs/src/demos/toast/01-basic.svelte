<script lang="ts">
  import { Toast, Button, Space } from '@chenzy-design/svelte';

  // 推荐设置 stack 属性应用堆叠样式到同屏多个 Toast，Hover 展开，
  // 可有效防止一次性弹出多个并列 Toast 对用户造成干扰（对齐 Semi 普通提示 demo）。
  const opts = {
    content: 'Hi, Bytedance dance dance',
    duration: 3,
    stack: true,
  };

  // 节流：10s 内最多弹一次（对齐 Semi throttled demo）。
  let lastTs = 0;
  function throttled() {
    const ts = Date.now();
    if (ts - lastTs < 10000) return;
    lastTs = ts;
    Toast.info({ content: 'Hi, Bytedance dance dance', duration: 10, stack: true });
  }
</script>

<Space wrap>
  <Button onclick={() => Toast.info(opts)}>Display Toast</Button>
  <Button onclick={throttled}>Throttled Toast</Button>
</Space>
