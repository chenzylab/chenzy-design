<script lang="ts">
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputMessageContent } from '@chenzy-design/svelte';

  // 模拟一次「发送 → 生成中 → 完成」：发送后进入 generating（按钮变停止键，
  // Enter 不再发送），点击停止或 2s 后自动结束。
  let generating = $state(false);
  let status = $state('待发送');
  let timer: ReturnType<typeof setTimeout> | undefined;

  function handleSend(_message: AIChatInputMessageContent): void {
    generating = true;
    status = '生成中…（点停止键中断）';
    timer = setTimeout(() => {
      generating = false;
      status = '已完成';
    }, 2000);
  }

  function handleStop(): void {
    if (timer) clearTimeout(timer);
    generating = false;
    status = '已停止';
  }
</script>

<div style="max-width: 560px;">
  <AIChatInput
    {generating}
    placeholder="发送后进入生成态…"
    onMessageSend={handleSend}
    onStopGenerate={handleStop}
  />
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">状态：{status}</p>
</div>
