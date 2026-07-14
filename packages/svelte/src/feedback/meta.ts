/**
 * Machine-readable component metadata for AI/docs consumption.
 * 严格对齐 Semi Feedback API 表（content/feedback/feedback/index.md §API 参考）。
 */
export const meta = {
  name: 'Feedback',
  category: 'feedback',
  stage: 'M5',
  semiEquivalent: 'Feedback',
  description:
    '用户反馈收集弹窗：以 SideSheet(popup) 或 Modal(modal) 形态收集 emoji 评分 / 文本 / 单选 / 多选 / 自定义反馈。纯组合本库 SideSheet/Modal + TextArea/RadioGroup/CheckboxGroup/Button。',
  props: [
    { name: 'mode', type: "'popup' | 'modal'", default: 'popup', desc: '展示模式：popup=SideSheet 抽屉；modal=Modal 弹窗' },
    { name: 'type', type: "'text' | 'emoji' | 'radio' | 'checkbox' | 'custom'", default: 'emoji', desc: '反馈内容类型' },
    { name: 'onValueChange', type: '(value: string | string[] | Object) => void', default: '-', desc: '反馈内容变化时的回调' },
    { name: 'textAreaProps', type: 'TextAreaProps', default: '-', desc: '设置多行输入框的参数' },
    { name: 'radioGroupProps', type: 'RadioGroupProps', default: '-', desc: '设置单选的参数（含 options）' },
    { name: 'checkboxGroupProps', type: 'CheckboxGroupProps', default: '-', desc: '设置多选的参数（含 options）' },
    { name: 'renderContent', type: '(content: Snippet) => Snippet', default: '-', desc: '自定义反馈内容展示（接收已渲染的默认内容）' },
    { name: 'onOk', type: '(e) => void | Promise<any>', default: '-', desc: '点击确定回调，返回 promise 时 resolve 后自动关闭' },
    { name: 'onCancel', type: '(e) => void | Promise<any>', default: '-', desc: '取消回调，返回 promise 时 resolve 后自动关闭' },
    { name: 'okButtonProps', type: 'ButtonProps', default: '-', desc: '设置提交按钮的参数（type=custom 时可用 disabled 控制禁用）' },
    { name: 'cancelButtonProps', type: 'ButtonProps', default: '-', desc: '设置取消按钮的参数' },
    { name: 'afterClose', type: '() => void', default: '-', desc: '关闭后回调' },
    { name: '...rest', type: 'ModalProps | SideSheetProps', default: '-', desc: 'mode=modal 透传 ModalProps；mode=popup 透传 SideSheetProps（含 visible/title/footer/width 等）' },
  ],
  i18nKeys: ['Feedback.submit', 'Feedback.cancel'],
  a11y: {
    role: 'dialog',
    keyboard: ['Esc'],
    notes: [
      '外壳复用 Modal/SideSheet 的 role=dialog + focus-trap + Esc + 背景 inert',
      'emoji 为裸 span + click（对齐 Semi，无 role=radio / roving tabindex），补 Enter/Space 键盘触发',
    ],
  },
  examples: [
    { title: '基本使用（popup + emoji）', code: '<Feedback title="您对本产品的评分是？" visible={visible} onOk={...} onCancel={...} onValueChange={...} />' },
    { title: '文字类型', code: '<Feedback type="text" textAreaProps={{ maxCount: 200 }} visible={visible} onOk={...} onCancel={...} />' },
    { title: '单选反馈', code: "<Feedback type=\"radio\" radioGroupProps={{ options: ['访客','开发者','维护者'] }} visible={visible} />" },
    { title: '多选反馈', code: "<Feedback type=\"checkbox\" checkboxGroupProps={{ options: ['抖音','火山','豆包'] }} visible={visible} />" },
    { title: '自定义反馈内容', code: '<Feedback type="custom" okButtonProps={{ disabled: !value }} visible={visible}>{#snippet children()}...{/snippet}</Feedback>' },
    { title: '模态对话框形式', code: '<Feedback mode="modal" visible={visible} onOk={...} onCancel={...} />' },
  ],
  doNot: [
    '不要用它做通用表单——用 Form。',
    'type=custom 时须自行经 okButtonProps.disabled 控制提交禁用（对齐 Semi）。',
  ],
  tokens: [
    '--cd-color-feedback-thank-text',
    '--cd-width-feedback',
    '--cd-width-feedback-text',
    '--cd-spacing-feedback-emoji-container-column-gap',
    '--cd-spacing-feedback-emoji-container-margin-y',
    '--cd-spacing-feedback-thank-text-margin-top',
    '--cd-spacing-feedback-thank-text-margin-bottom',
    '--cd-spacing-feedback-checkbox-group-vertical-row-gap',
    '--cd-spacing-feedback-footer-column-gap',
    '--cd-spacing-feedback-sidesheet-bottom-right',
    '--cd-spacing-feedback-sidesheet-bottom-inner-wrap-bottom',
    '--cd-font-feedback-emoji-font-size',
    '--cd-font-feedback-thank-text-font-size',
    '--cd-font-feedback-thank-text-line-height',
    '--cd-font-feedback-thank-text-font-weight',
    '--cd-radius-feedback-sidesheet-inner',
  ],
} as const;
