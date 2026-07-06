/**
 * sidebar — framework-agnostic helpers for the SideBar Container (P0).
 *
 * The Container's drag geometry is fully delegated to `createResizeDrag`
 * (resizable.ts, axis:'x' single-axis + clamp) — this module only carries the
 * small pure helpers the Svelte shell needs: parse a CSS size to px and clamp a
 * candidate width into [minWidth, maxWidth]. Kept pure (no DOM, no framework)
 * so it is unit-testable in isolation. See
 * specs/components/show/SideBar.spec.md §3.
 */

/** Parse a CSS size (`number` = px, or `"NNNpx"` / bare numeric string) to px. */
export function parseSideBarWidth(
  size: string | number | undefined,
): number | undefined {
  if (size == null) return undefined;
  if (typeof size === 'number') return Number.isFinite(size) ? size : undefined;
  const trimmed = size.trim();
  if (trimmed.endsWith('px')) {
    const n = Number(trimmed.slice(0, -2));
    return Number.isFinite(n) ? n : undefined;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

/** Clamp a candidate width into `[min, max]` (either bound may be undefined). */
export function clampSideBarWidth(
  width: number,
  min: number | undefined,
  max: number | undefined,
): number {
  let w = width;
  if (min != null) w = Math.max(w, min);
  if (max != null) w = Math.min(w, max);
  return w;
}

/**
 * MCP tool option shape consumed by the pure helpers below (P3 MCPConfigure).
 * Framework-agnostic: only the fields the headless logic reads. The Svelte
 * `MCPReactOption` extends this with `icon`/`desc` render slots.
 * See specs/components/show/SideBar.spec.md §3/§4.
 */
export interface McpOptionCore {
  /** Unique identity + filter/label fallback. */
  value: string;
  /** Human-readable label (primary filter target). */
  label?: string;
  /** Whether the tool is enabled. */
  active?: boolean;
  /** Whether the enable switch is locked (preset tools). */
  disabled?: boolean;
}

/**
 * Default case-insensitive filter: match the trimmed input against `label`
 * (falling back to `value`). Empty input matches everything. A custom
 * `filter(input, option)` predicate takes precedence when provided.
 */
export function filterMcpOptions<T extends McpOptionCore>(
  input: string,
  options: readonly T[],
  filter?: (input: string, option: T) => boolean,
): T[] {
  const q = input.trim().toLowerCase();
  if (filter) return options.filter((o) => filter(input, o));
  if (!q) return [...options];
  return options.filter((o) => (o.label ?? o.value).toLowerCase().includes(q));
}

/**
 * Toggle the `active` flag of the option identified by `value`, returning a new
 * array (pure, no mutation). Disabled options are never toggled. Used by the
 * Svelte shell to derive the next `options`/`customOptions` passed to
 * `onStatusChange` without holding its own mutable copy.
 */
export function toggleMcpOptionActive<T extends McpOptionCore>(
  options: readonly T[],
  value: string,
  active: boolean,
): T[] {
  return options.map((o) =>
    o.value === value && !o.disabled ? { ...o, active } : o,
  );
}

/** Count enabled (`active`) options across the given lists. */
export function countActiveMcpOptions(
  ...lists: readonly (readonly McpOptionCore[])[]
): number {
  let n = 0;
  for (const list of lists) for (const o of list) if (o.active) n += 1;
  return n;
}
