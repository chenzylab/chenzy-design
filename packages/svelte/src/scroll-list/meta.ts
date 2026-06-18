/**
 * Machine-readable component metadata for AI/docs consumption.
 * ScrollList — see specs/components/show/ScrollList.spec.md
 */
export const meta = {
  name: 'ScrollList',
  category: 'show',
  description:
    '滚轮选择器（单列子集）：基于浏览器原生 CSS scroll-snap 吸附居中，中央选区遮罩 + 上下渐隐，支持点击/键盘选中、disabled 项跳过，受控 value 不回写仅通过 onChange 通知。复用 @chenzy-design/core 的纯函数（offsetToIndex/indexToOffset/keyboardTarget 等）。本子集：多列联动 / 惯性物理 / cyclic 循环 / 虚拟化 / loadMore / status 均延后。',
  exports: ['ScrollList'],
  props: [
    { name: 'value', type: 'string | number', default: 'undefined', desc: '受控选中值；受控时不回写' },
    { name: 'defaultValue', type: 'string | number', default: 'undefined', desc: '非受控初始值' },
    { name: 'data', type: 'ScrollListItem[]', default: '[]', desc: '单列选项数据' },
    {
      name: 'size',
      type: "'small'|'default'|'large'",
      default: "'default'",
      desc: '决定 itemHeight 28/36/44',
    },
    { name: 'rows', type: 'number', default: '5', desc: '可见行数（奇数）' },
    { name: 'itemHeight', type: 'number', default: 'undefined', desc: '显式覆盖 size 推导的行高' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁止滚动与选中交互' },
    { name: 'ariaLabel', type: 'string', default: "'滚动选择'", desc: 'listbox 无障碍标签' },
    {
      name: 'renderItem',
      type: 'Snippet<[{ item; selected; index }]>',
      default: 'undefined',
      desc: '自定义单项渲染',
    },
    {
      name: 'onChange',
      type: '(info: { value; item; index }) => void',
      default: 'undefined',
      desc: '选中变化回调',
    },
  ],
  events: [{ name: 'onChange', desc: '居中选中项变化（滚动落定 / 点击 / 键盘）' }],
  slots: [{ name: 'renderItem', desc: '自定义单项渲染，提供 item/selected/index' }],
  a11y: {
    hasRole: true,
    focusable: true,
    note: 'role=listbox + aria-orientation=vertical + aria-activedescendant 指向居中项；每项 role=option + aria-selected；单一 tab stop；键盘 ArrowUp/Down、PageUp/Down、Home/End 移动选中，disabled 项自动跳过。',
  },
  tokens: [
    '--cd-scrolllist-item-height',
    '--cd-scrolllist-item-height-small',
    '--cd-scrolllist-item-height-large',
    '--cd-scrolllist-color-text',
    '--cd-scrolllist-color-text-adjacent',
    '--cd-scrolllist-color-text-disabled',
    '--cd-scrolllist-mask-bg',
    '--cd-scrolllist-mask-border',
    '--cd-scrolllist-gradient-color',
    '--cd-scrolllist-border-color',
    '--cd-scrolllist-radius',
    '--cd-scrolllist-transition',
  ],
  responsive: false,
  examples: [
    {
      title: '基础数字选择',
      code: '<ScrollList data={hours} defaultValue={9} onChange={(i) => (v = i.value)} />',
    },
    {
      title: '自定义渲染',
      code: '<ScrollList data={list}>{#snippet renderItem({ item, selected })}<span class:on={selected}>{item.label}</span>{/snippet}</ScrollList>',
    },
  ],
} as const;
