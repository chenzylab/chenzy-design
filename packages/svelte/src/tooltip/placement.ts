import { parsePlacement, makePlacement, type Placement, type Side } from '@chenzy-design/core';

/**
 * Semi Design 的 12 方位 position 命名（top/topLeft/leftTop…）↔ core 的 side+align Placement。
 * Tooltip/Popover/Popconfirm 三者共享此映射（对齐 Semi 的继承链）。
 *
 * Semi 命名语义（见 semi-foundation/tooltip/arrow.scss）：
 *  - top/bottom 系：主轴纵向、交叉轴横向。Left=浮层左边缘对齐触发器左（align start）、
 *    Right=右边缘对齐（align end）、无后缀=居中。
 *  - left/right 系：主轴横向、交叉轴纵向。Top=浮层顶边缘对齐（align start）、
 *    Bottom=底边缘对齐（align end）、无后缀=居中。
 *  - leftTopOver/rightTopOver：Semi 特殊，浮层顶部与触发器顶部对齐并允许覆盖到触发器上方，
 *    定位语义等同 leftStart/rightStart（我们不做 over 覆盖，退化为 start 对齐）。
 */
export type Position =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTopOver'
  | 'rightTopOver';

/** Semi 12 方位可选值集合（对齐 semi-foundation/popover/constants POSITION_SET）。 */
export const POSITION_SET: readonly Position[] = [
  'top',
  'topLeft',
  'topRight',
  'left',
  'leftTop',
  'leftBottom',
  'right',
  'rightTop',
  'rightBottom',
  'bottom',
  'bottomLeft',
  'bottomRight',
  'leftTopOver',
  'rightTopOver',
] as const;

const POSITION_TO_PLACEMENT: Record<Position, Placement> = {
  top: 'top',
  topLeft: 'topStart',
  topRight: 'topEnd',
  bottom: 'bottom',
  bottomLeft: 'bottomStart',
  bottomRight: 'bottomEnd',
  left: 'left',
  leftTop: 'leftStart',
  leftBottom: 'leftEnd',
  right: 'right',
  rightTop: 'rightStart',
  rightBottom: 'rightEnd',
  leftTopOver: 'leftStart',
  rightTopOver: 'rightStart',
};

const PLACEMENT_TO_POSITION: Record<Placement, Position> = {
  top: 'top',
  topStart: 'topLeft',
  topEnd: 'topRight',
  bottom: 'bottom',
  bottomStart: 'bottomLeft',
  bottomEnd: 'bottomRight',
  left: 'left',
  leftStart: 'leftTop',
  leftEnd: 'leftBottom',
  right: 'right',
  rightStart: 'rightTop',
  rightEnd: 'rightBottom',
};

/** Semi position（如 topLeft）→ core Placement（如 topStart）。 */
export function positionToPlacement(position: Position): Placement {
  return POSITION_TO_PLACEMENT[position] ?? 'top';
}

/** core Placement（flip 后，如 bottomStart）→ Semi position（如 bottomLeft）。 */
export function placementToPosition(placement: Placement): Position {
  return PLACEMENT_TO_POSITION[placement] ?? 'top';
}

/** 取 placement 的主方向 side（驱动箭头朝向的 class）。 */
export function resolveSide(placement: Placement): Side {
  return parsePlacement(placement).side;
}

export { makePlacement, parsePlacement };
