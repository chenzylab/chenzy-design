/**
 * cascader — framework-agnostic pure helpers for the Cascader render layer.
 * ZERO framework deps. Only pure data → data transforms (red line #2):
 * - flattenCascaderPaths: tree → flat selectable paths (leaf, or all levels)
 * - filterCascaderPaths:  query + predicate → matched flat paths
 * - resolveColumnWidth:   columnWidth prop (number | number[]) → per-column px
 * See specs/components/input/Cascader.spec.md §4.
 */

export type CascaderKey = string | number;

/** Minimal node shape consumed by the pure helpers (label/value/children). */
export interface CascaderPathNode {
  label: string;
  value: CascaderKey;
  disabled?: boolean;
  children?: CascaderPathNode[];
}

/** A fully-resolved selectable path through the tree. */
export interface CascaderFlatPath<N extends CascaderPathNode = CascaderPathNode> {
  /** value keys from root → this node */
  values: CascaderKey[];
  /** labels from root → this node */
  labels: string[];
  /** node chain from root → this node */
  nodes: N[];
  /** whether this path ends on a leaf (no children) */
  isLeaf: boolean;
  /** disabled if any node along the path is disabled */
  disabled: boolean;
}

/** Predicate for custom search matching: (query, flat path) → matched. */
export type CascaderFilterFn<N extends CascaderPathNode = CascaderPathNode> = (
  query: string,
  path: CascaderFlatPath<N>,
) => boolean;

/**
 * Flatten a tree into selectable paths.
 * - `includeNonLeaf=false` (default): only leaf paths.
 * - `includeNonLeaf=true`: every level's path (for changeOnSelect).
 * `childrenOf` lets the caller fold in async-loaded children without mutating
 * the source tree. Disabled flags propagate down the chain.
 */
export function flattenCascaderPaths<N extends CascaderPathNode>(
  data: N[],
  options: {
    includeNonLeaf?: boolean;
    childrenOf?: (node: N) => N[] | undefined;
  } = {},
): CascaderFlatPath<N>[] {
  const { includeNonLeaf = false, childrenOf } = options;
  const out: CascaderFlatPath<N>[] = [];
  const walk = (
    nodes: N[],
    values: CascaderKey[],
    labels: string[],
    chain: N[],
    parentDisabled: boolean,
  ) => {
    for (const n of nodes) {
      const kids = (childrenOf ? childrenOf(n) : (n.children as N[] | undefined)) ?? undefined;
      const isLeaf = !kids || kids.length === 0;
      const nv = [...values, n.value];
      const nl = [...labels, n.label];
      const nc = [...chain, n];
      const dis = parentDisabled || !!n.disabled;
      if (isLeaf || includeNonLeaf) {
        out.push({ values: nv, labels: nl, nodes: nc, isLeaf, disabled: dis });
      }
      if (!isLeaf) walk(kids!, nv, nl, nc, dis);
    }
  };
  walk(data, [], [], [], false);
  return out;
}

/**
 * Filter flat paths by a query.
 * - `filter === false`: no matches ([]).
 * - `filter === true`: default substring match on the joined label chain
 *   (case-insensitive), honoring `separator`.
 * - `filter` is a function: custom predicate per path.
 * `leafOnly` (default true) restricts the default-match result to leaf paths.
 * An empty/blank query yields [] (caller decides to show columns instead).
 */
export function filterCascaderPaths<N extends CascaderPathNode>(
  paths: CascaderFlatPath<N>[],
  query: string,
  filter: boolean | CascaderFilterFn<N>,
  options: { separator?: string; leafOnly?: boolean } = {},
): CascaderFlatPath<N>[] {
  if (filter === false) return [];
  const q = query.trim();
  if (q.length === 0) return [];
  const { separator = ' / ', leafOnly = true } = options;
  if (typeof filter === 'function') {
    return paths.filter((p) => filter(q, p));
  }
  const lower = q.toLowerCase();
  return paths.filter((p) => {
    if (leafOnly && !p.isLeaf) return false;
    return p.labels.join(separator).toLowerCase().includes(lower);
  });
}

/**
 * Resolve per-column widths from the `columnWidth` prop.
 * - `number`: uniform width for all columns.
 * - `number[]`: per-column; columns past the array length fall back to the last
 *   entry (or `fallback` if the array is empty).
 * Returns the width (px) for column `index`.
 */
export function resolveColumnWidth(
  columnWidth: number | number[] | undefined,
  index: number,
  fallback = 180,
): number {
  if (columnWidth === undefined) return fallback;
  if (typeof columnWidth === 'number') return columnWidth;
  if (columnWidth.length === 0) return fallback;
  return columnWidth[index] ?? columnWidth[columnWidth.length - 1]!;
}
