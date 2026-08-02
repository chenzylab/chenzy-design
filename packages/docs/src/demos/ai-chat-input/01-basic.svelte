<script lang="ts">
  // 严格对齐 Semi「基本用法」demo：placeholder + uploadProps + onContentChange + onUploadChange，
  // 文案与上传地址均照抄 Semi（placeholder='输入内容或者上传内容...'、margin: 12）。
  //
  // 唯一有意的偏离：Semi 原 demo 两个回调只 console.log，文档站看不到 console，
  // 这里改为就地文字反馈 —— 演示目的等价，且真机验证有可断言的 DOM
  // （同 avatar / markdownrender 去 alert 的处理，见 demo-no-alert-blocks-automation）。
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputAttachment, AIChatInputChangePayload } from '@chenzy-design/svelte';

  const uploadProps = { action: 'https://api.semi.design/upload' };

  let contentLog = $state('（尚未输入）');
  let uploadLog = $state('（尚未上传）');

  function onContentChange(payload: AIChatInputChangePayload): void {
    contentLog = payload.text.trim() || '（空）';
  }

  function onUploadChange(attachments: AIChatInputAttachment[]): void {
    uploadLog = attachments.length ? attachments.map((a) => a.name).join('、') : '（尚未上传）';
  }
</script>

<div style="margin: 12px;">
  <AIChatInput
    placeholder="输入内容或者上传内容..."
    {uploadProps}
    {onContentChange}
    {onUploadChange}
  />
  <p style="margin-top: 12px; color: var(--cd-color-text-2); font-size: 12px;">
    onContentChange：<span data-testid="content-log">{contentLog}</span>
    <br />
    onUploadChange：<span data-testid="upload-log">{uploadLog}</span>
  </p>
</div>
