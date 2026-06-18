/**
 * useId — stable unique id generation for aria relationships.
 * Framework-agnostic: no DOM, no framework deps.
 */
let counter = 0;

export function useId(prefix = 'cd'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/** reset for test determinism */
export function __resetIdCounter(): void {
  counter = 0;
}
