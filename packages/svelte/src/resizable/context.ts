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
}

export const RESIZE_GROUP_KEY = Symbol('cd-resize-group');
