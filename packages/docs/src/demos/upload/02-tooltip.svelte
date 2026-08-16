<script lang="ts">
  import { Upload, Space, Text, Tooltip } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  const seed: UploadFileItem[] = [
    {
      uid: 'long-1',
      name: '这是一个超级超级超级长的文件名用于演示省略号与悬浮提示效果的示例文档.pdf',
      size: '4.0KB',
      status: 'success',
    },
    { uid: 'long-2', name: 'annual-financial-report-2025-final-v2-approved.xlsx', size: '8.0KB', status: 'success' },
  ];
</script>

{#snippet customTooltipSnippet(content: string, children: Snippet)}
  <Tooltip content={content} position="bottom">
    {@render children()}
  </Tooltip>
{/snippet}

<Space vertical align="start">
  <Text type="tertiary">showTooltip 为 boolean 时，控制是否弹出提示（对齐 Semi）。</Text>
  <Upload defaultFileList={seed} action="/api/upload" showTooltip={false} />

  <Text type="tertiary">showTooltip 为 object 时，可以自定义弹出样式（对齐 Semi renderTooltip）。</Text>
  <Upload
    defaultFileList={seed}
    action="/api/upload"
    showTooltip={{ renderTooltip: customTooltipSnippet }}
  />
</Space>
