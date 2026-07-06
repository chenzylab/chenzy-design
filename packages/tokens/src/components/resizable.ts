/**
 * Component tokens for Resizable（M6 Other，单体 + 分栏组）。对齐 Semi
 * Resizable 的把手视觉，但 Semi 把手无独立 token（裸样式），故这里是 chenzy-design
 * 增强：把手命中区厚度 / 可视线色 / hover / focus / 分栏间隙。值为 var() 引用
 * alias / global token。见 specs/components/other/Resizable.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const resizableTokens = {
  'resizable-handle-size': {
    value: 'var(--cd-spacing-tight)',
    category: 'spacing',
    label: '把手命中区厚度',
    usage: '把手可交互命中区厚度（视觉线可细，命中区扩展满足触控 ≥24px）',
  },
  'resizable-handle-color': {
    value: 'var(--cd-color-border)',
    category: 'color',
    label: '把手可视线色',
    usage: '把手默认可视分隔线颜色',
  },
  'resizable-handle-color-hover': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '把手 hover/active 色',
    usage: 'hover 或拖拽中把手高亮色',
  },
  'resizable-handle-color-focus': {
    value: 'var(--cd-color-focus)',
    category: 'color',
    label: '把手键盘聚焦色',
    usage: '键盘聚焦时把手焦点环颜色',
  },
  'resizable-group-gap': {
    value: '0px',
    category: 'spacing',
    label: '分栏面板间隙',
    usage: '分栏组面板间隙（默认 0，把手本身占位）',
  },
} satisfies TokenGroup;
