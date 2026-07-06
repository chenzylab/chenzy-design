/**
 * Component tokens for Feedback（M5 增补，对标 Semi 后补齐）。
 * Feedback 是纯组合：外壳视觉复用 Modal / SideSheet token，内容子控件（TextArea /
 * Radio / Checkbox）各自消费自身 token。此处仅登记 Feedback 自有的 emoji 评分行与
 * 内容区间距 token（spec §5）。值 var() 引 alias / global 层或字面量，无自引用。
 */
import type { TokenGroup } from './token-def.js';

export const feedbackTokens = {
  'feedback-emoji-size': { value: 'var(--cd-font-size-header-3)', category: 'font', label: 'emoji 尺寸', usage: 'emoji 表情字号（评分行）' },
  'feedback-emoji-gap': { value: 'var(--cd-spacing-base)', category: 'spacing', label: 'emoji 行间距', usage: 'emoji 表情之间的间距' },
  'feedback-emoji-active-scale': { value: '1.2', category: 'other', label: '选中放大', usage: '选中 emoji 的放大倍数' },
  'feedback-content-gap': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '内容区块间距', usage: '反馈内容区各区块之间的间距' },
} satisfies TokenGroup;
