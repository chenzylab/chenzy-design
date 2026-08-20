import { getContext, setContext } from 'svelte';
import type { Snippet } from 'svelte';

export type DescriptionsAlign = 'center' | 'justify' | 'left' | 'plain';
export type DescriptionsLayout = 'horizontal' | 'vertical';

/** horizontal 布局下父级收集 <Descriptions.Item> 元信息用于分组（镜像 Semi getColumns 从 children 提取）。 */
export interface DescriptionsItemEntry {
  itemKey?: string | undefined;
  hidden: boolean;
  span?: number | undefined;
  keyStyle?: string | undefined;
  children?: Snippet | undefined;
}

/**
 * 镜像 Semi DescriptionsContext：仅暴露 align + layout，供 <Descriptions.Item>
 * 决定渲染成 plain（单 td）还是 th/td 对，以及 horizontal 下是否包裹 tr。
 * getter 保持对父 prop 变化的响应性。
 * register/unregister 由父级注入，Item 在 `$effect` 中据此上报自身元信息：
 * 父级判定「horizontal + 无 data（children 模式）」时才据此按 getHorizontalList 分组统一渲染
 * （对齐 Semi getColumns 从 children 提取），Item 自身此时不渲染 DOM；其余场景父级返回值直接被忽略，Item 照常自渲染。
 */
export interface DescriptionsContext {
  getAlign: () => DescriptionsAlign;
  getLayout: () => DescriptionsLayout;
  /** 是否已接管 children 收集渲染（true 时 Item 注册元信息、自身保持静默）。 */
  isCollecting: () => boolean;
  registerItem: (id: string, entry: DescriptionsItemEntry) => void;
  unregisterItem: (id: string) => void;
}

const KEY = Symbol('cd-descriptions');

export function setDescriptionsContext(ctx: DescriptionsContext): void {
  setContext(KEY, ctx);
}

export function getDescriptionsContext(): DescriptionsContext | undefined {
  return getContext<DescriptionsContext | undefined>(KEY);
}
