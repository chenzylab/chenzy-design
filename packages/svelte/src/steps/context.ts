import { getContext, setContext } from 'svelte';
import type { StepStatus } from './types.js';

export type StepsType = 'fill' | 'basic' | 'nav';
export type StepsSize = 'small' | 'default';
export type StepsDirection = 'horizontal' | 'vertical';

/**
 * Steps 容器通过 context 向声明式 <Steps.Step> 子项下发的共享状态与登记接口。
 * 对齐 Semi useMemo 遍历 children 逐一计算 stepNumber/status/active/done/onChange
 * 的效果（Svelte 无 cloneElement 等价机制，用 context + 声明式登记实现同等结果）。
 * 三型（basic/fill/nav）字段集合按 Semi 各自 Props 接口收窄，getSize 仅 basic/nav 使用。
 */
export interface StepsContext {
  getType: () => StepsType;
  getSize: () => StepsSize;
  getDirection: () => StepsDirection;
  getCurrent: () => number;
  getInitial: () => number;
  getStatus: () => StepStatus;
  getPrefixCls: () => string;
  getOnChange: () => ((current: number) => void) | undefined;
  registerStep: () => {
    getIndex: () => number;
    getTotal: () => number;
    unregister: () => void;
  };
}

const KEY = Symbol('cd-steps');

export function setStepsContext(ctx: StepsContext): void {
  setContext(KEY, ctx);
}

export function getStepsContext(): StepsContext | undefined {
  return getContext<StepsContext | undefined>(KEY);
}
