/**
 * useInertBackground — hide page content behind a modal overlay from assistive
 * tech and pointer/keyboard interaction while the overlay is open.
 *
 * Pass the overlay's portal root (the element appended to body/getContainer).
 * Every *sibling* of that root (the rest of the page, plus any overlay opened
 * earlier) is marked `inert` + `aria-hidden="true"`; on release the originals
 * are restored. See specs/components/feedback/Modal.spec.md §6 ("背景内容对 SR
 * aria-hidden/inert").
 *
 * Stacked overlays: a module-level stack tracks every active overlay root. Only
 * the *topmost* (most recently activated) overlay drives the inert set — its
 * siblings (including lower overlays) get hidden, while the topmost overlay
 * itself stays interactive. When it releases, the previous overlay re-applies.
 * This keeps nested Modal/Drawer/SideSheet correct without inerting the layer
 * the user is currently working in.
 *
 * No framework deps; client-only (guards document). Returned function releases.
 */

const INERT_MARK = 'data-cd-inert-bg';

// Active overlay roots, in activation order. Last = topmost.
const stack: HTMLElement[] = [];
// Elements we marked, with the attribute values to restore on release.
// We toggle the `inert` *attribute* (not the IDL property) so it reflects
// consistently across browsers and SSR-ish DOM impls.
let hidden: Array<{
  el: HTMLElement;
  prevInert: boolean;
  prevAriaHidden: string | null;
}> = [];

function clearHidden(): void {
  for (const { el, prevInert, prevAriaHidden } of hidden) {
    if (prevInert) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
    if (prevAriaHidden === null) el.removeAttribute('aria-hidden');
    else el.setAttribute('aria-hidden', prevAriaHidden);
  }
  hidden = [];
}

function apply(): void {
  // Restore whatever the previous topmost overlay hid, then re-hide for the new
  // topmost. Simpler and correct than diffing when the active root changes.
  clearHidden();
  const top = stack[stack.length - 1];
  if (!top || !top.parentNode) return;
  const parent = top.parentNode;
  for (const node of Array.from(parent.childNodes)) {
    if (!(node instanceof HTMLElement)) continue;
    if (node === top) continue;
    // Never inert another active overlay root that sits above us — but since we
    // always hide for the *topmost*, every other root here is below `top`, so
    // hiding them is what we want.
    hidden.push({
      el: node,
      prevInert: node.hasAttribute('inert'),
      prevAriaHidden: node.getAttribute('aria-hidden'),
    });
    node.setAttribute('inert', '');
    node.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Mark `root`'s siblings inert/aria-hidden. `root` should be the overlay's
 * portal root element. Returns a release function (idempotent).
 */
export function useInertBackground(root: HTMLElement): () => void {
  if (typeof document === 'undefined' || !root) return () => {};

  root.setAttribute(INERT_MARK, '');
  stack.push(root);
  apply();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const i = stack.indexOf(root);
    if (i !== -1) stack.splice(i, 1);
    root.removeAttribute(INERT_MARK);
    apply();
  };
}

/** test-only reset of internal state */
export function __resetInertBackground(): void {
  clearHidden();
  stack.length = 0;
}
