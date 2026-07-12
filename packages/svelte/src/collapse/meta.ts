/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 * API / tokens 全面对齐 Semi Design collapse。
 */
export const meta = {
  name: 'Collapse',
  category: 'show',
  description:
    '折叠面板，可展开或折叠展示内容区域。用 <Collapse.Panel itemKey header> 声明面板，支持受控 activeKey、accordion 手风琴、clickHeaderToExpand、自定义 expandIcon/collapseIcon、keepDOM/lazyRender、展开动画。DOM/API/tokens 对齐 Semi。',
  props: [
    { name: 'accordion', type: 'boolean', default: 'false', desc: '手风琴模式，每次只允许展开一个面板' },
    { name: 'activeKey', type: 'string|string[]', default: 'undefined', desc: '受控属性，当前展开的面板 key（仅 onChange 不回写）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '样式类名' },
    { name: 'clickHeaderToExpand', type: 'boolean', default: 'true', desc: '点击 Header 展开收起，否则只响应点击箭头' },
    { name: 'collapseIcon', type: 'Snippet', default: 'IconChevronUp', desc: '自定义折叠图标（展开态显示）' },
    { name: 'defaultActiveKey', type: 'string|string[]', default: 'undefined', desc: '初始化选中面板的 key' },
    { name: 'expandIcon', type: 'Snippet', default: 'IconChevronDown', desc: '自定义展开图标（收起态显示）' },
    { name: 'expandIconPosition', type: "'left'|'right'", default: 'right', desc: '展开图标位置' },
    { name: 'keepDOM', type: 'boolean', default: 'false', desc: '是否保留隐藏的面板 DOM 树，默认销毁' },
    { name: 'lazyRender', type: 'boolean', default: 'false', desc: '配合 keepDOM，为 true 时挂载时不渲染内容' },
    { name: 'motion', type: 'boolean', default: 'true', desc: '是否开启动画' },
    { name: 'style', type: 'string', default: 'undefined', desc: '内联 CSS 样式' },
    { name: 'onChange', type: '(activeKey: string[], event: MouseEvent) => void', default: 'undefined', desc: '切换面板的回调' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '内嵌 <Collapse.Panel> 列表' },
  ],
  subcomponents: [
    {
      name: 'Collapse.Panel',
      desc: '单面板，经 Object.assign(Collapse, { Panel }) 导出，父子状态用 context 传递（同 Timeline.Item / Form.Field 复合模式）。DOM 对齐 Semi collapse/item：header role=button，content 用 Collapsible 原语折叠。',
      props: [
        { name: 'itemKey', type: 'string', default: '(required)', desc: '必填且唯一，匹配 activeKey / defaultActiveKey' },
        { name: 'header', type: 'string', default: 'undefined', desc: '面板头文本（string 时渲染 header-right + extra）' },
        { name: 'head', type: 'Snippet', default: 'undefined', desc: '面板头富内容插槽（ReactNode 语义，优先于 header）' },
        { name: 'extra', type: 'Snippet|string', default: 'undefined', desc: '右上角辅助内容（仅 header 为 string 且未用 head 时生效）' },
        { name: 'disabled', type: 'boolean', default: 'false', desc: '面板是否被禁用' },
        { name: 'showArrow', type: 'boolean', default: 'true', desc: '是否展示箭头' },
        { name: 'reCalcKey', type: 'number|string', default: 'undefined', desc: 'reCalcKey 改变时重算内容高度（动态内容用）' },
        { name: 'onMotionEnd', type: '() => void', default: 'undefined', desc: '动画结束回调' },
        { name: 'children', type: 'Snippet', default: 'undefined', desc: '面板内容' },
      ],
    },
  ],
  a11y: {
    role: 'button',
    keyboard: ['Tab', 'Enter', 'Space'],
    notes: [
      '面板 header 为 role=button，aria-expanded 标记展开态',
      'header aria-owns 指向内容区，内容区 aria-hidden 随展开态切换',
      'header aria-disabled 与 disabled 属性同步',
      '箭头图标 aria-hidden=true',
    ],
  },
  tokens: [
    // Semi collapse/variables.scss 全量对齐（20），组件直接消费（无中间变量）
    '--cd-color-collapse-item-border-default',
    '--cd-color-collapse-header-text-default',
    '--cd-color-collapse-header-text-disabled',
    '--cd-color-collapse-header-icon-default',
    '--cd-color-collapse-header-bg-hover',
    '--cd-color-collapse-header-bg-active',
    '--cd-color-collapse-content-text-default',
    '--cd-font-collapse-header-fontweight',
    '--cd-spacing-collapse-header-marginx',
    '--cd-spacing-collapse-header-marginy',
    '--cd-spacing-collapse-header-padding',
    '--cd-spacing-collapse-right-paddingright',
    '--cd-spacing-collapse-header-iconleft-marginright',
    '--cd-spacing-collapse-content-paddingtop',
    '--cd-spacing-collapse-content-paddingright',
    '--cd-spacing-collapse-content-paddingbottom',
    '--cd-spacing-collapse-content-paddingleft',
    '--cd-radius-collapse-header',
    '--cd-width-collapse-item-border',
    '--cd-size-collapse-icon-default',
    // 组件另消费的共享基元
    '--cd-color-disabled-text',
    '--cd-font-size-regular',
    '--cd-line-height-regular',
    '--cd-focus-ring',
  ],
} as const;
