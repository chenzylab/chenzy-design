import { getContext, setContext } from 'svelte';

export type DescriptionsDirection = 'horizontal' | 'vertical';

export interface DescriptionsContext {
  // getter 保持对父 Descriptions prop 变化的响应性（直接读快照会冻结初始值）。
  getColumn: () => number;
  getDirection: () => DescriptionsDirection;
  getColon: () => boolean;
  getEmptyText: () => string;
}

const KEY = Symbol('cd-descriptions');

export function setDescriptionsContext(ctx: DescriptionsContext): void {
  setContext(KEY, ctx);
}

export function getDescriptionsContext(): DescriptionsContext | undefined {
  return getContext<DescriptionsContext | undefined>(KEY);
}
