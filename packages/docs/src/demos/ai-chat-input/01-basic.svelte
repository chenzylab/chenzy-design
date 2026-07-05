<script lang="ts">
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputMessageContent } from '@chenzy-design/svelte';

  let lastSent = $state<string>('（尚未发送）');

  function handleSend(message: AIChatInputMessageContent): void {
    const text = (message.inputContents ?? [])
      .map((c) => (typeof c.text === 'string' ? c.text : ''))
      .join('\n');
    lastSent = text || '（空）';
  }
</script>

<div style="max-width: 560px;">
  <AIChatInput placeholder="输入消息，Enter 发送…" onMessageSend={handleSend} />
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">
    最近发送：{lastSent}
  </p>
</div>
