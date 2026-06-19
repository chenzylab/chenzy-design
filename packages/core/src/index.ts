/**
 * @chenzy-design/core — framework-agnostic headless primitives.
 * ZERO framework dependencies. Render layers (svelte, future vue/react) bind these.
 * See specs/00-foundation/mvvm-adapter.spec.md.
 */
export { useId, __resetIdCounter } from './id.js';
export { useFocusTrap, type FocusTrap } from './focus-trap.js';
export { useDismiss, type DismissOptions } from './dismiss.js';
export { useScrollLock, __resetScrollLock } from './scroll-lock.js';
export {
  createSider,
  type SiderApi,
  type SiderOptions,
  type SiderTrigger,
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
export {
  nextSortOrder,
  toggleSort,
  applySort,
  paginate,
  pageCount,
  selectAllState,
  toggleSelectAll,
  toggleRow,
  type RowKey,
  type SortOrder,
  type SortState,
  type SelectAllState,
} from './table.js';
export {
  eventCoversDay,
  eventsForDay,
  groupEventsByDays,
  dayKey,
  isPastDay,
  type CalendarEvent,
  type CalendarEventKey,
  type DayEvents,
} from './calendar.js';
export {
  offsetToIndex,
  indexToOffset,
  indexOfValue,
  nextEnabledIndex,
  firstEnabledIndex,
  lastEnabledIndex,
  keyboardTarget,
  type ScrollListValue,
  type ScrollListItem,
  type ScrollListKey,
} from './scroll-list.js';
export {
  computeVisibleCount,
  applyHysteresis,
  type OverflowComputeInput,
  type OverflowComputeResult,
} from './overflow-list.js';
export {
  createSpinController,
  type SpinController,
  type SpinOptions,
} from './spin.js';
export {
  clampPercent,
  resolveStatus,
  getCirclePathProps,
  getRootAriaProps,
  type ProgressStatus,
  type ProgressType,
  type GapPosition,
  type CirclePathProps,
  type RootAriaProps,
} from './progress.js';
export {
  resolveBannerRole,
  type BannerType,
  type BannerRoleProps,
} from './banner.js';
export {
  createToastStore,
  type ToastStore,
  type ToastItem,
  type ToastOptions,
  type ToastType,
  type ToastPosition,
  type ToastCloseReason,
} from './toast.js';
export {
  createNotificationStore,
  type NotificationStore,
  type NotificationItem,
  type NotificationOptions,
  type NotificationType,
  type NotificationPlacement,
  type NotificationCloseReason,
} from './notification.js';
export { easeInOutCubic, isAboveThreshold, scrollPositionAt } from './back-top.js';
export {
  mergeConfig,
  DEFAULT_CONFIG,
  type ConfigInput,
  type ResolvedConfig,
  type ConfigTheme,
  type ConfigDir,
  type ConfigSize,
} from './config-provider.js';
export {
  createResizeObserver,
  normalizeEntry,
  isResizeObserverSupported,
  type ResizeBox,
  type CDResizeEntry,
  type ResizeObserverApi,
  type ResizeObserverOptions,
} from './resize-observer.js';
export {
  resolveSize,
  resolveAnimated,
  shouldAutoplay,
  type LottieTrigger,
  type LottieSize,
  type LottiePlayerAdapter,
  type LottiePlayerFactory,
} from './lottie-icon.js';
export {
  computePosition,
  parsePlacement,
  makePlacement,
  type Placement,
  type Side,
  type Align,
  type Rect,
  type Viewport,
  type ComputePositionInput,
  type ComputePositionResult,
} from './floating.js';
export {
  BREAKPOINTS,
  BREAKPOINT_ORDER,
  resolveActiveBreakpoint,
  resolveResponsiveValue,
  type Breakpoint,
} from './breakpoints.js';
export {
  computeAutosizeHeight,
  type AutosizeInput,
  type AutosizeResult,
} from './textarea.js';
