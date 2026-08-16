<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconPlus, IconUpload } from '@chenzy-design/icons';

  let uploadRef = $state<{ upload: () => void } | undefined>(undefined);

  function manualUpload() {
    uploadRef?.upload();
  }
</script>

<div>
  <Upload
    accept="image/gif, image/png, image/jpeg, image/bmp, image/webp"
    action="https://api.semi.design/upload"
    uploadTrigger="custom"
    bind:this={uploadRef}
    onSuccess={(...v) => console.log(...v)}
    onError={(...v) => console.log(...v)}
  >
    <Button theme="light" style="margin-right:8px;">
      {#snippet icon()}<IconPlus />{/snippet}
      选择文件
    </Button>
  </Upload>
  <Button theme="light" onclick={manualUpload}>
    {#snippet icon()}<IconUpload />{/snippet}
    开始上传
  </Button>
</div>
