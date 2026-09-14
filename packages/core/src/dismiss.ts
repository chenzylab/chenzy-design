/**
 * useDismiss — close-on-outside-click and close-on-Escape for overlays.
 */

/**
 * 全局浮层注册表：记录当前挂载的所有 portal 浮层根节点（floating to body）。
 *
 * 用途：当浮层 A（如 Select 下拉）portal 到 body 后，在真实 DOM 树中脱离了浮层 B
 * （如 hover 触发的 Popover）的子树，浮层 B 若靠 pointerenter/pointerleave 判断
 * "鼠标是否仍在内容区域"，会因为 relatedTarget 落在浮层 A（与浮层 B 是兄弟节点，
 * 不是子孙）而误判为离开，提前关闭。React 版 Semi 用合成 mouseenter/mouseleave
 * 对此有天然容忍（委托在公共祖先上reconcile），原生 pointerenter/pointerleave
 * 没有等价机制，需要显式登记。
 *
 * 每个 portal 浮层挂载时调用 registerOverlayRoot 自注册，卸载时调用返回的
 * unregister。任何需要判断"这次 pointerleave 是否该忽略"的浮层，调用
 * isInsideAnyOverlay(relatedTarget) 检查目标是否落在任一已注册浮层内。
 */
const overlayRoots = new Set<HTMLElement>();

/** 注册一个 portal 浮层根节点；返回值调用即注销。 */
export function registerOverlayRoot(el: HTMLElement): () => void {
  overlayRoots.add(el);
  return () => {
    overlayRoots.delete(el);
  };
}

/** target 是否落在任一已注册浮层内（含浮层自身）。 */
export function isInsideAnyOverlay(target: Node | null): boolean {
  if (!target) return false;
  for (const root of overlayRoots) {
    if (root.contains(target)) return true;
  }
  return false;
}

/**
 * 全局 Escape 栈：多个 useDismiss 实例各自独立挂 document 级 keydown 监听器时，
 * 互不知道彼此存在——嵌套场景（如 Modal 内一个 DatePicker）按一次 Escape，两个
 * 监听器会同时响应，内层浮层和外层浮层一起关闭，而非只关最上层的那一个。
 *
 * 用挂载顺序（后挂载 = 逻辑上更内层/更上层）代替真实 DOM 事件冒泡：只维护一个
 * 全局 keydown 监听器，按栈顶（最后挂载的实例）优先分发；命中栈顶后不再继续下发
 * 给更早挂载的实例。escape=false 的实例不入栈（本就不消费 Escape）。
 */
const escapeStack: Array<(e: KeyboardEvent) => void> = [];
let escapeListenerAttached = false;

function globalEscapeListener(e: KeyboardEvent): void {
  if (e.key !== 'Escape') return;
  const top = escapeStack[escapeStack.length - 1];
  top?.(e);
}

function pushEscapeHandler(handler: (e: KeyboardEvent) => void): () => void {
  escapeStack.push(handler);
  if (!escapeListenerAttached) {
    document.addEventListener('keydown', globalEscapeListener);
    escapeListenerAttached = true;
  }
  return () => {
    const i = escapeStack.indexOf(handler);
    if (i !== -1) escapeStack.splice(i, 1);
    if (escapeStack.length === 0 && escapeListenerAttached) {
      document.removeEventListener('keydown', globalEscapeListener);
      escapeListenerAttached = false;
    }
  };
}

/** 关闭来源：Esc 键 / 外部点击 */
export type DismissReason = 'esc' | 'outsideClick';

export interface DismissOptions {
  /** 关闭回调，附带来源 reason（'esc' | 'outsideClick'）与原始事件 */
  onDismiss: (reason: DismissReason, event: KeyboardEvent | PointerEvent) => void;
  /** close when Escape pressed (default true) */
  escape?: boolean;
  /** close when clicking outside the element (default true) */
  outsideClick?: boolean;
  /**
   * extra elements that also count as "inside" for outsideClick. Use this when
   * a popup is portaled out of `element`'s subtree (e.g. floating to body) so a
   * click inside the portaled popup is not treated as an outside click.
   */
  extraTargets?: Array<HTMLElement | null | undefined>;
  /**
   * Fired when an outside pointerdown is detected, *before* `onDismiss`. Receives
   * the original PointerEvent. Return `false` (or call `preventDefault()`) to keep
   * the overlay open — the dismiss is then skipped. Useful for an interceptable
   * "clickOutside" hook distinct from the actual close.
   */
  onOutsidePointer?: (event: PointerEvent) => boolean | void;
}

export function useDismiss(
  element: HTMLElement,
  options: DismissOptions,
): () => void {
  const { onDismiss, escape = true, outsideClick = true, extraTargets, onOutsidePointer } =
    options;

  function isInside(target: Node | null): boolean {
    if (element.contains(target)) return true;
    if (extraTargets) {
      for (const el of extraTargets) {
        if (el && el.contains(target)) return true;
      }
    }
    return false;
  }

  function onPointer(e: PointerEvent): void {
    if (!outsideClick) return;
    if (isInside(e.target as Node)) return;
    // Interceptable hook: fire before the dismiss decision. Returning false or
    // calling preventDefault() keeps the overlay open.
    if (onOutsidePointer) {
      const keep = onOutsidePointer(e) === false || e.defaultPrevented;
      if (keep) return;
    }
    onDismiss('outsideClick', e);
  }

  // Escape 走全局栈（见上），只有栈顶（最后挂载）的实例响应，避免嵌套浮层
  // 一次 Escape 同时关闭多层。escape=false 的实例不入栈。
  const popEscape = escape ? pushEscapeHandler((e) => onDismiss('esc', e)) : undefined;
  document.addEventListener('pointerdown', onPointer, true);

  return () => {
    popEscape?.();
    document.removeEventListener('pointerdown', onPointer, true);
  };
}
