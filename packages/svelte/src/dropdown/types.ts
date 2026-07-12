/**
 * Dropdown 类型定义。对齐 Semi Design（semi-ui/dropdown）：
 *  - DropdownItemType：Dropdown.Item 语义色，primary/secondary/tertiary/warning/danger。
 *  - DropdownMenuItem：menu prop 的 JSON Array 配置项（node=item/title/divider），
 *    透传 Item/Title/Divider 各自属性，快速声明式配置浮层内容。
 *
 * 无向后兼容包袱：不再提供旧的 items/DropdownItemNode 判别联合数据结构，
 * 声明式内容统一走 render（Dropdown.Menu/Item/Title/Divider）或 menu（JSON Array），与 Semi 一致。
 */
import type { Snippet } from 'svelte';

/** Dropdown 项键类型（选中回调携带）。 */
export type DropdownKey = string | number;

/** Dropdown.Item 语义色类型（对齐 Semi strings.ITEM_TYPE）。 */
export type DropdownItemType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'warning'
  | 'danger';

/** menu JSON 配置：普通项（node='item'）。透传 Dropdown.Item 属性。 */
export interface DropdownMenuItemItem {
  node: 'item';
  /** 菜单文本（Item 内容）。 */
  name?: string;
  /** 项键，选中回调携带。 */
  key?: DropdownKey;
  disabled?: boolean;
  /** 激活态：showTick 时左侧显示对勾、字重加粗。 */
  active?: boolean;
  /** 语义色。 */
  type?: DropdownItemType;
  /** 前置图标（Snippet）。 */
  icon?: Snippet;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onContextMenu?: (e: MouseEvent) => void;
}

/** menu JSON 配置：分组标题（node='title'）。 */
export interface DropdownMenuItemTitle {
  node: 'title';
  /** 标题文本。 */
  name?: string;
}

/** menu JSON 配置：分隔符（node='divider'）。 */
export interface DropdownMenuItemDivider {
  node: 'divider';
}

/**
 * menu prop 项：通过 JSON Array 快速配置 Dropdown 内容（对齐 Semi DropDownMenuItem）。
 * node 决定渲染为 Item / Title / Divider。
 */
export type DropdownMenuItem =
  | DropdownMenuItemItem
  | DropdownMenuItemTitle
  | DropdownMenuItemDivider;
