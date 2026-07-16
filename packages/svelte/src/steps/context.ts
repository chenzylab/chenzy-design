import { getContext, setContext } from 'svelte';
import type { StepStatus } from './types.js';

export type StepsType = 'fill' | 'basic' | 'nav';
export type StepsSize = 'small' | 'default';
export type StepsDirection = 'horizontal' | 'vertical';

/**
 * Steps 父组件通过 context 向声明式 <Steps.Step> 子项下发的共享状态与登记接口。
 * 全部以 getter 暴露以保持响应性（对齐本库 Timeline/Tabs context 范式）。
 */
export interface StepsContext {
  getType: () => StepsType;
  getSize: () => StepsSize;
  getDirection: () => StepsDirection;
  /** 当前步（受控 current 或非受控 inner，绝对值，未加 initial）。 */
  getCurrent: () => number;
  getInitial: () => number;
  /** Steps 顶层 status（仅作用于 current 所在步）。 */
  getStatus: () => StepStatus;
  /** 是否可点击（fill/basic 且传入 onChange）。 */
  getClickable: () => boolean;
  /** 顶层 onChange（参数为 initial + index）；无则不可交互。 */
  getOnChange: () => ((current: number) => void) | undefined;
  /**
   * 声明式子项挂载登记：返回本项在兄弟中的顺序索引 getter、总数 getter 与注销。
   * 索引用于按 current 推断 finish/process/wait 状态、序号显示与 last 判定。
   */
  registerStep: () => {
    getIndex: () => number;
    getTotal: () => number;
    unregister: () => void;
  };
  /** roving tabindex：当前拥有 Tab 停靠点的步索引（-1 = 回退到 current/首步）。 */
  getFocusedIndex: () => number;
  setFocusedIndex: (index: number) => void;
  /** 命令式聚焦某步（方向键漫游用）。 */
  focusStep: (index: number) => void;
  /** 视觉隐藏状态文本（WCAG 1.4.1），供子项朗读「步骤 N，共 M 步，<状态>」。 */
  srLabel: (index: number, total: number, status: StepStatus) => string;
}

const KEY = Symbol('cd-steps');

export function setStepsContext(ctx: StepsContext): void {
  setContext(KEY, ctx);
}

export function getStepsContext(): StepsContext | undefined {
  return getContext<StepsContext | undefined>(KEY);
}
