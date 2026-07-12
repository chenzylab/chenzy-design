/**
 * Component tokens for Highlight (show). 纯展示文本高亮：命中片段的 <mark> 视觉。
 * 镜像 Semi highlight/variables.scss（.semi-highlight-tag 的 color / background-color /
 * font-weight）——Semi 仅这三条属性，无 radius、无 padding，故不额外引入。
 *   $color-highlight-text-default     → --cd-color-highlight     （亮 black / 暗 white）
 *   $color-highlight-text-bg-default  → --cd-color-highlight-bg  （亮 yellow-4 / 暗 yellow-2）
 *   $font-highlight-text-fontWeight: 600 → --cd-font-weight-bold （= 600）
 * 全部 var() 引用 alias/global（禁写死色值），暗色由 alias 层自动切换。
 */
import type { TokenGroup } from './token-def.js';

export const highlightTokens = {
  'highlight-color': { value: 'var(--cd-color-highlight)', category: 'color', label: '高亮文字色', usage: '命中片段文字色（Semi $color-highlight-text-default）：亮 black / 暗 white' },
  'highlight-bg': { value: 'var(--cd-color-highlight-bg)', category: 'color', label: '高亮背景色', usage: '命中片段背景色（Semi $color-highlight-text-bg-default）：亮 yellow-4 / 暗 yellow-2' },
  'highlight-font-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '高亮字重', usage: '命中片段字重（Semi $font-highlight-text-fontWeight = 600）' },
} satisfies TokenGroup;
