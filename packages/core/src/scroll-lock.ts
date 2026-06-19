/**
 * useScrollLock — lock body scroll while an overlay (Modal/Drawer) is open.
 * Compensates for the scrollbar width to avoid layout shift. Reference-counted
 * so nested/stacked overlays don't unlock prematurely. Call the returned
 * function to release. No framework deps; client-only (guards window/document).
 * See specs/components/feedback/Modal.spec.md §6.
 */

let lockCount = 0;
let savedOverflow = '';
let savedPaddingRight = '';

export function useScrollLock(): () => void {
  if (typeof document === 'undefined') return () => {};

  const body = document.body;

  if (lockCount === 0) {
    savedOverflow = body.style.overflow;
    savedPaddingRight = body.style.paddingRight;
    // scrollbar-width compensation so content doesn't jump
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
    body.style.overflow = 'hidden';
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      body.style.overflow = savedOverflow;
      body.style.paddingRight = savedPaddingRight;
    }
  };
}

/** test-only reset of the internal counter */
export function __resetScrollLock(): void {
  lockCount = 0;
  savedOverflow = '';
  savedPaddingRight = '';
}
