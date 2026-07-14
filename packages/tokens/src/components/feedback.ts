/**
 * Component tokens for Feedback。严格对齐 Semi Design
 * （semi-foundation/feedback/variables.scss，共 16 个），无自造中间变量。
 * Feedback 是纯组合：外壳视觉复用 Modal / SideSheet token，内容子控件（TextArea /
 * RadioGroup / CheckboxGroup / Button）各自消费自身 token。此处仅登记 Feedback 自有
 * 的 emoji 评分行、感谢文案、宽度、底部按钮与 sidesheet 定位 token。
 *
 * 映射约定（Semi → chenzy）：
 *   `var(--semi-color-text-2)` → `var(--cd-color-text-2)`
 *   `$font-size-regular`   → `var(--cd-font-size-regular)`
 *   `$font-weight-regular` → `var(--cd-font-weight-regular)`
 *   Semi 双词连接符 `_` → 本库连字符 `-`（camelCase 段拆成连字符，如 columnGap → column-gap）
 *   其余字面量（400px / 24px / 36px / 12px 等）原值保留。
 */
import type { TokenGroup } from './token-def.js';

export const feedbackTokens = {
  // —— Color（对齐 Semi variables.scss「color」段 1 个）——
  'color-feedback-thank-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '感谢文字色', usage: '感谢文字的文本颜色' },

  // —— Width（对齐 Semi「width」段 2 个）——
  'width-feedback': { value: '400px', category: 'width', label: '反馈宽度', usage: '除去文本类型外其他类型的宽度' },
  'width-feedback-text': { value: '600px', category: 'width', label: '文本反馈宽度', usage: '文本类型的宽度' },

  // —— Spacing（对齐 Semi「spacing」段 9 个）——
  'spacing-feedback-emoji-container-column-gap': { value: '24px', category: 'spacing', label: 'emoji 间距', usage: 'emoji容器中emoji的间距' },
  'spacing-feedback-emoji-container-margin-y': { value: '24px', category: 'spacing', label: 'emoji 容器上下间距', usage: 'emoji容器的上下间距' },
  'spacing-feedback-thank-text-margin-top': { value: '24px', category: 'spacing', label: '感谢文字顶部间距', usage: '感谢文字的文本的顶部间距' },
  'spacing-feedback-thank-text-margin-bottom': { value: '0px', category: 'spacing', label: '感谢文字底部间距', usage: '感谢文字的文本的底部间距' },
  'spacing-feedback-checkbox-group-vertical-row-gap': { value: '16px', category: 'spacing', label: '多选框组行间距', usage: '多选框组的行间距' },
  'spacing-feedback-footer-column-gap': { value: '12px', category: 'spacing', label: '底部按钮间距', usage: '底部按钮的间距' },
  'spacing-feedback-sidesheet-bottom-right': { value: '20px', category: 'spacing', label: '底部弹窗右间距', usage: '底部弹窗的右间距' },
  'spacing-feedback-sidesheet-bottom-inner-wrap-bottom': { value: '50px', category: 'spacing', label: '底部弹窗底部间距', usage: '底部弹窗的底部间距' },

  // —— Font（对齐 Semi「font」段 4 个）——
  'font-feedback-emoji-font-size': { value: '36px', category: 'font', label: 'emoji 字号', usage: 'emoji的大小' },
  'font-feedback-thank-text-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '感谢文字字号', usage: '感谢文字的文本大小' },
  'font-feedback-thank-text-line-height': { value: '20px', category: 'font', label: '感谢文字行高', usage: '感谢文字的文本行高' },
  'font-feedback-thank-text-font-weight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '感谢文字字重', usage: '感谢文字的文本字体粗细' },

  // —— Radius（对齐 Semi「radius」段 1 个）——
  'radius-feedback-sidesheet-inner': { value: '12px', category: 'radius', label: '底部弹窗圆角', usage: '底部弹窗的圆角' },
} satisfies TokenGroup;
