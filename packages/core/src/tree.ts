/**
 * createTree — framework-agnostic tree algorithms for Tree.svelte.
 * Pure functions only: flatten visible nodes, check-conduction (父子联动),
 * search filtering with ancestor expansion. No DOM, no framework deps,
 * no internal mutable state — the render layer owns selection/expansion state
 * (runes in svelte) and calls these helpers. See specs/components/show/Tree.spec.md §3.
 */

export type TreeKey = string | number;

export interface TreeNodeData {
  key: TreeKey;
  label: string;
  disabled?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  children?: TreeNodeData[];
}

/** A node flattened into the visible, ordered list (only expanded subtrees). */
export interface FlatNode {
  node: TreeNodeData;
  /** depth from root, starting at 0 */
  level: number;
  /** parent key, or null for roots */
  parentKey: TreeKey | null;
  /** has at least one child */
  hasChildren: boolean;
  /** 1-based index among siblings (aria-posinset) */
  posInSet: number;
  /** sibling count (aria-setsize) */
  setSize: number;
  /** is this node the last among its siblings (for tree guide lines) */
  isLast: boolean;
  /** per-ancestor-level: was that ancestor the last of its siblings?
   *  length === level; index 0 is the root-level ancestor. Used to decide
   *  whether a vertical guide line continues through each indent column. */
  ancestorIsLast: boolean[];
}

export type CheckState = 'checked' | 'half' | 'unchecked';

function hasKids(node: TreeNodeData): boolean {
  return !!node.children && node.children.length > 0;
}

/**
 * Flatten the tree into an ordered list of visible nodes.
 * A node's children are included only when its key is in `expandedKeys`.
 */
export function flattenVisible(
  data: TreeNodeData[],
  expandedKeys: ReadonlySet<TreeKey>,
): FlatNode[] {
  const out: FlatNode[] = [];
  function walk(
    nodes: TreeNodeData[],
    level: number,
    parentKey: TreeKey | null,
    ancestorIsLast: boolean[],
  ): void {
    const setSize = nodes.length;
    nodes.forEach((node, i) => {
      const kids = hasKids(node);
      const isLast = i === setSize - 1;
      out.push({
        node,
        level,
        parentKey,
        hasChildren: kids,
        posInSet: i + 1,
        setSize,
        isLast,
        ancestorIsLast,
      });
      if (kids && expandedKeys.has(node.key)) {
        walk(node.children as TreeNodeData[], level + 1, node.key, [...ancestorIsLast, isLast]);
      }
    });
  }
  walk(data, 0, null, []);
  return out;
}

/** Recursively find a node by key. */
export function findNode(data: TreeNodeData[], key: TreeKey): TreeNodeData | undefined {
  for (const node of data) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNode(node.children, key);
      if (found) return found;
    }
  }
  return undefined;
}

/** Collect keys of every node that has children (for defaultExpandAll). */
export function collectExpandable(data: TreeNodeData[]): TreeKey[] {
  const acc: TreeKey[] = [];
  function walk(nodes: TreeNodeData[]): void {
    for (const node of nodes) {
      if (hasKids(node)) {
        acc.push(node.key);
        walk(node.children as TreeNodeData[]);
      }
    }
  }
  walk(data);
  return acc;
}

/** Collect keys of nodes up to (and including) the given depth that have children. */
export function collectExpandableToDepth(data: TreeNodeData[], depth: number): TreeKey[] {
  const acc: TreeKey[] = [];
  function walk(nodes: TreeNodeData[], level: number): void {
    if (level >= depth) return;
    for (const node of nodes) {
      if (hasKids(node)) {
        acc.push(node.key);
        walk(node.children as TreeNodeData[], level + 1);
      }
    }
  }
  walk(data, 0);
  return acc;
}

interface ParentMeta {
  parent: Map<TreeKey, TreeKey | null>;
  /** leaf descendant keys per node (the checkable units) */
  leaves: Map<TreeKey, TreeKey[]>;
  /** direct children keys per node */
  childrenOf: Map<TreeKey, TreeKey[]>;
  /** all node keys in document order */
  allKeys: TreeKey[];
}

function buildMeta(data: TreeNodeData[]): ParentMeta {
  const parent = new Map<TreeKey, TreeKey | null>();
  const leaves = new Map<TreeKey, TreeKey[]>();
  const childrenOf = new Map<TreeKey, TreeKey[]>();
  const allKeys: TreeKey[] = [];

  function walk(node: TreeNodeData, parentKey: TreeKey | null): TreeKey[] {
    parent.set(node.key, parentKey);
    allKeys.push(node.key);
    if (!hasKids(node)) {
      leaves.set(node.key, [node.key]);
      childrenOf.set(node.key, []);
      return [node.key];
    }
    const kids = node.children as TreeNodeData[];
    childrenOf.set(
      node.key,
      kids.map((k) => k.key),
    );
    const collected: TreeKey[] = [];
    for (const child of kids) collected.push(...walk(child, node.key));
    leaves.set(node.key, collected);
    return collected;
  }

  for (const root of data) walk(root, null);
  return { parent, leaves, childrenOf, allKeys };
}

/**
 * Conduction (related mode): given a base set of explicitly-checked keys,
 * derive the full checked set + half-checked (indeterminate) set with
 * bottom-up + top-down parent/child propagation.
 * Disabled nodes are excluded from auto-check.
 */
export function conduct(
  data: TreeNodeData[],
  checkedInput: ReadonlySet<TreeKey>,
): { checked: Set<TreeKey>; half: Set<TreeKey> } {
  const meta = buildMeta(data);
  const disabled = new Set<TreeKey>();
  (function markDisabled(nodes: TreeNodeData[], parentDisabled: boolean): void {
    for (const node of nodes) {
      const d = parentDisabled || !!node.disabled;
      if (d) disabled.add(node.key);
      if (node.children) markDisabled(node.children, d);
    }
  })(data, false);

  // Top-down: a checked parent checks all enabled leaf descendants.
  const leafChecked = new Set<TreeKey>();
  for (const key of checkedInput) {
    const ls = meta.leaves.get(key);
    if (!ls) continue;
    for (const leaf of ls) {
      if (!disabled.has(leaf)) leafChecked.add(leaf);
    }
  }

  const checked = new Set<TreeKey>();
  const half = new Set<TreeKey>();

  // Bottom-up: derive each node's state from its leaf descendants.
  // Process in reverse document order so children resolve before parents.
  for (let i = meta.allKeys.length - 1; i >= 0; i--) {
    const key = meta.allKeys[i] as TreeKey;
    const leaves = meta.leaves.get(key) as TreeKey[];
    const enabledLeaves = leaves.filter((l) => !disabled.has(l));
    if (enabledLeaves.length === 0) continue;
    const checkedCount = enabledLeaves.filter((l) => leafChecked.has(l)).length;
    if (checkedCount === 0) continue;
    if (checkedCount === enabledLeaves.length) checked.add(key);
    else half.add(key);
  }

  return { checked, half };
}

/**
 * Normalize a checked set to leaf-level: any non-leaf (parent) key is expanded
 * to its leaf descendants. This makes a base set resilient to being fed the
 * output of `conduct` (which contains parent keys) — feeding a polluted base
 * back through `toggleCheck` would otherwise re-check children on every toggle.
 */
export function normalizeToLeaves(
  data: TreeNodeData[],
  checked: ReadonlySet<TreeKey>,
): Set<TreeKey> {
  const meta = buildMeta(data);
  const out = new Set<TreeKey>();
  for (const key of checked) {
    const leaves = meta.leaves.get(key);
    if (!leaves) continue; // unknown key — drop it
    if (leaves.length === 1 && leaves[0] === key) out.add(key); // it's a leaf
    else for (const l of leaves) out.add(l); // parent → its leaves
  }
  return out;
}

/**
 * Toggle a node's check in related mode: returns the next *base* checked set
 * (leaf-level) after toggling `key`. The input base is normalized to leaves
 * first, so passing `conduct`-output (with parent keys) round-trips correctly.
 * Feed the result through `conduct` to render.
 */
export function toggleCheck(
  data: TreeNodeData[],
  currentChecked: ReadonlySet<TreeKey>,
  key: TreeKey,
): Set<TreeKey> {
  const meta = buildMeta(data);
  const disabled = new Set<TreeKey>();
  (function mark(nodes: TreeNodeData[], pd: boolean): void {
    for (const node of nodes) {
      const d = pd || !!node.disabled;
      if (d) disabled.add(node.key);
      if (node.children) mark(node.children, d);
    }
  })(data, false);

  const base = normalizeToLeaves(data, currentChecked);
  const leaves = (meta.leaves.get(key) ?? []).filter((l) => !disabled.has(l));
  const allChecked = leaves.every((l) => base.has(l));
  const next = new Set(base);
  if (allChecked) for (const l of leaves) next.delete(l);
  else for (const l of leaves) next.add(l);
  return next;
}

/**
 * Search filtering: returns the set of node keys to expand so that every node
 * matching `match` is visible (its ancestor chain). The matched keys themselves
 * are returned separately for highlighting.
 */
export function computeFilteredKeys(
  data: TreeNodeData[],
  match: (node: TreeNodeData) => boolean,
): { matched: Set<TreeKey>; expand: Set<TreeKey> } {
  const matched = new Set<TreeKey>();
  const expand = new Set<TreeKey>();

  function walk(node: TreeNodeData, ancestors: TreeKey[]): boolean {
    let childHit = false;
    if (node.children) {
      for (const child of node.children) {
        if (walk(child, [...ancestors, node.key])) childHit = true;
      }
    }
    const selfHit = match(node);
    if (selfHit) matched.add(node.key);
    if (selfHit || childHit) {
      // expand all ancestors so this node is reachable
      for (const a of ancestors) expand.add(a);
      if (childHit) expand.add(node.key);
      return true;
    }
    return false;
  }

  for (const root of data) walk(root, []);
  return { matched, expand };
}

/**
 * Return the keys of `key`'s siblings (nodes sharing the same direct parent),
 * excluding `key` itself. Roots are siblings of each other. Returns an empty
 * array if the key is not found. Pure function — used by accordion mode to
 * collapse same-level siblings when a node expands.
 */
export function siblingKeys(data: TreeNodeData[], key: TreeKey): TreeKey[] {
  function findSiblings(nodes: TreeNodeData[]): TreeKey[] | null {
    if (nodes.some((n) => n.key === key)) {
      return nodes.filter((n) => n.key !== key).map((n) => n.key);
    }
    for (const n of nodes) {
      if (n.children) {
        const found = findSiblings(n.children);
        if (found) return found;
      }
    }
    return null;
  }
  return findSiblings(data) ?? [];
}

/**
 * Accordion expand: compute the next expanded set when `key` is expanded under
 * accordion mode — at most one node per level stays expanded, so all of `key`'s
 * siblings are collapsed. Returns a new Set containing the current expanded keys
 * plus `key`, minus `key`'s siblings. Pure function (no DOM, no mutation of
 * inputs); the render layer derives the resulting expansion from it.
 */
export function accordionExpand(
  data: TreeNodeData[],
  expandedKeys: ReadonlySet<TreeKey>,
  key: TreeKey,
): Set<TreeKey> {
  const next = new Set(expandedKeys);
  next.add(key);
  for (const s of siblingKeys(data, key)) next.delete(s);
  return next;
}

export type DropPosition = 'before' | 'inside' | 'after';

/**
 * Drag & drop: given the pointer's vertical offset within a target row, decide
 * the drop position. The row is split into three zones — top → `before`,
 * middle → `inside` (become a child), bottom → `after`. When `allowInside` is
 * false (e.g. a leaf target that should not gain children) the middle zone is
 * folded into the nearer edge, yielding only `before`/`after`.
 * Pure function (no DOM) so it is unit-testable; the render layer passes the
 * measured offsetY/rowHeight.
 */
export function computeDropPosition(
  offsetY: number,
  rowHeight: number,
  allowInside = true,
): DropPosition {
  if (rowHeight <= 0) return 'after';
  const y = offsetY < 0 ? 0 : offsetY > rowHeight ? rowHeight : offsetY;
  if (!allowInside) {
    return y < rowHeight / 2 ? 'before' : 'after';
  }
  // 三分区：上 1/4 before、中段 inside、下 1/4 after。
  if (y < rowHeight / 4) return 'before';
  if (y > (rowHeight * 3) / 4) return 'after';
  return 'inside';
}

/**
 * Whether `maybeAncestorKey` is the same as, or an ancestor of, `key`.
 * Used to reject dropping a dragged node onto itself or into its own subtree.
 */
export function isAncestorOrSelf(
  data: TreeNodeData[],
  maybeAncestorKey: TreeKey,
  key: TreeKey,
): boolean {
  if (maybeAncestorKey === key) return true;
  const ancestor = findNode(data, maybeAncestorKey);
  if (!ancestor || !ancestor.children) return false;
  return !!findNode(ancestor.children, key);
}

/** Strategy for converging a fully-checked set into a回填/Tag value set. */
export type CheckedStrategy = 'all' | 'parent' | 'child';

/**
 * Collapse a fully-checked set (the `checked` output of {@link conduct}, which
 * contains every node — parents and children — that is completely checked) into
 * the value set to surface as回填 value / Tags, per `showCheckedStrategy`:
 *
 * - `'all'`    → every checked node (input unchanged, in document order).
 * - `'parent'` → only the top-most fully-checked nodes; a checked node whose
 *                parent is also checked is dropped (parent represents subtree).
 * - `'child'`  → only checked leaf nodes (no parents).
 *
 * Pure: derives solely from `data` + `checked`, document-ordered, no mutation.
 */
export function collectCheckedByStrategy(
  data: TreeNodeData[],
  checked: ReadonlySet<TreeKey>,
  strategy: CheckedStrategy,
): TreeKey[] {
  const out: TreeKey[] = [];
  const walk = (nodes: TreeNodeData[], parentChecked: boolean): void => {
    for (const node of nodes) {
      const isChecked = checked.has(node.key);
      const kids = node.children;
      const isLeaf = !kids || kids.length === 0;
      if (isChecked) {
        if (strategy === 'all') out.push(node.key);
        else if (strategy === 'parent' && !parentChecked) out.push(node.key);
        else if (strategy === 'child' && isLeaf) out.push(node.key);
      }
      if (kids && kids.length > 0) {
        // For 'parent', once a checked ancestor is emitted we stop descending
        // (its subtree is fully represented); otherwise keep walking.
        if (strategy === 'parent' && isChecked) continue;
        walk(kids, isChecked);
      }
    }
  };
  walk(data, false);
  return out;
}
