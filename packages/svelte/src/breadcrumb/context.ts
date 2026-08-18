import type { Snippet } from 'svelte';
import { getContext, setContext } from 'svelte';

/**
 * 父 Breadcrumb 向子 <Breadcrumb.Item> 暴露的上下文。
 * 字段对齐 Semi bread-context.tsx BreadContextType：{ onClick, showTooltip, compact, separator }。
 * 用 getter 跨 context 边界保持响应性（直接读快照会冻结初始值）。
 *
 * 折叠（Semi 用 React `children` 数组 splice，Svelte 无等价能力操作 Snippet 子树）改为
 * register/unregister 协议：子项 mount 时按源码顺序注册，父组件据此计算 visible/collapsed
 * 切分并统一渲染折叠触发器（对齐 Semi handleCollapse 在父层 splice template 的语义）；
 * 折叠触发器本身不再由 Item 渲染，只由 Item 决定「是否隐藏自身」。
 * 红线 #2: isLast/isCollapsed 为纯派生函数（基于注册顺序的纯比较），render 期只读不写；
 * 注册/注销发生在 mount/unmount 副作用（$effect），与渲染派生分离。
 */
export interface BreadContext {
  onClick?: (info: { name?: string; href?: string }, event: MouseEvent) => void;
  readonly showTooltip: boolean | Record<string, unknown>;
  readonly compact: boolean;
  readonly separator: string | undefined;
  /** Item 挂载时注册自身（按源码顺序），返回稳定 id。 */
  register: () => number;
  /** Item 卸载时注销。 */
  unregister: (id: number) => void;
  /** 该 id 是否为最后一项（当前页：不可点 + aria-current=page）。纯派生。 */
  isLast: (id: number) => boolean;
  /** 该 id 是否被 maxItemCount 折叠隐藏，自身不渲染（对齐 Semi 对 children 的 slice）。 */
  isCollapsed: (id: number) => boolean;
  /**
   * 该 id 之后是否紧跟折叠触发器（由被折叠段的前一项负责渲染占位，保证插入位置正确，
   * 对齐 Semi handleCollapse 在 template 数组里 splice 到首项之后的位置）。
   */
  showCollapseTriggerAfter: (id: number) => boolean;
  /**
   * 折叠触发器渲染函数，由父 Breadcrumb 统一提供（复用同一份 handleCollapse 实现，
   * 声明式/routes 两种模式共享，不在 Item 内重复实现 DOM）。
   */
  renderCollapseTrigger: Snippet;
}

const KEY = Symbol('cd-breadcrumb');

export function setBreadcrumbContext(ctx: BreadContext): void {
  setContext(KEY, ctx);
}

export function getBreadcrumbContext(): BreadContext | undefined {
  return getContext<BreadContext | undefined>(KEY);
}
