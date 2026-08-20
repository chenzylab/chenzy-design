/**
 * intersection-observer — 对齐 Semi semi-ui/overflowList/intersectionObserver.tsx
 * (`ReactIntersectionObserver`) 的文件拆分：独立管理 scroll 模式下原生
 * IntersectionObserver 的创建/观测/销毁生命周期，与 OverflowList.svelte 的渲染/划分
 * 逻辑解耦。
 *
 * 框架适配（保留行为等价，非照搬 API 形状）：Semi 组件接收 `items: Record<string, Element>`
 * 整体 diff（componentDidUpdate 比较 key 集合，变化则 disconnect 全部重新 observe），
 * 这是 React 声明式重渲染下比较"这一批 items 和上一批有何不同"的自然写法。Svelte 的
 * `{#each items as item (key)}` + `use:` action 天然按节点级别精确知道「这个具体节点
 * 何时挂载/卸载」，故本模块改为暴露 observe(key, node) / unobserve(key) 两个方法，
 * 供每个可见项节点的 action 在挂载/卸载时精确调用——收敛到与 Semi 相同的结果（observer
 * 恰好观测当前已渲染的全部项），机制更精确（无需整批 disconnect 重连）。
 */

export interface CreateIntersectionObserverOptions {
  /** 相交回调（对齐 Semi onIntersect）。 */
  onIntersect: IntersectionObserverCallback;
  /** 观测根元素（对齐 Semi root，即 scroll wrapper）。 */
  root?: IntersectionObserverInit['root'];
  /** 触发阈值（对齐 Semi threshold，默认 0.75）。 */
  threshold?: IntersectionObserverInit['threshold'];
  /** root margin（对齐 Semi rootMargin，默认 '0px'）。 */
  rootMargin?: IntersectionObserverInit['rootMargin'];
}

export interface IntersectionObserverController {
  /** 开始观测一个节点（对齐 Semi observeElement 里 observer.observe(node)）。 */
  observe(key: string, node: Element): void;
  /** 停止观测一个节点（挂载中 key 变化，或节点卸载）。 */
  unobserve(key: string, node: Element): void;
  /** 断开全部观测（卸载兜底，对齐 Semi componentWillUnmount）。 */
  destroy(): void;
}

/**
 * 创建一个原生 IntersectionObserver 生命周期控制器。
 * 对齐 Semi componentDidMount：`new IntersectionObserver(onIntersect, {root, threshold,
 * rootMargin, ...option})`。root/threshold/rootMargin 只读初始化一次；变化需调用方
 * destroy() 旧实例、重新 create（对齐 Semi 无这三项的响应式更新，只有 componentDidUpdate
 * 比较 items）。
 */
export function createIntersectionObserver(
  options: CreateIntersectionObserverOptions,
): IntersectionObserverController {
  const observer = new IntersectionObserver(options.onIntersect, {
    ...(options.root !== undefined ? { root: options.root } : {}),
    threshold: options.threshold ?? 0.75,
    rootMargin: options.rootMargin ?? '0px',
  });

  return {
    observe(_key, node) {
      observer.observe(node);
    },
    unobserve(_key, node) {
      observer.unobserve(node);
    },
    destroy() {
      observer.disconnect();
    },
  };
}
