/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Popover',
  category: 'show',
  description:
    '气泡卡片，点击/悬停/聚焦触发元素时弹出富内容浮层。支持标题、常用 position、对齐、箭头与间距，浮层纯 CSS 定位。',
  props: [
    { name: 'content', type: 'string | Snippet', default: 'undefined', desc: '简单文本内容' },
    { name: 'title', type: 'string | Snippet', default: 'undefined', desc: '标题，提供则渲染标题区与下边框' },
    { name: 'open', type: 'boolean', default: 'undefined', desc: '受控显隐' },
    { name: 'defaultOpen', type: 'boolean', default: 'false', desc: '非受控初始显隐' },
    { name: 'trigger', type: "'hover'|'click'|'focus'", default: 'hover', desc: '触发方式' },
    { name: 'position', type: "'top'|'bottom'|'left'|'right'", default: 'bottom', desc: '浮层主方向' },
    { name: 'align', type: "'start'|'center'|'end'", default: 'center', desc: '交叉轴对齐' },
    { name: 'showArrow', type: 'boolean', default: 'true', desc: '是否显示箭头' },
    { name: 'spacing', type: 'number', default: '8', desc: '浮层与触发器间距(px)' },
    { name: 'mouseEnterDelay', type: 'number', default: '100', desc: 'hover 进入延迟(ms)' },
    { name: 'mouseLeaveDelay', type: 'number', default: '100', desc: 'hover 离开延迟(ms)' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用触发' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '触发元素（必填）' },
    { name: 'contentSlot', type: 'Snippet', default: 'undefined', desc: '富内容，优先于 content' },
  ],
  a11y: {
    role: 'dialog',
    keyboard: ['Escape'],
    notes: [
      '浮层 role=dialog aria-modal=false，使用 useId 生成唯一 id',
      '触发元素 aria-haspopup=dialog + aria-expanded，open 时 aria-controls 指向浮层',
      'click 触发用 useDismiss 处理 Escape 与外部点击关闭',
    ],
  },
  tokens: ['--cd-popover-*', '--cd-spacing-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
