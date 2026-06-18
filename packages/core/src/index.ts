/**
 * @chenzy-design/core — framework-agnostic headless primitives.
 * ZERO framework dependencies. Render layers (svelte, future vue/react) bind these.
 * See specs/00-foundation/mvvm-adapter.spec.md.
 */
export { useId, __resetIdCounter } from './id.js';
export { useFocusTrap, type FocusTrap } from './focus-trap.js';
export { useDismiss, type DismissOptions } from './dismiss.js';
export {
  createSider,
  type SiderApi,
  type SiderOptions,
  type SiderTrigger,
  type Breakpoint,
} from './sider.js';
export {
  createForm,
  type FormApi,
  type FormOptions,
  type FormState,
  type FormValues,
  type FieldConfig,
  type FieldErrors,
  type Rule,
  type MessageDescriptor,
} from './form.js';
export {
  isSameDay,
  startOfDay,
  addMonths,
  getMonthGrid,
  weekdayOrder,
  type DayCell,
} from './date.js';
export {
  flattenVisible,
  findNode,
  collectExpandable,
  collectExpandableToDepth,
  conduct,
  toggleCheck,
  normalizeToLeaves,
  computeFilteredKeys,
  type TreeKey,
  type TreeNodeData,
  type FlatNode,
  type CheckState,
} from './tree.js';
