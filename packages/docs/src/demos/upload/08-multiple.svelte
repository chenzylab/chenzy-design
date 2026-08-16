<script lang="ts">
  import { Upload, Space, Text, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
</script>

<Space vertical align="start">
  <Text type="tertiary">multiple（对齐 Semi）：设置后可支持同时选中多个文件上传。</Text>
  <Upload action="/api/upload" multiple>
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      点击上传
    </Button>
  </Upload>
</Space>
