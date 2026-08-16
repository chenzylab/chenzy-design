/**
 * createAnchorLink — framework-agnostic state machine for Anchor.Link.
 * Ported 逐行 from Semi semi-foundation/anchor/linkFoundation.ts (LinkFoundation).
 * See specs/components/navigation/Anchor.spec.md §3.
 */

export interface AnchorLinkAdapter {
  addLink: (href: string) => void;
  removeLink: (href: string) => void;
}

export function createAnchorLink(adapter: AnchorLinkAdapter) {
  const handleAddLink = (href: string) => {
    adapter.addLink(href);
  };

  const handleUpdateLink = (href: string, prevHref: string) => {
    if (href !== prevHref) {
      adapter.removeLink(prevHref);
      adapter.addLink(href);
    }
  };

  const handleRemoveLink = (href: string) => {
    adapter.removeLink(href);
  };

  return {
    handleAddLink,
    handleUpdateLink,
    handleRemoveLink,
  };
}

export type AnchorLinkFoundation = ReturnType<typeof createAnchorLink>;
