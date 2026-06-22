import { getContext, setContext } from 'svelte';
import type { ListKey } from '@chenzy-design/core';

/**
 * List context — exposes selectable state to declarative <List.Item> children.
 * Getters keep reactivity to the parent List's props (reading a snapshot would
 * freeze the initial value). No mutable state stored here; selection toggling
 * goes through the parent's command (which calls the controlled onSelectionChange
 * — red line #1: never writes back to selectedKeys).
 */
export interface ListContext {
  /** Whether selectable is enabled (single|multiple). */
  getSelectable: () => false | 'single' | 'multiple';
  /** Whether row `key` is currently selected. */
  isSelected: (key: ListKey) => boolean;
  /** Request a selection toggle for row `key` (fires onSelectionChange only). */
  toggle: (key: ListKey, shiftKey: boolean) => void;
  /** Row vertical padding size class suffix. */
  getSize: () => 'small' | 'default' | 'large';
  /**
   * roving tabindex (pure derived): focused row / first DOM row is 0, others -1.
   * Red line #2: read-only during render, never writes parent $state.
   */
  rowTabindex: (key: ListKey) => 0 | -1;
  /** Row keydown: ↑↓ roving + Home/End + PageUp/Down (imperative focus()). */
  onRowKeydown: (event: KeyboardEvent, key: ListKey) => void;
  /** Sync focusedRowKey when a row gains focus. */
  onRowFocus: (key: ListKey) => void;
}

const KEY = Symbol('cd-list');

export function setListContext(ctx: ListContext): void {
  setContext(KEY, ctx);
}

export function getListContext(): ListContext | undefined {
  return getContext<ListContext | undefined>(KEY);
}
