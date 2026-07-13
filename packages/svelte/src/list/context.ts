import { getContext, setContext } from 'svelte';

/**
 * List grid 配置（对齐 Semi `Grid extends RowProps, ColProps`）。
 * gutter/align/justify/wrap 作用于 Row 容器；span/offset/order/push/pull/flex 与
 * 响应式断点 xs..xxl 作用于每个 Item 外层的 Col。List 拆分后经 context 下发给 Item。
 */
export interface ListGrid {
  gutter?: number | [number, number];
  align?: 'top' | 'middle' | 'bottom' | 'baseline' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  span?: number;
  offset?: number;
  order?: number;
  push?: number;
  pull?: number;
  flex?: string | number;
  xs?: number | Record<string, unknown>;
  sm?: number | Record<string, unknown>;
  md?: number | Record<string, unknown>;
  lg?: number | Record<string, unknown>;
  xl?: number | Record<string, unknown>;
  xxl?: number | Record<string, unknown>;
}

/**
 * List context —— 对齐 Semi ListContext（list-context.ts）。
 * 向 <List.Item> 下发 grid 配置与 List 级 onClick/onRightClick 回退。
 * getter 保持对 List props 的响应性（读快照会冻结初值）。
 */
export interface ListContext {
  /** grid 配置；存在时 Item 用 Col 包裹自身。 */
  getGrid: () => ListGrid | undefined;
  /** List 级点击回退（Item 未自带 onClick 时使用）。 */
  getOnClick: () => ((e: MouseEvent) => void) | undefined;
  /** List 级右键回退（Item 未自带 onRightClick 时使用）。 */
  getOnRightClick: () => ((e: MouseEvent) => void) | undefined;
}

const KEY = Symbol('cd-list');

export function setListContext(ctx: ListContext): void {
  setContext(KEY, ctx);
}

export function getListContext(): ListContext | undefined {
  return getContext<ListContext | undefined>(KEY);
}
