import { getContext, setContext } from 'svelte';

export type DescriptionsAlign = 'center' | 'justify' | 'left' | 'plain';
export type DescriptionsLayout = 'horizontal' | 'vertical';

/**
 * 镜像 Semi DescriptionsContext：仅暴露 align + layout，供 <Descriptions.Item>
 * 决定渲染成 plain（单 td）还是 th/td 对，以及 horizontal 下是否包裹 tr。
 * getter 保持对父 prop 变化的响应性。
 */
export interface DescriptionsContext {
  getAlign: () => DescriptionsAlign;
  getLayout: () => DescriptionsLayout;
}

const KEY = Symbol('cd-descriptions');

export function setDescriptionsContext(ctx: DescriptionsContext): void {
  setContext(KEY, ctx);
}

export function getDescriptionsContext(): DescriptionsContext | undefined {
  return getContext<DescriptionsContext | undefined>(KEY);
}
