/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Timeline',
  category: 'show',
  description:
    '时间轴，按时间顺序垂直/水平展示一组事件。两种用法择一：传 dataSource 数据驱动，或不传 dataSource 而在 children 内写 <Timeline.Item> 声明式（可放任意富内容）。支持 left/right/alternate/center 模式、vertical/horizontal 方向、pending 幽灵节点、reverse 倒序与实/虚线样式；交替布局由纯 CSS :nth-child 决定，两种用法共用同一套结构与样式。',
  props: [
    {
      name: 'dataSource',
      type: 'TimelineItemData[]',
      default: '[]',
      desc: '节点数据（数据驱动用法；优先于声明式 children）',
    },
    {
      name: 'children',
      type: 'Snippet',
      default: 'undefined',
      desc: '声明式用法：内嵌 <Timeline.Item> 列表，仅在未传 dataSource 时生效',
    },
    {
      name: 'mode',
      type: "'left'|'right'|'alternate'|'center'",
      default: 'left',
      desc: 'right 轴线在右、内容靠右对齐（left 镜像）；center 轴线居中、两侧内容朝轴对称对齐',
    },
    {
      name: 'direction',
      type: "'vertical'|'horizontal'",
      default: 'vertical',
      desc: '时间轴方向',
    },
    { name: 'reverse', type: 'boolean', default: 'false', desc: '倒序展示' },
    {
      name: 'pending',
      type: 'boolean|string',
      default: 'false',
      desc: '末尾追加幽灵节点，string 作为其内容',
    },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'lineStyle', type: "'solid'|'dashed'", default: 'solid' },
    {
      name: 'virtualized',
      type: 'boolean',
      default: 'false',
      desc: '虚拟化：长时间轴只渲染视口内项（复用 core fixedRange；仅 dataSource 模式生效，强制 vertical 列布局，轴线靠固定项高连续）',
    },
    {
      name: 'itemHeight',
      type: 'number',
      default: '56',
      desc: '虚拟化固定项高（px）',
    },
    {
      name: 'maxHeight',
      type: 'number|string',
      default: '400',
      desc: '虚拟化视口最大高（px 数字或 CSS 字符串）',
    },
    {
      name: 'overscan',
      type: 'number',
      default: '3',
      desc: '虚拟化上下缓冲项数',
    },
    {
      name: 'interactive',
      type: 'boolean',
      default: 'false',
      desc: 'roving tabindex 键盘漫游：项可聚焦，↑↓/←→ 移动焦点、Home/End 跳首尾、Enter/Space 触发项 onClick',
    },
    { name: 'class', type: 'string', default: "''" },
  ],
  subComponents: [
    {
      name: 'Timeline.Item',
      desc: '声明式单项，渲染 dot/line/内容（children），与 dataSource 项视觉一致',
      props: [
        { name: 'dotColor', type: 'string', default: 'undefined', desc: '圆点颜色' },
        { name: 'color', type: 'string', default: 'undefined', desc: '圆点颜色别名（与 dotColor 等价，dotColor 优先）' },
        {
          name: 'type',
          type: "'default'|'ongoing'|'success'|'warning'|'error'",
          default: 'undefined',
          desc: '语义类型，给圆点附加 cd-timeline__dot--{type} class',
        },
        { name: 'dot', type: 'Snippet', default: 'undefined', desc: '自定义圆点 snippet，提供时替代默认圆点' },
        {
          name: 'lineStyle',
          type: "'solid'|'dashed'",
          default: '继承父 Timeline',
          desc: '单项连接线样式',
        },
        { name: 'time', type: 'string', default: 'undefined', desc: '时间文本' },
        {
          name: 'position',
          type: "'left'|'right'",
          default: 'undefined',
          desc: '覆盖父 Timeline mode 的单项定位',
        },
        {
          name: 'extra',
          type: 'string | Snippet',
          default: 'undefined',
          desc: '时间旁辅助内容',
        },
        {
          name: 'onClick',
          type: '() => void',
          default: 'undefined',
          desc: 'interactive 模式下点击或 Enter/Space 触发',
        },
        { name: 'children', type: 'Snippet', default: 'undefined', desc: '项内容' },
      ],
    },
  ],
  a11y: {
    role: 'list',
    notes: [
      'ul/li 结构',
      '圆点与连接线 aria-hidden=true',
      '内容与时间为可读文本',
      'interactive：项 role=button + roving tabindex（焦点项 tabindex=0 其余 -1），↑↓/←→ 移动焦点、Home/End 跳首尾、Enter/Space 激活，aria-label 取节点内容',
    ],
  },
  tokens: ['--cd-timeline-*', '--cd-border-radius-full', '--cd-spacing-extra-tight', '--cd-font-size-small'],
} as const;
