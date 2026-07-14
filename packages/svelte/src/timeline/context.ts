import { getContext, setContext } from 'svelte';

export type TimelineMode = 'left' | 'right' | 'center' | 'alternate';

export interface TimelineContext {
  /** 父 Timeline 的 mode（getter 保持响应性）。 */
  getMode: () => TimelineMode;
  /**
   * 声明式子项挂载时登记，返回本项在兄弟中的顺序索引（0 起）与卸载清理。
   * 索引用于 alternate 模式的奇偶左右交替（对齐 Semi getPosCls 的 idx 判定）。
   */
  registerItem: () => { getIndex: () => number; unregister: () => void };
}

const KEY = Symbol('cd-timeline');

export function setTimelineContext(ctx: TimelineContext): void {
  setContext(KEY, ctx);
}

export function getTimelineContext(): TimelineContext | undefined {
  return getContext<TimelineContext | undefined>(KEY);
}
