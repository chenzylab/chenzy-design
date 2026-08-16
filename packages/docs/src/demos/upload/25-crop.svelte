<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';

  // 基本用法（对齐 Semi）：crop={true} 启用默认裁切配置。
</script>

<Upload
  action="https://api.semi.design/upload"
  crop={true}
  onSuccess={(response, file) => {
    console.log('上传成功:', response, file);
  }}
>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传（启用裁切）
  </Button>
</Upload>
