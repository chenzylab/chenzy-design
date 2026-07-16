<script lang="ts">
  import { Upload } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  let val = $state<UploadFileItem[]>([]);
</script>

<!--
  crop 开启后，选中 image/* 文件先进裁切弹窗（Modal + Cropper），
  确认后用裁切结果 File 替换原文件再走上传流程。
  传对象可自定义宽高比/形状（此处圆形，适合头像）。
-->
<Upload
  listType="picture"
  accept="image/*"
  action="//example.com/upload"
  crop={{ shape: 'round', aspectRatio: 1, modalTitle: '裁切头像' }}
  beforeCrop={(file) => file.size > 0}
  onCropError={(err) => console.error('crop failed', err)}
  fileList={val}
  onChange={({ fileList }) => (val = fileList)}
/>
