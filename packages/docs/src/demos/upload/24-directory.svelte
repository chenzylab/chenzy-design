<script lang="ts">
  import { Upload, Space, Text, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  let val = $state<UploadFileItem[]>([]);
</script>

<Space vertical align="start">
  <Text type="tertiary">
    directory（对齐 Semi）：传 directory 后可选择整个文件夹，递归收集其下所有文件并保留相对路径（relativePath）。
  </Text>
  <Upload
    directory
    action="/api/upload"
    fileList={val}
    onChange={({ fileList }) => (val = fileList)}
  >
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      上传文件夹
    </Button>
  </Upload>
  {#if val.length}
    <Text type="secondary">已选 {val.length} 个文件，示例相对路径：{val[0]?.relativePath ?? val[0]?.name}</Text>
  {/if}
</Space>
