/**
 * resize — Svelte action 轻量用法，供 `<div use:resize={{ box, onResize }}>`。
 * 复用 @chenzy-design/core 的 createResizeObserver，命令式 observe + destroy disconnect。
 * 本子集：box 在 action 创建时固定；update 仅更新 onResize/params。
 * TODO(延后): box 动态变更重建 observer。
 */
import {
  createResizeObserver,
  type ResizeBox,
  type CDResizeEntry,
} from '@chenzy-design/core';
import type { Action } from 'svelte/action';

export interface ResizeActionParams {
  /** 观测盒模型，默认 'content-box'（创建时固定，动态变更延后） */
  box?: ResizeBox;
  /** 尺寸变化回调（归一化 entry） */
  onResize?: (entry: CDResizeEntry) => void;
}

export const resize: Action<HTMLElement, ResizeActionParams | undefined> = (
  node,
  params,
) => {
  let current = params;

  const ro = createResizeObserver({
    box: current?.box ?? 'content-box',
    onResize: (e) => current?.onResize?.(e),
  });

  // SSR / 老浏览器静默降级。
  if (ro.supported) ro.observe(node);

  return {
    update(next) {
      current = next;
    },
    destroy() {
      ro.disconnect();
    },
  };
};
