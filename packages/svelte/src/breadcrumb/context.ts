import { getContext, setContext } from 'svelte';

/**
 * 父 Breadcrumb 向声明式 <Breadcrumb.Item> 暴露的上下文。
 * 用 getter 跨 context 边界保持响应性（直接读快照会冻结初始值）。
 *
 * 红线 #2: isLast 为纯派生函数（基于注册顺序的纯比较），render 期只读不写。
 * 注册/注销发生在 mount/unmount 副作用（$effect），与渲染派生分离。
 */
export interface BreadcrumbContext {
  /** Item 挂载时注册自身（按源码顺序），返回稳定 id。 */
  register: () => number;
  /** Item 卸载时注销。 */
  unregister: (id: number) => void;
  /** 该 id 是否为最后一项（当前页：不可点 + aria-current=page）。纯派生。 */
  isLast: (id: number) => boolean;
}

const KEY = Symbol('cd-breadcrumb');

export function setBreadcrumbContext(ctx: BreadcrumbContext): void {
  setContext(KEY, ctx);
}

export function getBreadcrumbContext(): BreadcrumbContext | undefined {
  return getContext<BreadcrumbContext | undefined>(KEY);
}
