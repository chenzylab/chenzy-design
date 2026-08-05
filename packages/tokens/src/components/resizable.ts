/**
 * Component tokens for Resizable. 全量对齐 Semi Design
 * （semi-foundation/resizable/variables.scss，8 个尺寸/层级变量）。
 * 值与 Semi 逐一对应：row/col handler 10px、edge handler 20px、
 * group horizontal/vertical handler 10px、handler z-index 10、拖拽遮罩 z-index 20。
 *
 * 见 semi-foundation/resizable/variables.scss、resizable.scss。
 */
import type { TokenGroup } from './token-def.js';

export const resizableTokens = {
  // —— 层级 ——
  'z-index-resizable-handler': { value: '10', category: 'other', label: '把手层级', usage: '把手 z-index（对齐 Semi $z-resizable_handler）' },
  'z-index-resizable-background': { value: '20', category: 'other', label: '拖拽遮罩层级', usage: '拖拽中背景遮罩 z-index（对齐 Semi $z-resizable_background）' },

  // —— 单体（single）把手尺寸 ——
  'height-resizable-row-handler': { value: '10px', category: 'height', label: '上下把手高度', usage: '单体上/下边缘把手高度（对齐 Semi $height-row-handler）' },
  'width-resizable-col-handler': { value: '10px', category: 'width', label: '左右把手宽度', usage: '单体左/右边缘把手宽度（对齐 Semi $width-col-handler）' },
  'width-resizable-edge-handler': { value: '20px', category: 'width', label: '四角把手宽度', usage: '单体四角把手宽度（对齐 Semi $width-edge-handler）' },
  'height-resizable-edge-handler': { value: '20px', category: 'height', label: '四角把手高度', usage: '单体四角把手高度（对齐 Semi $height-edge-handler）' },

  // —— 分栏（group）把手尺寸 ——
  'width-resizable-horizontal-handler': { value: '10px', category: 'width', label: '水平分栏把手宽度', usage: 'ResizeGroup horizontal 把手宽度（对齐 Semi $width-horizontal-handler）' },
  'height-resizable-vertical-handler': { value: '10px', category: 'height', label: '垂直分栏把手高度', usage: 'ResizeGroup vertical 把手高度（对齐 Semi $height-vertical-handler）' },

  // —— 颜色 ——
  'color-resizable-handler-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '分栏把手背景色', usage: 'ResizeHandler 默认背景色（对齐 Semi var(--semi-color-fill-0)）' },
} satisfies TokenGroup;
