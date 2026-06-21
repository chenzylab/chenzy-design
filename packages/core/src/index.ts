/**
 * @chenzy-design/core — framework-agnostic headless primitives.
 * ZERO framework dependencies. Render layers (svelte, future vue/react) bind these.
 * See specs/00-foundation/mvvm-adapter.spec.md.
 */
export { useId, __resetIdCounter } from './id.js';
export { useFocusTrap, type FocusTrap } from './focus-trap.js';
export { useDismiss, type DismissOptions, type DismissReason } from './dismiss.js';
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
  findRanges,
  mergeRanges,
  chunksFromRanges,
  highlightChunks,
  type HighlightRange,
  type HighlightChunk,
  type FindRangesOptions,
} from './highlight.js';
export {
  isSameDay,
  startOfDay,
  addMonths,
  addWeeks,
  addDays,
  getMonthGrid,
  getWeekGrid,
  getDayHours,
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
  computeDropPosition,
  isAncestorOrSelf,
  siblingKeys,
  accordionExpand,
  type TreeKey,
  type TreeNodeData,
  type FlatNode,
  type CheckState,
  type DropPosition,
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
  flattenTreeRows,
  conductRows,
  normalizeRowsToLeaves,
  toggleRowCheck,
  type RowKey,
  type SortOrder,
  type SortState,
  type SelectAllState,
  type FlatRow,
} from './table.js';
export {
  eventCoversDay,
  eventsForDay,
  groupEventsByDays,
  timelineForDay,
  dayKey,
  isPastDay,
  type CalendarEvent,
  type CalendarEventKey,
  type DayEvents,
  type DayTimeline,
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
  computeOverflowPartition,
  applyHysteresis,
  computeTabOverflow,
  type OverflowComputeInput,
  type OverflowComputeResult,
  type OverflowPartitionInput,
  type OverflowPartitionResult,
  type CollapseFrom,
  type TabOverflowInput,
  type TabOverflowResult,
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
  type NotificationTheme,
} from './notification.js';
export { easeInOutCubic, isAboveThreshold, scrollPositionAt } from './back-top.js';
export {
  mergeConfig,
  DEFAULT_CONFIG,
  resolveAppliedTheme,
  resolveReducedMotion,
  type ConfigInput,
  type ResolvedConfig,
  type ConfigTheme,
  type AppliedTheme,
  type ConfigDir,
  type ConfigSize,
  type ReducedMotionInput,
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
  resolveSegments,
  isLottieSrc,
  resolveRenderer,
  type LottieTrigger,
  type LottieSize,
  type LottieSegments,
  type LottieRenderer,
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
export {
  computeUploadPercent,
  isUploadOk,
  createUploadQueue,
  resolveBeforeUpload,
  validateFileSize,
} from './upload.js';
export type {
  UploadTask,
  UploadQueue,
  BeforeUploadResult,
  BeforeUploadDecision,
  UploadSizeError,
} from './upload.js';
export {
  fixedRange,
  buildOffsets,
  totalFromOffsets,
  offsetToIndex as virtualOffsetToIndex,
  dynamicRange,
  scrollOffsetForIndex,
  windowScrollTop,
  type VirtualRange,
  type ScrollAlign,
} from './virtual-list.js';
export {
  pageCount as paginationPageCount,
  clampPage,
  isPageInRange,
  clampPageSize,
  parseJumpInput,
} from './pagination.js';
export {
  clamp01 as colorClamp01,
  parseHex,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  hsvToHsl,
  hslToHsv,
  rgbToHsl,
  hslToRgb,
  hexToHsv,
  hsvToHex,
  formatColor,
  parseColor,
  type Rgb,
  type Hsv,
  type Hsl,
  type ColorFormat,
  type RgbToHexOptions,
  type FormatOptions,
} from './color.js';
export {
  buildRange as buildTimeRange,
  to12Hour,
  meridiemOf,
  from12Hour,
  buildHourOptions,
  buildMinuteOptions,
  buildSecondOptions,
  applyHideDisabled,
  isTimeDisabled,
  parseFormatSpec,
  formatTime,
  parseTimeString,
  type Meridiem,
  type TimeOption,
  type DisabledTime,
  type TimeParts,
  type FormatSpec,
} from './time.js';
