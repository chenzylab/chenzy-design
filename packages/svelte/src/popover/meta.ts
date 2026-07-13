/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 * 严格对齐 Semi Design semi-ui/popover 的 API 表。
 * 架构：Popover 封装 Tooltip（对齐 Semi `Popover extends Tooltip`），定位/触发/焦点/dismiss/箭头复用 Tooltip。
 */
export const meta = {
  name: 'Popover',
  category: 'show',
  description:
    '气泡卡片，点击/悬停/聚焦触发元素时弹出富内容浮层。封装 Tooltip（对齐 Semi 继承链），支持标题、12 方位 position、SVG 箭头、间距、custom 完全受控与 condition 条件触发，浮层命令式定位。',
  props: [
    {
      name: 'content',
      type: 'string | Snippet<[{ initialFocusRef }]>',
      default: 'undefined',
      desc: '浮层内容；Snippet 可接收 { initialFocusRef } 入参，绑定到浮层内元素打开时自动聚焦（对齐 Semi content 函数）',
    },
    { name: 'title', type: 'string | Snippet', default: 'undefined', desc: '标题，提供则渲染标题区与下边框' },
    { name: 'visible', type: 'boolean', default: 'undefined', desc: '受控显隐（配合 trigger=custom）' },
    { name: 'defaultVisible', type: 'boolean', default: 'false', desc: '非受控初始显隐' },
    {
      name: 'trigger',
      type: "'hover'|'click'|'focus'|'custom'",
      default: "'hover'",
      desc: "触发方式；custom 完全受控（仅 visible + onVisibleChange）。click/custom → dialog role，hover/focus → tooltip role",
    },
    {
      name: 'position',
      type: "'top'|'topLeft'|'topRight'|'left'|'leftTop'|'leftBottom'|'right'|'rightTop'|'rightBottom'|'bottom'|'bottomLeft'|'bottomRight'|'leftTopOver'|'rightTopOver'",
      default: "'bottom'",
      desc: '弹出方位（Semi 12 方位命名 + 2 Over）',
    },
    { name: 'autoAdjustOverflow', type: 'boolean', default: 'true', desc: '视口溢出时翻转到对侧' },
    { name: 'showArrow', type: 'boolean', default: 'false', desc: '是否显示 SVG 小三角（对齐 Semi 默认 false）' },
    {
      name: 'arrowPointAtCenter',
      type: 'boolean',
      default: 'true',
      desc: '小三角是否指向元素中心（需 showArrow）',
    },
    {
      name: 'arrowStyle',
      type: '{ borderColor?; backgroundColor?; borderOpacity? }',
      default: 'undefined',
      desc: '箭头颜色定制（border/bg/opacity）',
    },
    {
      name: 'spacing',
      type: 'number | { x: number; y: number }',
      default: 'showArrow ? 10 : 4',
      desc: '浮层与触发器距离(px)，缺省按 showArrow 取 10 / 4（对齐 Semi SPACING_WITH_ARROW / SPACING）',
    },
    {
      name: 'margin',
      type: 'number | { marginLeft; marginTop; marginRight; marginBottom }',
      default: '0',
      desc: '计算溢出翻转时增加的冗余安全边距',
    },
    { name: 'mouseEnterDelay', type: 'number', default: '50', desc: 'hover 进入延迟(ms)' },
    { name: 'mouseLeaveDelay', type: 'number', default: '50', desc: 'hover 离开延迟(ms)' },
    {
      name: 'condition',
      type: 'boolean',
      default: 'true',
      desc: 'false 时不响应 hover/click/focus 触发（custom 不受影响）',
    },
    { name: 'clickToHide', type: 'boolean', default: 'false', desc: '点击浮层及内部任一元素时自动关闭' },
    { name: 'keepDOM', type: 'boolean', default: 'false', desc: '关闭时保留浮层 DOM 不销毁（--hidden 隐藏）' },
    { name: 'disableFocusListener', type: 'boolean', default: 'false', desc: 'hover 触发时不响应键盘 focus 显隐' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用触发' },
    { name: 'motion', type: 'boolean', default: 'true', desc: '是否展示进出场动画，reduced-motion 退化' },
    {
      name: 'getPopupContainer',
      type: '() => HTMLElement | null | undefined',
      default: 'undefined',
      desc: '浮层挂载容器，缺省回退 ConfigProvider 全局，再回退 body',
    },
    { name: 'zIndex', type: 'number', default: 'undefined', desc: '浮层 z-index（缺省走 token --cd-popover-z = 1030）' },
    { name: 'closeOnEsc', type: 'boolean', default: 'true', desc: 'Esc 关闭浮层' },
    {
      name: 'guardFocus',
      type: 'boolean',
      default: "role==='dialog'",
      desc: '焦点处于浮层内时 Tab 是否循环（缺省随 dialog 模式）',
    },
    {
      name: 'returnFocusOnClose',
      type: 'boolean',
      default: 'true',
      desc: '关闭后焦点归还触发器（仅 guardFocus 时生效）',
    },
    { name: 'stopPropagation', type: 'boolean', default: 'false', desc: '阻止浮层上的点击事件冒泡' },
    { name: 'rePosKey', type: 'string | number', default: 'undefined', desc: '更新该值手动触发浮层重新定位' },
    { name: 'class', type: 'string', default: "''", desc: '浮层自定义类名' },
    { name: 'style', type: 'string', default: "''", desc: '浮层自定义内联样式' },
    { name: 'onVisibleChange', type: '(visible: boolean) => void', default: 'undefined', desc: '显隐切换回调' },
    { name: 'onClickOutSide', type: '(e: MouseEvent) => void', default: 'undefined', desc: '点击浮层与触发器外部的回调（仅 custom/click）' },
    { name: 'afterClose', type: '() => void', default: 'undefined', desc: '浮层完全关闭后的回调' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '触发元素（必填）' },
  ],
  a11y: {
    role: 'dialog | tooltip',
    keyboard: ['Escape', 'Tab', 'Shift+Tab'],
    notes: [
      'role 派生：trigger=click/custom → dialog（承可交互富内容，aria-modal=false，有标题 aria-labelledby、无标题兜底 aria-label Popover.dialogLabel）；hover/focus → tooltip',
      '触发元素在 dialog 模式承载 button 角色 + aria-haspopup=dialog / aria-expanded / aria-controls；tooltip 模式为纯 span + aria-describedby',
      'click/custom 触发用 useDismiss 处理 Escape（closeOnEsc）与外部点击（onClickOutSide）关闭',
      'dialog 模式 guardFocus 用 useFocusTrap 陷入焦点循环 Tab，关闭后 returnFocusOnClose 归还触发器',
      'content 函数形态可将初始焦点落到 initialFocusRef 指定元素；condition=false 禁止一切自动触发（custom 不受影响）',
      '定位/触发/焦点/dismiss/箭头全部复用 Tooltip（variant=popover），对齐 Semi Popover extends Tooltip',
    ],
  },
  tokens: [
    // Popover 浮层视觉（bg-3 白底 + 阴影 + medium 圆角，由 Tooltip variant=popover 提供）
    '--cd-color-popover-bg-default',
    '--cd-popover-shadow',
    '--cd-radius-popover',
    '--cd-filter-popover-bg',
    // 内层 renderPopCard：标题 / 带箭头内边距
    '--cd-spacing-popover-title-padding',
    '--cd-spacing-popover-witharrow-padding',
    '--cd-width-popover-title-border',
    '--cd-color-popover-border-default',
    '--cd-popover-title-color',
    // SVG 箭头配色（复用 Tooltip 箭头，variant 切 popover 默认色）
    '--cd-color-popover-arrow-bg',
    '--cd-color-popover-arrow-border',
    // 箭头尺寸（SVG 24×8 / 8×24，对齐 Semi）
    '--cd-width-popover-arrow',
    '--cd-height-popover-arrow',
    '--cd-width-popover-arrow-vertical',
    '--cd-height-popover-arrow-vertical',
    '--cd-popover-z',
    // 定位/motion 复用 Tooltip
    '--cd-tooltip-*',
    '--cd-motion-*',
  ],
} as const;
