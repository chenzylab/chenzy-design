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
  /**
   * 该 id 是否被 maxItemCount 折叠隐藏（对齐 Semi 对 children 的 slice）。
   * 折叠规则同数据驱动分支：保留首项 + 末 (maxItemCount-1) 项，中间折叠为「…」。
   * 被折叠的 Item 自身不渲染，省略号由父级在首项之后统一插入。
   */
  isCollapsed: (id: number) => boolean;
  /** 该 id 之后是否紧跟折叠省略号（由被折叠段的前一项负责渲染，保证位置正确）。 */
  showEllipsisAfter: (id: number) => boolean;
  /** 被折叠的项数（用于「…」的无障碍文案）。 */
  collapsedCount: () => number;
  /** 点击省略号展开全部。 */
  expand: () => void;
}

const KEY = Symbol('cd-breadcrumb');

export function setBreadcrumbContext(ctx: BreadcrumbContext): void {
  setContext(KEY, ctx);
}

export function getBreadcrumbContext(): BreadcrumbContext | undefined {
  return getContext<BreadcrumbContext | undefined>(KEY);
}
