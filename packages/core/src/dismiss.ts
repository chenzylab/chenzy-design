/**
 * useDismiss — close-on-outside-click and close-on-Escape for overlays.
 */

/** 关闭来源：Esc 键 / 外部点击 */
export type DismissReason = 'esc' | 'outsideClick';

export interface DismissOptions {
  /** 关闭回调，附带来源 reason（'esc' | 'outsideClick'） */
  onDismiss: (reason: DismissReason) => void;
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
}

export function useDismiss(
  element: HTMLElement,
  options: DismissOptions,
): () => void {
  const { onDismiss, escape = true, outsideClick = true, extraTargets } = options;

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
    if (escape && e.key === 'Escape') onDismiss('esc');
  }
  function onPointer(e: PointerEvent): void {
    if (!outsideClick) return;
    if (!isInside(e.target as Node)) onDismiss('outsideClick');
  }

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerdown', onPointer, true);

  return () => {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('pointerdown', onPointer, true);
  };
}
