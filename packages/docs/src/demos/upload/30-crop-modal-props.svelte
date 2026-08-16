<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';

  // 自定义裁切弹窗样式（对齐 Semi）：cropModalProps 透传裁切 Modal 的样式与属性。
</script>

<Upload
  action="https://api.semi.design/upload"
  crop={{
    aspectRatio: 1,
    shape: 'rect',
  }}
  cropModalProps={{
    width: 800,
    style: 'height: 600px',
    bodyStyle: 'height: 500px; background-color: #f5f5f5',
  }}
  onSuccess={(response, file) => {
    console.log('上传成功:', response, file);
  }}
>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    自定义弹窗样式
  </Button>
</Upload>
