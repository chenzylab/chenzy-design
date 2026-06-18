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
  function walk(nodes: TreeNodeData[], level: number, parentKey: TreeKey | null): void {
    const setSize = nodes.length;
    nodes.forEach((node, i) => {
      const kids = hasKids(node);
      out.push({
        node,
        level,
        parentKey,
        hasChildren: kids,
        posInSet: i + 1,
        setSize,
      });
      if (kids && expandedKeys.has(node.key)) {
        walk(node.children as TreeNodeData[], level + 1, node.key);
      }
    });
  }
  walk(data, 0, null);
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
