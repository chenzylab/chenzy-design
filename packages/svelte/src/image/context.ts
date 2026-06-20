import { getContext, setContext } from 'svelte';

/** 组内单张图片的预览数据。src 用 getter 以保持对子 Image prop 变化的响应性。 */
export interface PreviewItem {
  getSrc: () => string;
  getAlt: () => string;
}

export interface ImageGroupContext {
  /** 子 Image 注册自身进预览组，返回该图在组内的稳定索引（注册顺序）。 */
  register: (item: PreviewItem) => number;
  /** 子 Image 卸载时注销。 */
  unregister: (index: number) => void;
  /** 子 Image 被点击时请求打开组预览，定位到自身索引。 */
  open: (index: number) => void;
}

const KEY = Symbol('cd-image-group');

export function setImageGroupContext(ctx: ImageGroupContext): void {
  setContext(KEY, ctx);
}

export function getImageGroupContext(): ImageGroupContext | undefined {
  return getContext<ImageGroupContext | undefined>(KEY);
}
