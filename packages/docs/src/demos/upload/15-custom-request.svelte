<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  let fileList = $state<UploadFileItem[]>([]);

  // 完全接管上传：模拟进度 → 随机 success / error，全程自管文件项状态。
  function customRequest(item: UploadFileItem): Promise<void> {
    return new Promise<void>((resolve) => {
      let p = 0;
      const tick = setInterval(() => {
        p = Math.min(100, p + 20);
        const uploading = p < 100;
        fileList = fileList.map((it) =>
          it.uid === item.uid ? { ...it, status: 'uploading', percent: p } : it,
        );
        if (!uploading) {
          clearInterval(tick);
          // 名字含 "fail" 的模拟失败，其余成功。
          const ok = !/fail/i.test(item.name);
          fileList = fileList.map((it) =>
            it.uid === item.uid
              ? ok
                ? { ...it, status: 'success', percent: 100 }
                : { ...it, status: 'uploadFail', percent: 100, error: '模拟上传失败' }
              : it,
          );
          resolve();
        }
      }, 200);
    });
  }
</script>

<Space vertical align="start">
  <Text type="tertiary">
    自定义请求 customRequest：外部接管上传，模拟进度回调后置成功/失败（文件名含 fail 则失败）。
  </Text>
  <Upload
    multiple
    {customRequest}
    fileList={fileList}
    onChange={({ fileList: fl }) => (fileList = fl)}
  />
</Space>
