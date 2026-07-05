<script lang="ts">
  import { AIChatInput } from '@chenzy-design/svelte';
  import type {
    AIChatInputMessageContent,
    AIChatInputAttachment,
  } from '@chenzy-design/svelte';

  // sendHotKey='shift+enter'：Shift+Enter 发送，裸 Enter 换行（适合长文本输入）。
  // 附件走内置 Upload；onUploadChange 拿到当前附件列表。
  let attachmentCount = $state(0);
  let sentText = $state('（尚未发送）');

  function handleSend(message: AIChatInputMessageContent): void {
    const text = (message.inputContents ?? [])
      .map((c) => (typeof c.text === 'string' ? c.text : ''))
      .join('\n');
    const n = message.attachments?.length ?? 0;
    sentText = `${text || '（空文本）'} · 附件 ${n} 个`;
  }

  function handleUpload(list: AIChatInputAttachment[]): void {
    attachmentCount = list.length;
  }
</script>

<div style="max-width: 560px;">
  <AIChatInput
    sendHotKey="shift+enter"
    round
    placeholder="Shift+Enter 发送，Enter 换行；可上传附件…"
    onMessageSend={handleSend}
    onUploadChange={handleUpload}
  />
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">
    当前附件：{attachmentCount} 个 · 最近发送：{sentText}
  </p>
</div>
