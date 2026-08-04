<script lang="ts">
  // 严格对齐 Semi「基本用法」demo：placeholder + uploadProps + onContentChange + onUploadChange，
  // 文案与上传地址均照抄 Semi（placeholder='输入内容或者上传内容...'、margin: 12）；
  // 回调同 Semi 只 console.log，不额外展示页面文字。
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputAttachment, AIChatInputChangePayload } from '@chenzy-design/svelte';

  const uploadProps = { action: 'https://api.semi.design/upload' };

  function onContentChange(payload: AIChatInputChangePayload): void {
    console.log('onContentChange', payload);
  }

  function onUploadChange(attachments: AIChatInputAttachment[]): void {
    console.log('onUploadChange', attachments);
  }
</script>

<div style="margin: 12px;">
  <AIChatInput
    placeholder="输入内容或者上传内容..."
    {uploadProps}
    {onContentChange}
    {onUploadChange}
  />
</div>
