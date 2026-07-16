/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md 与 specs/components/input/PinCode.spec.md §10。
 */
export const meta = {
  name: 'PinCode',
  category: 'input',
  stage: 'M2',
  semiEquivalent: 'PinCode',
  description:
    '分格验证码 / OTP 输入组件：N 个受控单字符输入格，逐格填入、自动跳格、整串粘贴自动分发，支持数字/混合/RegExp/函数四种字符校验。',
  props: [
    { name: 'value', type: 'string', default: 'undefined', desc: '受控值；整串验证码，配合 onChange' },
    { name: 'defaultValue', type: 'string', default: "''", desc: '非受控初始值，仅初始化拆分' },
    { name: 'count', type: 'number', default: '6', desc: '验证码位数（格数）' },
    {
      name: 'format',
      type: "'number' | 'mixed' | RegExp | ((char: string) => boolean)",
      default: "'number'",
      desc: '单字符可输入范围；number→inputMode=numeric',
    },
    { name: 'size', type: "'small' | 'default' | 'large'", default: 'default', desc: '每格尺寸' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用全部格' },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'true',
      desc: '挂载聚焦第一格（对齐 Semi）；验证码场景通常立即输入，如需关闭传 autoFocus={false}',
    },
    { name: 'name', type: 'string', default: 'undefined', desc: '表单字段名，透传隐藏聚合 input（超越 Semi：Semi 无表单聚合能力）' },
    { name: 'id', type: 'string', default: '自动生成', desc: '根容器 id（超越 Semi：本库 a11y 分组约定）' },
    { name: 'ariaLabel', type: 'string', default: 'i18n 默认', desc: '无可视标签时分组辅助名（超越 Semi：Semi root 无 aria）' },
    { name: 'ariaLabelledby', type: 'string', default: 'undefined', desc: '外部 label id，优先于 ariaLabel（超越 Semi：Semi root 无 aria）' },
    { name: 'status', type: "'default' | 'warning' | 'error'", default: 'default', desc: '校验态（超越 Semi：Semi 单格外观固定，无校验态）' },
    { name: 'className', type: 'string', default: 'undefined', desc: '根容器类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根容器内联样式' },
    { name: 'onChange', type: '(value: string) => void', default: 'undefined', desc: '任一格变化触发，回传整串' },
    { name: 'onComplete', type: '(value: string) => void', default: 'undefined', desc: '填满末格触发一次，同时 blur 末格' },
  ],
  events: [
    { name: 'onChange', payload: '(value: string)', desc: '任一格值变化即触发（含清空）' },
    { name: 'onComplete', payload: '(value: string)', desc: '最后一格填入完成时触发一次' },
  ],
  methods: [
    { name: 'focus', signature: '(index?: number) => void', desc: '聚焦第 index 格（默认 0）' },
    { name: 'blur', signature: '(index?: number) => void', desc: '移出第 index 格焦点' },
  ],
  i18nKeys: ['PinCode.ariaLabel', 'PinCode.cellAriaLabel'],
  a11yPattern: 'group-of-inputs',
  a11y: {
    role: 'group',
    keyboard: ['ArrowLeft/ArrowRight', 'Backspace', 'Delete', 'Home', 'End', '自动跳格'],
    notes: [
      'root role=group + aria-label（i18n）或 aria-labelledby',
      '每格 aria-label 位次「第 N 位，共 M 位」',
      "每格 autoComplete=one-time-code（OTP 系统级填充，超越 Semi）",
      'inputMode 随 format（number→numeric）；maxlength=1',
      'status=error → 各格 aria-invalid；disabled → aria-disabled + 原生 disabled',
      'RTL：←→ 语义镜像；组合态（isComposing）不写入',
    ],
    keyboardMap: {
      ArrowLeft: '上一格（首格不越界；RTL 镜像）',
      ArrowRight: '下一格（末格不越界；RTL 镜像）',
      Backspace: '清空当前格并回退',
      Delete: '清空当前格并前进',
      char: '合法单字符写入后自动前进；填满末格 blur + onComplete',
      paste: '从当前格起逐字符分发，遇非法字符停止',
    },
  },
  tokens: [
    '--cd-pincode-gap-small',
    '--cd-pincode-gap-default',
    '--cd-pincode-gap-large',
    '--cd-pincode-cell-width-small',
    '--cd-pincode-cell-width-default',
    '--cd-pincode-cell-width-large',
    '--cd-pincode-cell-font-size',
    '--cd-pincode-cell-text-align',
  ],
  examples: [
    { title: '基础 6 位数字码', code: '<PinCode />' },
    { title: '4 位', code: '<PinCode count={4} />' },
    { title: 'mixed 字母数字', code: '<PinCode format="mixed" />' },
    { title: '受控', code: '<PinCode {value} onChange={(v) => (value = v)} />' },
    { title: 'error 态', code: '<PinCode status="error" />' },
    { title: 'onComplete 提交', code: '<PinCode onComplete={(v) => submit(v)} />' },
  ],
  doNot: [
    '不要写死格宽 / 颜色（用 token）',
    '不要漏单格 aria 位次',
  ],
} as const;
