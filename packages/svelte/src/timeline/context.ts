import { getContext, setContext } from 'svelte';

export type TimelineLineStyle = 'solid' | 'dashed';

export interface TimelineContext {
  // getter 保持对父 Timeline prop 变化的响应性（直接读快照会冻结初始值）。
  getLineStyle: () => TimelineLineStyle;
}

const KEY = Symbol('cd-timeline');

export function setTimelineContext(ctx: TimelineContext): void {
  setContext(KEY, ctx);
}

export function getTimelineContext(): TimelineContext | undefined {
  return getContext<TimelineContext | undefined>(KEY);
}
