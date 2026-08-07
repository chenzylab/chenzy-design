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

  function onKeydown(e: KeyboardEvent): void {
    if (escape && e.key === 'Escape') onDismiss('esc', e);
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

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerdown', onPointer, true);

  return () => {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('pointerdown', onPointer, true);
  };
}
