import type { Direction } from '@chenzy-design/core';
import type { Snippet } from 'svelte';

/** Per-direction custom class names for Resizable handles. */
export type HandleClassName = Partial<Record<Direction, string>>;
/** Per-direction inline styles for Resizable handles. */
export type HandleStyle = Partial<Record<Direction, string>>;
/** Per-direction custom handle content for Resizable handles. */
export type HandleNode = Partial<Record<Direction, Snippet>>;
