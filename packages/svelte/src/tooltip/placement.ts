import { parsePlacement, type Placement, type Side } from '@chenzy-design/core';

/** 取 placement 的主方向 side（驱动箭头朝向的 class）。 */
export function resolveSide(placement: Placement): Side {
  return parsePlacement(placement).side;
}
