/**
 * resize — Svelte action 轻量用法，供 `<div use:resize={{ box, onResize }}>`。
 * 复用 @chenzy-design/core 的 createResizeObserver，命令式 observe + destroy disconnect。
 * box / throttle / debounce 变化时重建 observer（先 disconnect 旧的，红线 #3）；
 * 仅 onResize 变化则原地更新（回调在闭包内读最新值，无需重建）。
 */
import {
  createResizeObserver,
  type ResizeBox,
  type CDResizeEntry,
} from '@chenzy-design/core';
import type { Action } from 'svelte/action';

export interface ResizeActionParams {
  /** 观测盒模型，默认 'content-box'。变化时重建 observer。 */
  box?: ResizeBox;
  /** 节流间隔(ms)，leading+trailing，默认 0 即时。与 debounce 互斥。变化时重建 observer。 */
  throttle?: number;
  /** 防抖等待(ms)，trailing-only，默认 0 关闭。优先于 throttle。变化时重建 observer。 */
  debounce?: number;
  /** 尺寸变化回调（归一化 entry）。变化时原地更新，不重建。 */
  onResize?: (entry: CDResizeEntry) => void;
}

export const resize: Action<HTMLElement, ResizeActionParams | undefined> = (
  node,
  params,
) => {
  let current = params;
  let ro: ReturnType<typeof createResizeObserver>;

  // 命令式创建 + observe；回调在闭包内读 current 最新值（onResize 变化无需重建）。
  function build() {
    ro = createResizeObserver({
      box: current?.box ?? 'content-box',
      throttle: current?.throttle ?? 0,
      debounce: current?.debounce ?? 0,
      onResize: (e) => current?.onResize?.(e),
    });
    // SSR / 老浏览器静默降级。
    if (ro.supported) ro.observe(node);
  }

  build();

  return {
    update(next) {
      const prev = current;
      current = next;
      // 仅 box / throttle / debounce 变化才重建（先 disconnect 旧的，红线 #3）。
      if (
        (prev?.box ?? 'content-box') !== (next?.box ?? 'content-box') ||
        (prev?.throttle ?? 0) !== (next?.throttle ?? 0) ||
        (prev?.debounce ?? 0) !== (next?.debounce ?? 0)
      ) {
        ro.disconnect();
        build();
      }
    },
    destroy() {
      ro.disconnect();
    },
  };
};
