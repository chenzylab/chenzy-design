/**
 * Component tokens for HotKeys — 严格镜像 Semi semi-foundation/hotKeys/variables.scss（8 个）。
 * 命名/值对齐 Semi：`$color-hotKeys-bg` → `--cd-color-hotkeys-bg` 等；值 `var(--semi-color-*)` →
 * `var(--cd-color-*)`，字面量原样（border 1px/radius 2px/height 20px/paddingY 2px/paddingX 8px=tight）。
 * 键位提示用 span（对齐 Semi，非 kbd）。见 plus 对齐工程。
 */
import type { TokenGroup } from './token-def.js';

export const hotKeysTokens = {
  // —— 键位块（对齐 Semi hotKeys-content：bg=fill-0/text=text-2） ——
  'color-hotkeys-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '键位块背景', usage: '单个键位块背景（对齐 Semi fill-0）' },
  'color-hotkeys-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '键位文字', usage: '键位块内文字/符号颜色（对齐 Semi text-2）' },
  // —— 分隔符（对齐 Semi hotKeys-split=text-0） ——
  'color-hotkeys-split': { value: 'var(--cd-color-text-0)', category: 'color', label: '分隔符', usage: '键位之间 + 分隔符颜色（对齐 Semi text-0）' },
  // —— 尺寸（对齐 Semi 字面量） ——
  'width-hotkeys-border': { value: '1px', category: 'width', label: '边框宽度', usage: '键位块边框宽度' },
  'radius-hotkeys': { value: '2px', category: 'radius', label: '圆角', usage: '键位块圆角（对齐 Semi 2px）' },
  'height-hotkeys': { value: '20px', category: 'height', label: '键位块高度', usage: '键位块高度（对齐 Semi 20px）' },
  'spacing-hotkeys-paddingY': { value: '2px', category: 'spacing', label: '纵向内边距', usage: '键位块纵向内边距（对齐 Semi 2px）' },
  'spacing-hotkeys-paddingX': { value: '8px', category: 'spacing', label: '横向内边距', usage: '键位块横向内边距（对齐 Semi tight=8px）' },
} satisfies TokenGroup;
