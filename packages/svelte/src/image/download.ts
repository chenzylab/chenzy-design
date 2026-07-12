/**
 * downloadImage — 通过 fetch → blob → a[download] 触发图片下载。
 * 对齐 Semi semi-foundation/image/utils.ts downloadImage。失败经回调透出。
 */
export async function downloadImage(
  src: string,
  filename: string,
  onError?: (src: string) => void,
): Promise<void> {
  try {
    const response = await fetch(src);
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      link.remove();
    } else {
      onError?.(src);
    }
  } catch {
    onError?.(src);
  }
}

/** 从 URL 推导下载文件名（末段去 query）。对齐 Semi handleDownload 默认命名。 */
export function defaultDownloadName(src: string): string {
  return src.slice(src.lastIndexOf('/') + 1).split('?')[0] ?? src;
}
