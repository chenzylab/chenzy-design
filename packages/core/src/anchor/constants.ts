/**
 * Anchor constants — ported from Semi semi-foundation/anchor/constants.ts.
 * See specs/components/navigation/Anchor.spec.md §3.
 * 命名带 ANCHOR_ 前缀（Semi 原名 PREFIX/SIZE/SLIDE_COLOR/MAX_WIDTH/MAX_HEIGHT/POSITION_SET
 * 均为通用词，本库 core 主入口是扁平单一命名空间，避免与其他组件同名常量冲突）。
 */

export const ANCHOR_PREFIX = 'cd-anchor';

export const ANCHOR_SIZE = ['small', 'default'] as const;
export const ANCHOR_SLIDE_COLOR = ['primary', 'tertiary', 'muted'] as const;
export const ANCHOR_MAX_WIDTH = '200px';
export const ANCHOR_MAX_HEIGHT = '750px';

/** Semi POSITION_SET：Tooltip/Popover 12 方位 + 2 个 Over 变体（对齐 showTooltip position）。 */
export const ANCHOR_POSITION_SET = [
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
