<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload, IconClose } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const defaultFileList: UploadFileItem[] = [
    { uid: '1', name: 'document.pdf', status: 'success', size: '130.0KB' },
    { uid: '2', name: 'report.xlsx', status: 'success', size: '222.0KB' },
  ];
</script>

<Upload action="https://api.semi.design/upload" {defaultFileList} fileListTitle="已上传文件" style="margin-block-end:20px;">
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    自定义标题文字
  </Button>
</Upload>
<Upload action="https://api.semi.design/upload" {defaultFileList}>
  {#snippet fileListTitle()}<span style="color:var(--cd-color-primary);font-weight:600;">📁 重要文件</span>{/snippet}
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    带样式的标题
  </Button>
</Upload>

<div style="margin-block-start:24px;"></div>

<Upload action="https://api.semi.design/upload" {defaultFileList} style="margin-block-end:20px;">
  {#snippet fileListTitle({ fileList, onClear, clearText })}
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
      <span style="color:var(--cd-color-primary);">📂 共 {fileList.length} 个文件</span>
      <Button size="small" type="danger">
        {#snippet icon()}<IconClose />{/snippet}
        {clearText}
      </Button>
    </div>
  {/snippet}
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    自定义清空按钮样式
  </Button>
</Upload>
<Upload action="https://api.semi.design/upload" {defaultFileList}>
  {#snippet fileListTitle({ fileList, onClear })}
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
      <span>已选择 <strong style="color:var(--cd-color-danger);">{fileList.length}</strong> 个文件</span>
      <span
        role="button"
        tabindex="0"
        onclick={onClear}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onClear()}
        style="cursor:pointer;color:var(--cd-color-link);font-size:12px;"
      >
        全部移除
      </span>
    </div>
  {/snippet}
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    完全自定义标题区域
  </Button>
</Upload>
