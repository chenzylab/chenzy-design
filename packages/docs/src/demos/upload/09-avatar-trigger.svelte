<script lang="ts">
  import { Upload, Avatar, Space, Text } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  // 当前头像图（data URI SVG 占位）；上传成功后可换成返回的 url。
  const avatarSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#0066ff"/><text x="60" y="72" font-size="48" fill="#fff" text-anchor="middle">A</text></svg>',
    );

  let currentAvatar = $state(avatarSrc);

  function onChange({ fileList }: { fileList: UploadFileItem[]; currentFile: UploadFileItem }) {
    // 取最新成功项的本地预览地址换头像（真实场景用后端返回 url）。
    const last = fileList[fileList.length - 1];
    if (last?.status === 'success' && last.url) currentAvatar = last.url;
  }
</script>

<Space vertical align="start">
  <Text type="tertiary">头像触发上传：隐藏文件列表，点击头像选图，hover 显示"更换"遮罩。</Text>
  <Upload showUploadList={false} accept="image/*" action="/api/upload" {onChange}>
    <Avatar
      src={currentAvatar}
      size="large"
      alt="用户头像"
      style="margin:4px;cursor:pointer;"
    >
      {#snippet hoverMask()}
        <span style="font-size:12px;">更换</span>
      {/snippet}
    </Avatar>
  </Upload>
</Space>
