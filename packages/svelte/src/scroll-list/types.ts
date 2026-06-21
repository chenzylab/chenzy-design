import type { ScrollListItem } from '@chenzy-design/core';

/** 列状态：空闲 / 加载中 / 空。 */
export type ScrollListStatus = 'idle' | 'loading' | 'empty';

/** 多列模式下单列配置项（columns 数组元素）。 */
export interface ScrollListColumn {
  /** 本列选项数据。 */
  data: ScrollListItem[];
  /** 本列是否循环滚动（覆盖全局 cyclic）。 */
  cyclic?: boolean;
  /** 本列加载/空状态（覆盖全局 status）。 */
  status?: ScrollListStatus;
  /** 本列无障碍标签。 */
  ariaLabel?: string;
  /** 本列滚到末尾触发加载更多（非 cyclic 有效）。 */
  onLoadMore?: () => void;
}
