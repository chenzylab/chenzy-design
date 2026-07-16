<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem, BeforeUploadProps } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  // picture 上传：含一个初始已上传项（url 预览），便于直接看到缩略图
  let uploadImageVal = $state<UploadFileItem[]>([
    { uid: 'img-1', name: 'sample.svg', size: 1024, status: 'success', url: demoImageSrc },
  ]);

  // beforeUpload 异步校验演示（对齐 Semi：入参 { file, fileList }，拒绝大文件）
  let uploadBeforeVal = $state<UploadFileItem[]>([]);
  async function uploadBefore({ file }: BeforeUploadProps): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 150));
    return file.size <= 100 * 1024;
  }

  // directory 演示
  let uploadDirVal = $state<UploadFileItem[]>([]);
</script>

<Space vertical align="start">
  <Upload multiple draggable accept="image/*" />

  <Text type="tertiary">真实上传（action + 进度）：</Text>
  <div data-testid="upload-action">
    <Upload action="/api/upload" multiple />
  </div>

  <Text type="tertiary">picture 照片墙（缩略图网格）：</Text>
  <div data-testid="upload-image">
    <Upload
      listType="picture"
      multiple
      accept="image/*"
      fileList={uploadImageVal}
      onChange={({ fileList }) => (uploadImageVal = fileList)}
    />
  </div>

  <Text type="tertiary">组件级 validateStatus 校验态（warning / error，影响上传区边框色，区别于文件项 file.status）：</Text>
  <div data-testid="upload-status">
    <Space vertical align="start">
      <Upload validateStatus="warning" draggable accept="image/*" />
      <Upload validateStatus="error" draggable accept="image/*" />
    </Space>
  </div>

  <Text type="tertiary">beforeUpload 异步拒绝大于 100KB 的文件（对齐 Semi 入参 {'{ file, fileList }'}）：</Text>
  <div data-testid="upload-before">
    <Upload
      multiple
      action="/api/upload"
      beforeUpload={uploadBefore}
      fileList={uploadBeforeVal}
      onChange={({ fileList }) => (uploadBeforeVal = fileList)}
    />
  </div>

  <Text type="tertiary">
    directory：选择整个目录（递归选其下所有文件，保留相对路径）；minSize=10KB / maxSize=2048KB：过小或过大的文件标记 validateFail 并提示。
  </Text>
  <div data-testid="upload-directory">
    <Upload
      directory
      minSize={10}
      maxSize={2048}
      fileList={uploadDirVal}
      onChange={({ fileList }) => (uploadDirVal = fileList)}
    />
  </div>
</Space>
