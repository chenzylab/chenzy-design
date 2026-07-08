<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const seed: UploadFileItem[] = [
    { uid: 't-1', name: 'doc-a.pdf', size: 4096, status: 'success' },
    { uid: 't-2', name: 'doc-b.pdf', size: 8192, status: 'success' },
  ];
</script>

<Space vertical align="start">
  <Text type="tertiary">fileListTitle 为 string：仅替换标题文字，保留默认清空按钮。</Text>
  <Upload multiple defaultValue={seed} showClear fileListTitle="附件列表" />

  <Text type="tertiary">fileListTitle 为 Snippet：完全自定义标题区，用入参 onClear / clearText 自绘清空按钮。</Text>
  <Upload multiple defaultValue={seed} action="/api/upload">
    {#snippet fileListTitle({ fileList, onClear, clearText })}
      <div style="display:flex;align-items:center;gap:12px;padding:4px 0;">
        <strong>已选 {fileList.length} 个文件</strong>
        <button
          type="button"
          onclick={onClear}
          style="color:#f53f3f;background:none;border:none;cursor:pointer;padding:0;"
        >
          {clearText}
        </button>
      </div>
    {/snippet}
  </Upload>
</Space>
