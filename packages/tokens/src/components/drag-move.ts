/**
 * Component tokens for DragMove（M6 Other）。DragMove 主要是行为，视觉极少：
 * 仅拖拽把手光标可定制。见 specs/components/other/DragMove.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const dragMoveTokens = {
  'dragmove-cursor': {
    value: 'move',
    category: 'other',
    label: '拖拽把手光标',
    usage: '拖拽把手的鼠标光标（默认 move）',
  },
} satisfies TokenGroup;
