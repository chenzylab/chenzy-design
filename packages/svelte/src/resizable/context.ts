/**
 * Shared context for the ResizeGroup / ResizeItem / ResizeHandler family.
 * Items and handlers register themselves declaratively (onMount) with the group.
 * Bookkeeping uses a PLAIN array (not $state) to avoid the Svelte 5 effect loop
 * described in AGENTS.md §9.3 — the group re-measures on a single trigger state.
 */
import type {
  GroupDirection,
  ResizeCallback,
  ResizeStartCallback,
} from '@chenzy-design/core';

export interface ResizeItemRegistration {
  /** stable id for ordering */
  id: number;
  getEl: () => HTMLElement | null;
  getMin: () => string | undefined;
  getMax: () => string | undefined;
  getDefaultSize: () => string | number | undefined;
  onResizeStart?: ResizeStartCallback | undefined;
  onChange?: ResizeCallback | undefined;
  onResizeEnd?: ResizeCallback | undefined;
}

export interface ResizeHandlerRegistration {
  id: number;
  getEl: () => HTMLElement | null;
  isDisabled: () => boolean;
}

export interface ResizeGroupContext {
  direction: () => GroupDirection;
  registerItem: (reg: ResizeItemRegistration) => () => void;
  registerHandler: (reg: ResizeHandlerRegistration) => () => void;
  /** Begin a drag from the handler with the given id. */
  startHandlerDrag: (handlerId: number, event: PointerEvent) => void;
  /** Keyboard adjust from a handler. */
  keyboardAdjust: (handlerId: number, delta: number, event: KeyboardEvent) => void;
  /** Read the group's split-axis size for a handler's aria-value. */
  itemSizeAround: (handlerId: number) => { last: number; next: number; parent: number };
  /**
   * 双击把手：折叠/展开该把手左（上）侧面板（本库独有增强，Semi 无内建折叠）。
   * 折叠时记住原尺寸、腾给邻居；再次双击恢复。返回折叠后状态。
   */
  toggleCollapse: (handlerId: number) => void;
}

export const RESIZE_GROUP_KEY = Symbol('cd-resize-group');
