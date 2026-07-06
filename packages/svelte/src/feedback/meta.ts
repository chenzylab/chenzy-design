/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md 与 specs/components/feedback/Feedback.spec.md。
 */
export const meta = {
  name: 'Feedback',
  category: 'feedback',
  stage: 'M5',
  semiEquivalent: 'Feedback',
  description:
    '用户反馈收集弹窗：以 Modal 或 SideSheet 形态收集 emoji 评分 / 文本 / 单选 / 多选 / 自定义反馈。纯组合本库 Modal/SideSheet + TextArea/Radio/Checkbox。',
  props: [
    { name: 'mode', type: "'modal' | 'popup'", default: 'modal', desc: '呈现形态：modal=Modal 弹窗；popup=SideSheet 抽屉' },
    { name: 'type', type: "'text' | 'emoji' | 'radio' | 'checkbox' | 'custom'", default: 'undefined', desc: '反馈类型' },
    { name: 'value', type: 'FeedbackValue', default: 'undefined', desc: '反馈值：string | string[] | { emoji?; text? }（EmojiResult）' },
    { name: 'onValueChange', type: '(value: FeedbackValue) => void', default: 'undefined', desc: '反馈值变化' },
    { name: 'options', type: 'FeedbackOption[]', default: 'undefined', desc: 'radio/checkbox 类型的可选项（label/value/disabled）' },
    { name: 'textAreaProps', type: 'TextAreaProps', default: 'undefined', desc: '文本输入透传本库 TextArea props' },
    { name: 'renderContent', type: 'Snippet<[{ value; setValue }]>', default: 'undefined', desc: '自定义/包裹反馈内容区' },
    { name: 'onOk', type: '(e) => void | Promise<any>', default: 'undefined', desc: '提交回调（可异步，await 期间外壳 loading）' },
    { name: 'onCancel', type: '() => void | Promise<any>', default: 'undefined', desc: '取消回调' },
    { name: 'afterClose', type: '() => void', default: 'undefined', desc: '关闭后回调' },
    { name: 'open', type: 'boolean', default: 'undefined', desc: '显隐（受控，透传外壳）' },
    { name: 'title', type: 'string', default: 'undefined', desc: '标题（透传外壳）' },
    { name: 'width', type: 'number | string', default: 'undefined', desc: '宽度（透传外壳）' },
    { name: 'placement', type: "'left' | 'right' | 'top' | 'bottom'", default: 'right', desc: 'popup 抽屉位置（mode=popup）' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined', desc: '显隐意图变化（受控）' },
    { name: 'emojis', type: 'string[]', default: '5 档满意度表情', desc: 'emoji 类型的表情序列' },
  ],
  i18nKeys: [
    'Feedback.submit',
    'Feedback.cancel',
    'Feedback.placeholder',
    'Feedback.ratingLabel',
    'Feedback.emojiVeryBad',
    'Feedback.emojiBad',
    'Feedback.emojiNeutral',
    'Feedback.emojiGood',
    'Feedback.emojiVeryGood',
  ],
  a11y: {
    role: 'dialog',
    keyboard: ['ArrowRight/Down', 'ArrowLeft/Up', 'Home', 'End'],
    notes: [
      '外壳复用 Modal/SideSheet 的 role=dialog + focus-trap + Esc + 背景 inert',
      'emoji 评分 role=radiogroup + 每个 emoji role=radio + aria-label（语义走 i18n）',
      'emoji 键盘方向键选择（roving tabindex），对齐 Rating 模式',
      '提交 loading 时按钮 aria-busy',
    ],
  },
  examples: [
    { title: 'emoji 满意度', code: "<Feedback type=\"emoji\" open {value} onValueChange={...} />" },
    { title: '文本反馈', code: "<Feedback type=\"text\" open {value} onValueChange={...} />" },
    { title: '单选原因', code: "<Feedback type=\"radio\" {options} open onValueChange={...} />" },
    { title: '多选', code: "<Feedback type=\"checkbox\" {options} open onValueChange={...} />" },
    { title: '自定义内容', code: "<Feedback type=\"custom\" open>{#snippet renderContent()}...{/snippet}</Feedback>" },
    { title: 'popup 抽屉形态', code: "<Feedback mode=\"popup\" type=\"emoji\" open />" },
  ],
  doNot: [
    '不要用它做通用表单——用 Form。',
    'emoji 评分必须有语义 aria-label（走 i18n），不可只有表情字符。',
  ],
  tokens: [
    '--cd-feedback-emoji-size',
    '--cd-feedback-emoji-gap',
    '--cd-feedback-emoji-active-scale',
    '--cd-feedback-content-gap',
  ],
} as const;
