/**
 * Component tokens for Cropper (M4 Show). 对齐 Semi semi-foundation/cropper/cropper.scss
 * 消费的 4 个 scss 变量：
 *   - $color-cropper_mask-bg        → 遮罩层背景（半透明暗色）
 *   - $color-cropper_box-outline    → 裁切框 outline 颜色（品牌色）
 *   - $width-cropper_box-outline    → 裁切框 outline 宽度
 *   - $color-cropper_box_corner-bg  → 角点背景（白）
 *   - $width-cropper_box_corner     → 角点宽高
 * 值走 alias/语义 token，禁写死。
 */
import type { TokenGroup } from './token-def.js';

export const cropperTokens = {
  'cropper-mask-bg': {
    value: 'var(--cd-color-overlay-bg)',
    category: 'color',
    label: '遮罩背景',
    usage: '裁切框外遮罩层背景色（半透明暗色）',
  },
  'cropper-box-outline-color': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '裁切框描边色',
    usage: '裁切框 outline 颜色',
  },
  'cropper-box-outline-width': {
    value: '1px',
    category: 'width',
    label: '裁切框描边宽',
    usage: '裁切框 outline 宽度',
  },
  'cropper-corner-bg': {
    value: 'var(--cd-color-bg-0)',
    category: 'color',
    label: '角点背景',
    usage: '裁切框 8 角点填充色',
  },
  'cropper-corner-size': {
    value: '10px',
    category: 'width',
    label: '角点尺寸',
    usage: '裁切框角点宽高',
  },
} satisfies TokenGroup;
