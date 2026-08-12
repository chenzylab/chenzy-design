import type { TransferItem, TransferTreeNode } from './types.js';

/**
 * Flatten the tree into a flat `TransferItem[]` of leaves only (the migratable
 * units), preserving document order. Used to render the target panel and to map
 * a leaf key back to its label.
 */
export function flattenLeaves(data: readonly TransferTreeNode[]): TransferItem[] {
  const out: TransferItem[] = [];
  function walk(nodes: readonly TransferTreeNode[], parentDisabled: boolean): void {
    for (const node of nodes) {
      const disabled = parentDisabled || !!node.disabled;
      if (node.children && node.children.length > 0) walk(node.children, disabled);
      else out.push(node.value === undefined
        ? { key: node.key, label: node.label, disabled }
        : { key: node.key, value: node.value, label: node.label, disabled });
    }
  }
  walk(data, false);
  return out;
}
