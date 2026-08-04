<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';

  // 自定义裁切配置（对齐 Semi）：对象形式配置宽高比、形状、质量等。
</script>

<Upload
  action="https://api.semi.design/upload"
  crop={{
    aspectRatio: 16 / 9,
    shape: 'rect',
    quality: 0.8,
    modalTitle: '裁切图片',
    modalOkText: '确认裁切',
    modalCancelText: '取消',
  }}
  onSuccess={(response, file) => {
    console.log('上传成功:', response, file);
  }}
>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传（16:9 裁切）
  </Button>
</Upload>
