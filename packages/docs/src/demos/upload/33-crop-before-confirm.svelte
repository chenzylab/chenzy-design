<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';

  // 裁切前确认（对齐 Semi）：beforeCrop 返回 false 可跳过裁切直接上传。
</script>

<Upload
  action="https://api.semi.design/upload"
  crop={{
    aspectRatio: 1,
    shape: 'round',
  }}
  beforeCrop={(file, fileList) => {
    console.log('beforeCrop:', file, fileList);
    return window.confirm('是否裁切图片？');
  }}
  onCropError={(error) => {
    console.error('裁切失败:', error);
  }}
  onSuccess={(response, file) => {
    console.log('上传成功:', response, file);
  }}
>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传（裁切前确认）
  </Button>
</Upload>
