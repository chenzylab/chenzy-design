<script lang="ts">
  // 对齐 Semi「自定义上传按钮」段：renderUploadButton **仅自定义按钮 UI**，
  // 不影响上传/粘贴逻辑（内置 Upload 仍由组件托管），openFileDialog 触发内部文件选择。
  import { AIChatInput, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
</script>

<AIChatInput placeholder="自定义上传按钮（仍支持粘贴上传）" renderUploadButton={uploadButton} />

{#snippet uploadButton({ openFileDialog, disabled }: { openFileDialog: () => void; disabled: boolean })}
  <Button
    size="small"
    type="tertiary"
    theme="borderless"
    {disabled}
    aria-label="上传附件"
    onclick={openFileDialog}
  >
    <IconUpload />
  </Button>
{/snippet}
