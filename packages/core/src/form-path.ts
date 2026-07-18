/**
 * form-path — nested-path read/write for the form data model, aligned with Semi.
 *
 * Semi's Form stores values as a *nested* tree (`{ users: [{ name: 'x' }] }`) and
 * addresses fields by lodash-style paths (`users[0].name`). We reuse lodash
 * `get`/`set`/`toPath`/`has`/`unset` (same source as Semi's `utils/object.ts`) so
 * `toPath('users[0].name') === ['users','0','name']` and `set` auto-creates arrays
 * for numeric segments.
 *
 * Immutability: the form state's `values` object is treated as immutable so Svelte
 * `$state`/subscribers see a fresh reference on every write. `pathSet`/`pathRemove`
 * clone the branch touched by the path (structural sharing along that branch only)
 * and return a NEW root — never mutate in place.
 */
import { get as lodashGet, toPath as lodashToPath } from 'lodash-es';

/** read a nested value by path (`a[0].b` / `a.0.b`). Undefined when absent. */
export function pathGet(obj: unknown, path: string): unknown {
  return lodashGet(obj, path);
}

/** whether `path` resolves to a defined leaf in `obj`. */
export function pathHas(obj: unknown, path: string): boolean {
  return pathGet(obj, path) !== undefined;
}

/** normalize a path string to its segment array (`users[0].name` → ['users','0','name']). */
export function toSegments(path: string): string[] {
  return lodashToPath(path);
}

function isIndexSegment(seg: string): boolean {
  return /^\d+$/.test(seg);
}

/** shallow-clone a container, preserving array vs object identity. */
function cloneContainer(node: unknown, nextSegIsIndex: boolean): Record<string, unknown> | unknown[] {
  if (Array.isArray(node)) return node.slice();
  if (node !== null && typeof node === 'object') return { ...(node as Record<string, unknown>) };
  // create the shape the *next* segment needs
  return nextSegIsIndex ? [] : {};
}

/**
 * immutable set: returns a NEW root with `path` set to `value`, cloning only the
 * branch along the path (structural sharing elsewhere). Numeric segments create
 * arrays, so `pathSet({}, 'a[0].b', 1) === { a: [{ b: 1 }] }`.
 */
export function pathSet(root: unknown, path: string, value: unknown): Record<string, unknown> {
  const segs = toSegments(path);
  if (segs.length === 0) return (root as Record<string, unknown>) ?? {};
  const nextRoot = cloneContainer(root, isIndexSegment(segs[0] as string)) as Record<string, unknown>;
  let cursor: Record<string, unknown> | unknown[] = nextRoot;
  for (let i = 0; i < segs.length - 1; i++) {
    const seg = segs[i] as string;
    const nextIsIndex = isIndexSegment(segs[i + 1] as string);
    const child: unknown = (cursor as Record<string, unknown>)[seg];
    const clonedChild: Record<string, unknown> | unknown[] = cloneContainer(child, nextIsIndex);
    (cursor as Record<string, unknown>)[seg] = clonedChild;
    cursor = clonedChild;
  }
  (cursor as Record<string, unknown>)[segs[segs.length - 1] as string] = value;
  return nextRoot;
}

/**
 * immutable remove: returns a NEW root with the leaf at `path` deleted, cloning
 * the branch. Array leaves are set to `undefined` (index preserved) to mirror
 * Semi's array-hole semantics; object leaves are `delete`d.
 */
export function pathRemove(root: unknown, path: string): Record<string, unknown> {
  const segs = toSegments(path);
  if (segs.length === 0) return (root as Record<string, unknown>) ?? {};
  // if the parent branch doesn't exist there's nothing to remove — return a clone
  const nextRoot = cloneContainer(root, isIndexSegment(segs[0] as string)) as Record<string, unknown>;
  let cursor: Record<string, unknown> | unknown[] = nextRoot;
  for (let i = 0; i < segs.length - 1; i++) {
    const seg = segs[i] as string;
    const child: unknown = (cursor as Record<string, unknown>)[seg];
    if (child === null || typeof child !== 'object') {
      // path parent missing → nothing to delete
      return nextRoot;
    }
    const clonedChild: Record<string, unknown> | unknown[] = Array.isArray(child)
      ? child.slice()
      : { ...(child as Record<string, unknown>) };
    (cursor as Record<string, unknown>)[seg] = clonedChild;
    cursor = clonedChild;
  }
  const leaf = segs[segs.length - 1] as string;
  if (Array.isArray(cursor)) {
    // array leaf: null the slot (keep index) — mirrors Semi placing `undefined`
    (cursor as unknown[])[Number(leaf)] = undefined;
  } else {
    delete (cursor as Record<string, unknown>)[leaf];
  }
  return nextRoot;
}
