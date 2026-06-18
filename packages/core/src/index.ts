/**
 * @chenzy-design/core — framework-agnostic headless primitives.
 * ZERO framework dependencies. Render layers (svelte, future vue/react) bind these.
 * See specs/00-foundation/mvvm-adapter.spec.md.
 */
export { useId, __resetIdCounter } from './id.js';
export { useFocusTrap, type FocusTrap } from './focus-trap.js';
export { useDismiss, type DismissOptions } from './dismiss.js';
