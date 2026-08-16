<script lang="ts">
  import { Upload, Avatar, Toast } from '@chenzy-design/svelte';
  import { IconCamera } from '@chenzy-design/icons';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  // 当前头像图（上传成功后换成返回的 url；此处演示用占位图）。
  let url = $state(
    'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#0066ff"/><text x="60" y="72" font-size="48" fill="#fff" text-anchor="middle">A</text></svg>',
      ),
  );

  // 上传成功：提示并换头像（真实场景用 responseBody 里的 url；此处用本地预览地址）。
  function onSuccess(_responseBody: unknown, file: UploadFileItem) {
    Toast.success('头像更新成功');
    if (file.url) url = file.url;
  }
</script>

<Upload
  class="avatar-upload"
  action="/api/upload"
  {onSuccess}
  onError={() => Toast.error('上传失败')}
  accept="image/*"
  showUploadList={false}
>
  <Avatar src={url} style="margin:4px;">
    {#snippet hoverMask()}
      <div class="avatar-hover-mask">
        <IconCamera />
      </div>
    {/snippet}
  </Avatar>
</Upload>

<style>
  /* 深色遮罩铺满头像、图标白色居中（对齐 Semi hoverMask 内联样式）。 */
  .avatar-hover-mask {
    background-color: var(--cd-color-overlay-bg);
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-white);
  }
  /* 确保只有圆是点击热区（对齐 Semi .avatar-upload .semi-upload-add）。 */
  :global(.avatar-upload .cd-upload-add) {
    border-radius: 50%;
  }
</style>
