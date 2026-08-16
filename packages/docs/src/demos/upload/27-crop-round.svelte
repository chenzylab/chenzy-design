<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';

  // 圆形裁切（对齐 Semi）：适用于头像上传场景，shape: 'round'。
</script>

<Upload
  action="https://api.semi.design/upload"
  crop={{
    aspectRatio: 1,
    shape: 'round',
    quality: 0.9,
    modalTitle: '裁切头像',
  }}
  onSuccess={(response, file) => {
    console.log('上传成功:', response, file);
  }}
>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传（圆形裁切）
  </Button>
</Upload>
