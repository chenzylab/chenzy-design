import type { TransferItem, TransferTreeNode } from './types.js';

type Key = string | number;

/**
 * A tree data source is an array whose entries carry `children` somewhere, or
 * more precisely: entries that look like tree nodes (have `key`+`label`) AND at
 * least one of them declares a `children` field. We accept a single root with
 * children too. Flat `TransferItem[]` has no `children`, so this stays false and
 * backward-compatible behavior is untouched.
 */
export function isTreeData(
  dataSource: readonly unknown[],
): dataSource is TransferTreeNode[] {
  return dataSource.some(
    (n) =>
      !!n &&
      typeof n === 'object' &&
      Array.isArray((n as TransferTreeNode).children),
  );
}

/** Collect the keys of all leaf nodes (no children) under the tree, in order. */
export function collectLeafKeys(data: readonly TransferTreeNode[]): Key[] {
  const out: Key[] = [];
  function walk(nodes: readonly TransferTreeNode[]): void {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) walk(node.children);
      else out.push(node.key);
    }
  }
  walk(data);
  return out;
}

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
      else out.push({ key: node.key, label: node.label, disabled });
    }
  }
  walk(data, false);
  return out;
}
