/**
 * Shared context for the ResizeGroup / ResizeItem / ResizeHandler family.
 * Items and handlers register themselves declaratively (onMount) with the group.
 * Bookkeeping uses a PLAIN array (not $state) to avoid the Svelte 5 effect loop
 * described in AGENTS.md §9.3 — the group re-measures on a single trigger state.
 */
import type {
  Direction,
  GroupDirection,
  ResizeCallback,
  ResizeStartCallback,
} from '@chenzy-design/core';
import type { Snippet } from 'svelte';

/** Per-direction custom class names for single Resizable handles. */
export type HandleClassName = Partial<Record<Direction, string>>;
/** Per-direction inline styles for single Resizable handles. */
export type HandleStyle = Partial<Record<Direction, string>>;
/** Per-direction custom handle content for single Resizable handles. */
export type HandleNode = Partial<Record<Direction, Snippet>>;

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
}

export const RESIZE_GROUP_KEY = Symbol('cd-resize-group');
