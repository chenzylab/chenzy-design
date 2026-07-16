<script lang="ts">
  import { Upload, Space, Text, Button } from '@chenzy-design/svelte';
  import { IconPlus, IconUpload } from '@chenzy-design/icons';

  // 手动上传（对齐 Semi）：uploadTrigger="custom" 时选文件不自动上传，
  // 由外部按钮调 uploadRef.upload() 统一触发真正上传。
  let uploadRef = $state<ReturnType<typeof Upload> | undefined>(undefined);
</script>

<Space vertical align="start">
  <Text type="tertiary">选择文件后不会自动上传，点击「开始上传」才真正上传（uploadTrigger="custom"）。</Text>
  <Upload
    bind:this={uploadRef}
    action="//example.com/upload"
    uploadTrigger="custom"
    multiple
  >
    <Button theme="light">
      {#snippet icon()}<IconPlus />{/snippet}
      选择文件
    </Button>
  </Upload>
  <Button theme="solid" onclick={() => uploadRef?.upload()}>
    {#snippet icon()}<IconUpload />{/snippet}
    开始上传
  </Button>
</Space>
