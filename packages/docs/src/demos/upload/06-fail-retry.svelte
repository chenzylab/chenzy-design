<script lang="ts">
  import { Upload } from '@chenzy-design/svelte';
  import type { UploadFileItem } from '@chenzy-design/svelte';

  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );

  // 预置一个失败态文件，直接展示 fail 卡片红底 / 失败信息 / 重试按钮，
  // 无需真实发起会失败的请求。
  const reportFile = new File(['x'], 'report.pdf', { type: 'application/pdf' });

  let textVal = $state<UploadFileItem[]>([
    { uid: 'fail-1', name: 'report.pdf', size: 204800, status: 'error', error: '上传失败，请重试', file: reportFile },
    { uid: 'ok-1', name: 'photo.png', size: 51200, status: 'success' },
  ]);

  // pic-fail 带一个占位 File，使失败态的居中重试按钮可渲染（重试需要 item.file）。
  const placeholderFile = new File(['x'], 'cover.svg', { type: 'image/svg+xml' });

  let picVal = $state<UploadFileItem[]>([
    { uid: 'pic-fail', name: 'cover.svg', size: 2048, status: 'error', url: demoImageSrc, file: placeholderFile },
    { uid: 'pic-ok', name: 'ok.svg', size: 2048, status: 'success', url: demoImageSrc },
  ]);
</script>

<div style="display:flex; flex-direction:column; gap:24px;">
  <div>
    <p style="margin:0 0 8px; font-size:13px; opacity:.7;">
      文本列表失败态：红底卡片 + 失败信息文本，hover 显示重试按钮。
    </p>
    <Upload
      value={textVal}
      onChange={(list) => (textVal = list)}
      onRetry={(f) => console.log('retry', f.name)}
    />
  </div>

  <div>
    <p style="margin:0 0 8px; font-size:13px; opacity:.7;">
      图片卡片失败态：失败描边 + 右下失败角标，hover 显示居中重试按钮与移除。
    </p>
    <Upload
      listType="picture-card"
      value={picVal}
      onChange={(list) => (picVal = list)}
      onRetry={(f) => console.log('retry', f.name)}
    />
  </div>
</div>
