import { getContext, setContext } from 'svelte';
import type { Snippet } from 'svelte';

/**
 * 预览组上下文（对齐 Semi image/previewContext.tsx）。
 * ImagePreview（组）通过它向子 Image 广播组态、收集子图 src/title；
 * 子 Image 点击时 setCurrentIndex + handleVisibleChange 请求组浮层打开到自身。
 */
export interface ImagePreviewGroupContext {
  isGroup: true;
  /** 组是否开启子图懒加载（IntersectionObserver）。 */
  lazyLoad: boolean;
  /** 懒加载 observer rootMargin（对齐 Semi lazyLoadMargin）。 */
  lazyLoadMargin: string;
  /** 子 Image 注册自身，返回稳定 imageID（注册顺序）；src/title 用 getter 保持响应性。 */
  register: (item: {
    getSrc: () => string;
    getTitle: () => string | Snippet | undefined;
  }) => number;
  /** 子 Image 卸载时注销。 */
  unregister: (imageID: number) => void;
  /** 请求把组当前索引设为指定图。 */
  setCurrentIndex: (index: number) => void;
  /** 请求切换组预览可见性。 */
  handleVisibleChange: (visible: boolean) => void;
  /** 组级自定义下载文件名。 */
  setDownloadName?: ((src: string) => string) | undefined;
}

const KEY = Symbol('cd-image-preview-group');

export function setImagePreviewGroupContext(ctx: ImagePreviewGroupContext): void {
  setContext(KEY, ctx);
}

export function getImagePreviewGroupContext(): ImagePreviewGroupContext | undefined {
  return getContext<ImagePreviewGroupContext | undefined>(KEY);
}
