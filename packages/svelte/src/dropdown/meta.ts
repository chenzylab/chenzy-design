/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Dropdown',
  category: 'navigation',
  description:
    '下拉菜单，通过触发元素唤起一组可操作命令项。支持 hover/click/contextMenu 触发、嵌套子菜单、divider 分隔符、group 分组、useDismiss 关闭、键盘导航与危险项。',
  props: [
    {
      name: 'items',
      type: 'DropdownItem[]',
      default: '[]',
      desc: '菜单项数据；判别联合：普通项含 children 即可展开子菜单，type=divider 分隔符，type=group 分组标题',
    },
    {
      name: 'trigger',
      type: "'hover'|'click'|'contextMenu'",
      default: 'hover',
      desc: "触发方式；contextMenu 为右键唤起并定位到光标",
    },
    { name: 'open', type: 'boolean', default: 'undefined', desc: '受控显隐' },
    { name: 'defaultOpen', type: 'boolean', default: 'false', desc: '非受控初始显隐' },
    {
      name: 'position',
      type: "'bottomStart'|'bottomEnd'|'topStart'",
      default: 'bottomStart',
      desc: '浮层位置',
    },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用整个触发' },
    { name: 'closeOnSelect', type: 'boolean', default: 'true', desc: '点击项后自动关闭' },
    { name: 'closeOnEsc', type: 'boolean', default: 'true', desc: 'Esc 是否关闭' },
    { name: 'mouseEnterDelay', type: 'number', default: '150', desc: 'hover 进入延迟(ms)' },
    { name: 'mouseLeaveDelay', type: 'number', default: '150', desc: 'hover 离开延迟(ms)' },
    { name: 'onSelect', type: '(key: string|number) => void', default: 'undefined' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'triggerContent', type: 'Snippet', default: 'undefined', desc: '触发元素内容' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '自定义浮层内容（提供则忽略 items）' },
  ],
  a11y: {
    role: 'menu',
    keyboard: ['Enter', 'Space', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Escape'],
    notes: [
      '触发器 aria-haspopup=menu + aria-expanded + aria-controls',
      '浮层 role=menu，项 role=menuitem，焦点式 roving（tabindex=-1 + 方向键移动焦点）',
      '子菜单父项 aria-haspopup=menu + aria-expanded；→ 进入子菜单首项，← / Esc 逐层返回',
      'divider role=separator；group 组标题不可聚焦，组内项始终展开（role=group）',
      'useDismiss 处理外部点击与 Escape 关闭',
    ],
  },
  tokens: ['--cd-dropdown-*', '--cd-focus-ring', '--cd-radius-1', '--cd-spacing-*', '--cd-color-danger'],
} as const;
