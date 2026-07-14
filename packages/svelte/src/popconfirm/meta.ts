/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 * 严格对齐 Semi Design semi-ui/popconfirm。Popconfirm 封装 Popover（对齐 Semi
 * `Popconfirm extends PopoverProps` + `<Popover content={renderConfirmPopCard}>`），
 * 复用 Popover→Tooltip 的全部定位/触发/焦点/dismiss/12 方位/箭头基建。
 * 无自造能力：无 type 分级 / 无 showCancel，风格由 icon + okType 搭配（对齐 Semi）。
 */
export const meta = {
  name: 'Popconfirm',
  category: 'feedback',
  description:
    '气泡确认框：目标元素操作需二次确认时使用。封装 Popover，内置确认/取消双按钮 + 可选右上角关闭按钮，比 Modal 更轻量。支持 title/content（content 可为函数注入 initialFocusRef）、icon（缺省 IconAlertTriangle）、okType/cancelType、okButtonProps/cancelButtonProps（含 autoFocus）、onConfirm/onCancel 返回 Promise 时对应按钮 loading（resolve 关闭 / reject 保持）、12 方位 position（默认 bottomLeft）。role=dialog non-modal。',
  exports: ['Popconfirm'],
  props: [
    { name: 'visible', type: 'boolean', default: 'undefined', desc: '受控显隐（配合 trigger=custom）；不回写，仅 onVisibleChange' },
    { name: 'defaultVisible', type: 'boolean', default: 'false', desc: '非受控初始显隐' },
    { name: 'title', type: 'string | Snippet', default: 'undefined', desc: '标题（文本或富文本 Snippet）' },
    { name: 'content', type: 'string | Snippet<[{ initialFocusRef }]>', default: 'undefined', desc: '正文；函数 Snippet 入参含 initialFocusRef，绑定后打开时聚焦（对齐 Semi）' },
    { name: 'icon', type: 'Snippet | false', default: '<IconAlertTriangle size="extra-large"/>', desc: '自定义图标；false 隐藏；缺省 IconAlertTriangle（警示色）' },
    { name: 'okText', type: 'string', default: "'确认'（locale）", desc: '确认按钮文字' },
    { name: 'cancelText', type: 'string', default: "'取消'（locale）", desc: '取消按钮文字' },
    { name: 'okType', type: "'primary'|'secondary'|'tertiary'|'warning'|'danger'", default: "'primary'", desc: '确认按钮类型（对齐 Semi）' },
    { name: 'cancelType', type: 'ButtonType', default: "'tertiary'", desc: '取消按钮类型（对齐 Semi）' },
    { name: 'okButtonProps', type: 'ExtraButtonProps', default: 'undefined', desc: '透传确认按钮额外属性（含 autoFocus；onclick/loading/theme 组件托管）' },
    { name: 'cancelButtonProps', type: 'ExtraButtonProps', default: 'undefined', desc: '透传取消按钮额外属性（含 autoFocus；onclick/loading/disabled 组件托管）' },
    { name: 'showCloseIcon', type: 'boolean', default: 'true', desc: '是否显示右上角关闭按钮（对齐 Semi）' },
    { name: 'position', type: "'top'|'topLeft'|...|'bottomRight' 等 12 方位", default: "'bottomLeft'", desc: '弹出方位（对齐 Semi 默认 bottomLeft）' },
    { name: 'trigger', type: "'click'|'hover'|'focus'|'custom'", default: "'click'", desc: '触发方式（对齐 Semi）' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '点击子元素是否弹出，false 不弹（对齐 Semi）' },
    { name: 'closeOnEsc', type: 'boolean', default: 'true', desc: 'Esc 关闭，受控时不生效（对齐 Semi）' },
    { name: 'arrowPointAtCenter', type: 'boolean', default: 'false', desc: '箭头指向触发元素中心（需 showArrow，对齐 Semi）' },
    { name: 'showArrow', type: 'boolean', default: 'false', desc: '是否显示箭头三角（对齐 Semi）' },
    { name: 'motion', type: 'boolean', default: 'true', desc: '入场动效（reduced-motion 退化）' },
    { name: 'mouseEnterDelay', type: 'number', default: '50', desc: 'hover 进入延迟(ms)' },
    { name: 'mouseLeaveDelay', type: 'number', default: '50', desc: 'hover 离开延迟(ms)' },
    { name: 'getPopupContainer', type: '() => HTMLElement', default: 'undefined', desc: '自定义浮层容器（对齐 Semi）' },
    { name: 'zIndex', type: 'number', default: '1030', desc: '浮层层级（对齐 Semi）' },
    { name: 'guardFocus', type: 'boolean', default: 'true', desc: 'Tab 焦点在浮层内循环（对齐 Semi）' },
    { name: 'returnFocusOnClose', type: 'boolean', default: 'true', desc: 'Esc 后焦点回到 trigger（仅 click，对齐 Semi）' },
    { name: 'stopPropagation', type: 'boolean', default: 'true', desc: '阻止浮层内事件冒泡（对齐 Semi）' },
    { name: 'rePosKey', type: 'string | number', default: 'undefined', desc: '手动触发重新定位' },
    { name: 'class', type: 'string', default: "''", desc: '卡片自定义类名（对齐 Semi className）' },
    { name: 'style', type: 'string', default: "''", desc: '卡片自定义内联样式（对齐 Semi）' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '触发元素（必填）' },
    { name: 'onVisibleChange', type: '(visible: boolean) => void', default: 'undefined', desc: '显隐切换回调（对齐 Semi）' },
    { name: 'onClickOutSide', type: '(e: MouseEvent) => void', default: 'undefined', desc: '点击浮层外部回调（对齐 Semi）' },
    { name: 'onEscKeyDown', type: '(e: KeyboardEvent) => void', default: 'undefined', desc: 'trigger/浮层按 Esc 回调（对齐 Semi）' },
    { name: 'onConfirm', type: '(e: MouseEvent) => void | Promise<unknown>', default: 'undefined', desc: '确认回调；返回 Promise 时按钮 loading，resolve 关闭 / reject 保持' },
    { name: 'onCancel', type: '(e: MouseEvent) => void | Promise<unknown>', default: 'undefined', desc: '取消回调；返回 Promise 时按钮 loading，resolve 关闭 / reject 保持' },
  ],
  a11y: {
    role: 'dialog',
    keyboard: ['Escape', 'Tab', 'Shift+Tab', 'Enter', 'Space'],
    notes: [
      '浮层 role=dialog（aria-modal=false，复用 Popover），aria-labelledby 指向 Popconfirm 标题',
      '触发元素承载 role=button + aria-haspopup=dialog + aria-expanded/controls（复用 Popover dialog 语义）',
      'guardFocus（默认 true）用 useFocusTrap 陷入焦点，关闭后 returnFocusOnClose 归还触发器',
      'okButtonProps/cancelButtonProps.autoFocus 或 content 函数 initialFocusRef 控制打开时初始焦点（对齐 Semi）',
      'closeOnEsc 与外部点击关闭复用 Popover→Tooltip 的 useDismiss',
    ],
  },
  tokens: [
    // Popconfirm 卡片消费 token（正名，值全量对齐 Semi popconfirm/variables.scss；无自造中间层）
    '--cd-color-popconfirm-header-text',
    '--cd-color-popconfirm-body-text',
    '--cd-color-popconfirm-header-alert-icon',
    '--cd-width-popconfirm-icon',
    '--cd-width-popconfirm-maxwidth',
    '--cd-spacing-popconfirm-top',
    '--cd-spacing-popconfirm-bottom',
    '--cd-spacing-popconfirm-header-title-marginbottom',
    '--cd-spacing-popconfirm-header-icon-marginright',
    '--cd-spacing-popconfirm-footer-margintop',
    '--cd-spacing-popconfirm-footer-btn-marginright',
    '--cd-spacing-popconfirm-body-p-margin',
    '--cd-spacing-popconfirm-body-p-padding',
    '--cd-font-popconfirm-header-title-fontweight',
    '--cd-font-size-header-6',
    // 卡面/定位/箭头复用 Popover→Tooltip
    '--cd-popover-*',
    '--cd-tooltip-*',
  ],
} as const;
