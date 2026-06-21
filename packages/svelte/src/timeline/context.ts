import { getContext, setContext } from 'svelte';

export type TimelineLineStyle = 'solid' | 'dashed';

export interface TimelineContext {
  // getter 保持对父 Timeline prop 变化的响应性（直接读快照会冻结初始值）。
  getLineStyle: () => TimelineLineStyle;
  /** interactive 是否开启（getter 保持响应性）。 */
  getInteractive: () => boolean;
  /** 声明式项挂载时领号，返回 id 与卸载清理；id 构成 roving 序列。 */
  registerItem: () => { id: number; unregister: () => void };
  /** 该 id 是否为当前 roving 焦点项（决定 tabindex 0/-1）。 */
  isFocused: (id: number) => boolean;
  /** 声明式项键盘事件冒泡到父：方向键 roving 由父处理（Enter/Space 由项自身处理）。 */
  onItemKeydown: (id: number, e: KeyboardEvent) => void;
  /** 项获得焦点时同步父级焦点索引（点击/Tab 进入）。 */
  onItemFocus: (id: number) => void;
}

const KEY = Symbol('cd-timeline');

export function setTimelineContext(ctx: TimelineContext): void {
  setContext(KEY, ctx);
}

export function getTimelineContext(): TimelineContext | undefined {
  return getContext<TimelineContext | undefined>(KEY);
}
