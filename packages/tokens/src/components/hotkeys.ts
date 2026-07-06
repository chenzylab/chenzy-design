/**
 * Component tokens for HotKeys（快捷键组合的可见键位提示）。
 * 键位块用语义化 <kbd> 承载，本文件定义其填充式外观（背景/边框/文字/圆角/字号/内边距）
 * 与 `+` 分隔符色、键位间距。默认引用 Alias（暗色仅靠 Alias 重映射即生效）。
 * 见 specs/components/other/HotKeys.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const hotKeysTokens = {
  // —— 键位块外观 ——
  'hotkeys-content-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '键位块背景', usage: '单个 <kbd> 键位块背景' },
  'hotkeys-content-border': { value: 'var(--cd-color-border)', category: 'color', label: '键位块边框', usage: '单个键位块边框色' },
  'hotkeys-content-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '键位文字色', usage: '键位块内文字/符号颜色' },
  'hotkeys-content-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '键位块圆角', usage: '键位块圆角' },
  // spec §5 记 --cd-font-size-body-small，但库内无此别名；改用等价 --cd-font-size-small（12px）。
  'hotkeys-content-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '键位字号', usage: '键位块字号' },
  'hotkeys-content-padding': { value: 'var(--cd-spacing-super-tight) var(--cd-spacing-extra-tight)', category: 'spacing', label: '键位块内边距', usage: '键位块内边距' },
  // —— 分隔符 / 间距 ——
  'hotkeys-split-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '分隔符色', usage: '键位之间 + 分隔符颜色' },
  'hotkeys-gap': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '键位间距', usage: '相邻键位块之间的间距' },
} satisfies TokenGroup;
