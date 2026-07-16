<script lang="ts">
  import { Upload, Space, Text, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  // 受控：列表完全由外部 state 驱动，onChange 回传后写回。
  let fileList = $state<UploadFileItem[]>([
    { uid: 'seed-1', name: 'readme.txt', size: 1024, status: 'success' },
  ]);
</script>

<Space vertical align="start">
  <Text type="tertiary">
    受控模式：fileList 绑定外部 state，onChange 回写；外部按钮可直接增删证明列表受控。
  </Text>
  <Upload multiple fileList={fileList} onChange={({ fileList: fl }) => (fileList = fl)}>
    <Button theme="light">
      {#snippet icon()}<IconUpload />{/snippet}
      点击上传
    </Button>
  </Upload>
  <Space>
    <Button
      onclick={() =>
        (fileList = [
          ...fileList,
          { uid: `ext-${Date.now()}`, name: `外部添加-${fileList.length + 1}.log`, size: 512, status: 'success' },
        ])}
    >
      外部追加一项
    </Button>
    <Button type="danger" onclick={() => (fileList = [])}>清空列表</Button>
  </Space>
  <Text type="secondary">当前列表共 {fileList.length} 项</Text>
</Space>
