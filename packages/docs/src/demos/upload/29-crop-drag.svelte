<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';

  // 拖拽上传裁切（对齐 Semi）：draggable 与 crop 结合，拖拽上传时也会触发裁切。
</script>

<Upload
  action="https://api.semi.design/upload"
  crop={{
    aspectRatio: 1,
    shape: 'rect',
  }}
  draggable
  onDrop={(e, files, fileList) => {
    console.log('拖拽文件:', files);
  }}
  onSuccess={(response, file) => {
    console.log('上传成功:', response, file);
  }}
>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    拖拽上传（启用裁切）
  </Button>
</Upload>
