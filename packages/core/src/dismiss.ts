/**
 * useDismiss — close-on-outside-click and close-on-Escape for overlays.
 */
export interface DismissOptions {
  onDismiss: () => void;
  /** close when Escape pressed (default true) */
  escape?: boolean;
  /** close when clicking outside the element (default true) */
  outsideClick?: boolean;
}

export function useDismiss(
  element: HTMLElement,
  options: DismissOptions,
): () => void {
  const { onDismiss, escape = true, outsideClick = true } = options;

  function onKeydown(e: KeyboardEvent): void {
    if (escape && e.key === 'Escape') onDismiss();
  }
  function onPointer(e: PointerEvent): void {
    if (!outsideClick) return;
    if (!element.contains(e.target as Node)) onDismiss();
  }

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerdown', onPointer, true);

  return () => {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('pointerdown', onPointer, true);
  };
}
