<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { BeforeUploadProps, BeforeUploadObjectResult } from '@chenzy-design/svelte';

  // 同步校验（对齐 Semi transformFile + beforeUpload 组合）：转换文件名，交替校验通过/拒绝。
  let syncCount = 0;
  function transformFile(fileInstance: File): File {
    if (syncCount === 0) {
      return new File([fileInstance], 'newFileName', { type: fileInstance.type });
    }
    return fileInstance;
  }
  function beforeUploadSync({ file }: BeforeUploadProps): BeforeUploadObjectResult {
    let result: BeforeUploadObjectResult;
    if (syncCount > 0) {
      result = { autoRemove: false, fileInstance: file.fileInstance, shouldUpload: true };
    } else {
      result = { autoRemove: false, fileInstance: file.fileInstance, status: 'validateFail', shouldUpload: false };
    }
    syncCount = syncCount + 1;
    return result;
  }

  // 异步校验（对齐 Semi）：Promise resolve 代表校验通过，reject 代表校验失败。
  let asyncCount = 0;
  function beforeUploadAsync({ file }: BeforeUploadProps): Promise<BeforeUploadObjectResult> {
    return new Promise((resolve, reject) => {
      if (asyncCount > 1) {
        const result: BeforeUploadObjectResult = { autoRemove: false, shouldUpload: true };
        asyncCount = asyncCount + 1;
        resolve(result);
      } else {
        const result: BeforeUploadObjectResult = {
          autoRemove: false,
          fileInstance: file.fileInstance,
          status: 'validateFail',
          shouldUpload: false,
          validateMessage: `第${asyncCount + 1}个注定失败`,
        };
        asyncCount = asyncCount + 1;
        reject(result);
      }
    });
  }
</script>

<Upload action="https://api.semi.design/upload" {transformFile} beforeUpload={beforeUploadSync}>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传（上传前同步校验）
  </Button>
</Upload>

<Upload action="https://api.semi.design/upload" beforeUpload={beforeUploadAsync}>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传（上传前异步校验）
  </Button>
</Upload>
