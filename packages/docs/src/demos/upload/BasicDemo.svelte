<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  // picture-card 上传：含一个初始已上传项（url 预览），便于直接看到缩略图
  let uploadImageVal = $state<UploadFileItem[]>([
    { uid: 'img-1', name: 'sample.svg', size: 1024, status: 'success', url: demoImageSrc },
  ]);

  // concurrency 演示
  let uploadConcVal = $state<UploadFileItem[]>([]);
  let uploadConcActive = $state(0);
  let uploadConcPeak = $state(0);

  function mockUpload(item: UploadFileItem): Promise<void> {
    uploadConcActive += 1;
    if (uploadConcActive > uploadConcPeak) uploadConcPeak = uploadConcActive;
    return new Promise<void>((resolve) => {
      let p = 0;
      const tick = setInterval(() => {
        p = Math.min(100, p + 25);
        uploadConcVal = uploadConcVal.map((it) =>
          it.uid === item.uid ? { ...it, status: 'uploading', percent: p } : it,
        );
        if (p >= 100) {
          clearInterval(tick);
          uploadConcActive -= 1;
          uploadConcVal = uploadConcVal.map((it) =>
            it.uid === item.uid ? { ...it, status: 'success', percent: 100 } : it,
          );
          resolve();
        }
      }, 200);
    });
  }

  async function uploadBefore(file: File): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 150));
    return file.size <= 100 * 1024;
  }

  // directory 演示
  let uploadDirVal = $state<UploadFileItem[]>([]);
</script>

<Space direction="vertical" align="start">
  <Upload multiple drag accept="image/*" />

  <Text type="tertiary">真实上传（action + 进度）：</Text>
  <div data-testid="upload-action">
    <Upload action="/api/upload" multiple />
  </div>

  <Text type="tertiary">picture-card（缩略图网格）：</Text>
  <div data-testid="upload-image">
    <Upload
      listType="picture-card"
      multiple
      accept="image/*"
      value={uploadImageVal}
      onChange={(list) => (uploadImageVal = list)}
    />
  </div>

  <Text type="tertiary">组件级 size 尺寸（small / default / large，影响触发按钮/拖拽区）：</Text>
  <div data-testid="upload-size">
    <Space>
      <Upload size="small">small</Upload>
      <Upload size="default">default</Upload>
      <Upload size="large">large</Upload>
    </Space>
  </div>

  <Text type="tertiary">组件级 status 校验态（warning / error，影响上传区边框色，区别于文件项 file.status）：</Text>
  <div data-testid="upload-status">
    <Space direction="vertical" align="start">
      <Upload status="warning" drag accept="image/*" />
      <Upload status="error" drag accept="image/*" />
    </Space>
  </div>

  <Text type="tertiary">
    concurrency=2（模拟上传，同时进行不超过 2 个，完成一个补一个）；beforeUpload 异步拒绝大于 100KB 的文件。
  </Text>
  <div data-testid="upload-concurrency">
    <Upload
      multiple
      concurrency={2}
      beforeUpload={uploadBefore}
      customRequest={mockUpload}
      value={uploadConcVal}
      onChange={(list) => (uploadConcVal = list)}
    />
  </div>
  <Text type="tertiary">
    当前进行中：<strong data-testid="upload-conc-active">{uploadConcActive}</strong> · 峰值并发：<strong
      data-testid="upload-conc-peak">{uploadConcPeak}</strong>
  </Text>

  <Text type="tertiary">
    directory：选择整个目录（递归选其下所有文件，保留相对路径）；minSize=10KB / maxSize=2048KB：过小或过大的文件标记 error 并提示。
  </Text>
  <div data-testid="upload-directory">
    <Upload
      directory
      minSize={10}
      maxSize={2048}
      value={uploadDirVal}
      onChange={(list) => (uploadDirVal = list)}
    />
  </div>
</Space>
