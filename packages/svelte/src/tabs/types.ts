import type { Snippet } from 'svelte';

export interface TabItem {
  tab: string;
  itemKey: string | number;
  /** 标签文字前渲染的图标（对齐 Semi PlainTab.icon）。 */
  icon?: Snippet;
  disabled?: boolean;
  closable?: boolean;
}
