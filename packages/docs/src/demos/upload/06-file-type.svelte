<script lang="ts">
  import { Upload, Space, Text, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
</script>

<Space vertical align="start">
  <Text type="tertiary">
    accept（html 原生属性，对齐 Semi）：支持文件后缀名集合（推荐，如 .jpg,.png）或 MIME types 集合。
  </Text>
  <Upload action="/api/upload" accept="image/*">
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      上传图片
    </Button>
  </Upload>
  <Upload action="/api/upload" accept="video/*">
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      上传视频
    </Button>
  </Upload>
  <Upload action="/api/upload" accept=".pdf,.png,.jpeg">
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      上传 PDF, PNG, JPEG
    </Button>
  </Upload>
</Space>
