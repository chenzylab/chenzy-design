import { getContext, setContext } from 'svelte';
import type { Snippet } from 'svelte';

export type CollapseIconPosition = 'left' | 'right';

/**
 * 父 Collapse 向 <Collapse.Panel> 暴露的上下文（对齐 Semi collapse-context）。
 * 全部用 getter 跨 context 边界保持对父 prop / 展开态变化的响应性
 * （直接读快照会冻结初始值）。
 * 红线 #1#2 在父级落实：activeSet 由父派生（受控读 prop、非受控读本地 set），
 *   子 Panel 只读 isActive，点击调 onClick 不回写 prop。
 */
export interface CollapseContext {
  /** 该 key 当前是否展开（受控读 prop、非受控读本地 set，均由父派生）。 */
  isActive: (key: string) => boolean;
  /** 点击 header / icon 切换该 key 展开态（受控仅 onChange，非受控更新本地 set）。 */
  onClick: (key: string, event: MouseEvent) => void;
  /** 是否点击整个 Header 即展开（false 时只响应点击箭头，对齐 Semi clickHeaderToExpand）。 */
  getClickHeaderToExpand: () => boolean;
  /** 折叠时是否保留 DOM（对齐 Semi keepDOM，默认 false）。 */
  getKeepDOM: () => boolean;
  /** 是否开启展开动画（对齐 Semi motion）。 */
  getMotion: () => boolean;
  /** 配合 keepDOM，首次挂载不渲染内容（对齐 Semi lazyRender）。 */
  getLazyRender: () => boolean;
  /** 展开图标位置（对齐 Semi expandIconPosition，默认 right）。 */
  getIconPosition: () => CollapseIconPosition;
  /** 自定义展开图标（未展开时显示，对齐 Semi expandIcon，默认 IconChevronDown）。 */
  getExpandIcon: () => Snippet | undefined;
  /** 自定义折叠图标（展开时显示，对齐 Semi collapseIcon，默认 IconChevronUp）。 */
  getCollapseIcon: () => Snippet | undefined;
}

const KEY = Symbol('cd-collapse');

export function setCollapseContext(ctx: CollapseContext): void {
  setContext(KEY, ctx);
}

export function getCollapseContext(): CollapseContext | undefined {
  return getContext<CollapseContext | undefined>(KEY);
}
