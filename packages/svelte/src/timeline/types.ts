import type { Snippet } from 'svelte';

export type TimelineItemType = 'default' | 'ongoing' | 'success' | 'warning' | 'error';
export type TimelineItemPosition = 'left' | 'right';

/**
 * dataSource 单项数据。对齐 Semi `Data extends TimelineItemProps { content }`：
 * 支持 content 属性及 Timeline.Item 的所有属性。content/time/dot/extra 可为字符串或 Snippet。
 */
export interface TimelineItemData {
  key?: string;
  content?: string | Snippet;
  time?: string | Snippet;
  color?: string;
  type?: TimelineItemType;
  dot?: string | Snippet;
  extra?: string | Snippet;
  position?: TimelineItemPosition;
  class?: string;
  style?: string;
  onClick?: (e: MouseEvent) => void;
}
