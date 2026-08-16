<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { AfterUploadProps, AfterUploadResult } from '@chenzy-design/svelte';

  function afterUpload({ response }: AfterUploadProps): AfterUploadResult {
    // 可以根据业务接口返回，决定当次上传是否成功。
    const body = response as { status_code?: number } | undefined;
    if (body?.status_code === 200) {
      return {
        autoRemove: false,
        status: 'uploadFail',
        validateMessage: '内容不合法',
        name: 'RenameByServer.jpg',
        url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/edit-bag.jpeg',
      };
    }
    return {};
  }
</script>

<Upload action="https://api.semi.design/upload" {afterUpload}>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传
  </Button>
</Upload>
