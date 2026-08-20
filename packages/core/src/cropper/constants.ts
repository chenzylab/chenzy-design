/**
 * Cropper 常量。对齐 Semi semi-foundation/cropper/constants.ts 的 strings（角点/形状枚举）。
 * Semi 另含 cssClasses（class 名前缀表），本库 class 名固定写在渲染层（cd-cropper-*），不在此重复维护。
 */

/** 角点方向：4 角 + 4 边中点。（Semi strings.corner） */
export type CropperCorner = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br';

/** 裁切框形状。（Semi strings.shape） */
export type CropperShape = 'rect' | 'round' | 'roundRect';

/** 角点全集。（Semi strings.corner） */
export const CROPPER_CORNERS: readonly CropperCorner[] = [
  'tl',
  'tm',
  'tr',
  'ml',
  'mr',
  'bl',
  'bm',
  'br',
];

/** round 形状仅保留的 4 个边中点角点。（Semi strings.roundCorner） */
export const CROPPER_ROUND_CORNERS: readonly CropperCorner[] = ['tm', 'ml', 'mr', 'bm'];

/** 形状全集。（Semi strings.shape） */
export const CROPPER_SHAPES: readonly CropperShape[] = ['rect', 'round', 'roundRect'];
