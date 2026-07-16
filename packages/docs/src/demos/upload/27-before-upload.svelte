<script lang="ts">
  import { Upload, Space, Text, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type {
    UploadFileItem,
    BeforeUploadProps,
    BeforeUploadObjectResult,
  } from '@chenzy-design/svelte';

  let val = $state<UploadFileItem[]>([]);

  // beforeUpload（对齐 Semi）：入参 { file, fileList }，异步校验；返回富对象控制上传。
  // 这里演示：拒绝大于 100KB 的文件（shouldUpload:false + validateMessage），
  // 其余文件通过 transformFile 前先允许上传。
  async function beforeUpload({ file }: BeforeUploadProps): Promise<boolean | BeforeUploadObjectResult> {
    await new Promise((r) => setTimeout(r, 300));
    if (file.size > 100 * 1024) {
      return {
        shouldUpload: false,
        status: 'validateFail',
        validateMessage: '文件超过 100KB，已拦截',
      };
    }
    return true;
  }

  // transformFile（对齐 Semi）：上传前替换文件（这里给文件名加前缀示意转换）。
  function transformFile(file: File): File {
    return new File([file], `t-${file.name}`, { type: file.type });
  }
</script>

<Space vertical align="start">
  <Text type="tertiary">
    beforeUpload 校验（对齐 Semi）：异步校验（validating 中间态），返回富对象拒绝大文件并回写校验信息；
    配合 transformFile 上传前转换文件。
  </Text>
  <Upload
    multiple
    action="/api/upload"
    {beforeUpload}
    {transformFile}
    fileList={val}
    onChange={({ fileList }) => (val = fileList)}
  >
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      点击上传
    </Button>
  </Upload>
</Space>
