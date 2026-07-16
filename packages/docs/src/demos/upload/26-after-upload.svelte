<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem, AfterUploadProps, AfterUploadResult } from '@chenzy-design/svelte';

  let val = $state<UploadFileItem[]>([]);

  // afterUpload（对齐 Semi）：上传成功后据返回值更新该项——这里把 .png 文件重命名并标 warning。
  function afterUpload({ file }: AfterUploadProps): AfterUploadResult {
    if (/\.png$/i.test(file.name)) {
      return {
        status: 'validateFail',
        validateMessage: '不建议上传 PNG，请改用 JPG',
      };
    }
    return { name: `已审核-${file.name}` };
  }
</script>

<Space vertical align="start">
  <Text type="tertiary">
    afterUpload（对齐 Semi）：上传完成后根据返回对象更新文件项状态 / 校验信息 / 文件名（同步返回，不支持异步）。
  </Text>
  <Upload
    multiple
    action="/api/upload"
    {afterUpload}
    fileList={val}
    onChange={({ fileList }) => (val = fileList)}
  />
</Space>
