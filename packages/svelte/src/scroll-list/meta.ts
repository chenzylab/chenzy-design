/**
 * Machine-readable component metadata for AI/docs consumption.
 * ScrollList — see specs/components/show/ScrollList.spec.md
 */
export const meta = {
  name: 'ScrollList',
  category: 'show',
  description:
    '滚轮选择器：JS 主导定位吸附居中，中央选区遮罩 + 上下渐隐，支持点击/键盘/拖拽选中、disabled 项跳过，受控 value 不回写仅通过 onChange 通知。单列（data）向后兼容；多列（columns）联动，值为各列组合数组。进阶能力：cyclic 循环滚动、惯性物理（pointer 拖拽 + 指数减速 + 预测吸附）、虚拟化（列项很多时只渲染视口）、loadMore（滚到末尾加载更多）、status（loading/empty 状态）。复用 @chenzy-design/core 纯函数（offsetToIndex/indexToOffset/keyboardTarget/wrapIndex/cyclicCenterIndex/cyclicRecenter/momentumStep/projectSettleIndex/fixedRange）。',
  exports: ['ScrollList'],
  props: [
    { name: 'value', type: 'string | number | (string|number)[]', default: 'undefined', desc: '受控选中值；多列为数组；受控时不回写' },
    { name: 'defaultValue', type: 'string | number | (string|number)[]', default: 'undefined', desc: '非受控初始值；多列为数组' },
    { name: 'data', type: 'ScrollListItem[]', default: '[]', desc: '单列选项数据（与 columns 互斥）' },
    { name: 'columns', type: 'ScrollListColumn[]', default: 'undefined', desc: '多列配置；提供时进入多列联动模式' },
    { name: 'cyclic', type: 'boolean', default: 'false', desc: '循环滚动（滚到底接回开头）；列级可覆盖' },
    { name: 'virtualized', type: 'boolean', default: 'false', desc: '虚拟化：列项很多时只渲染视口范围' },
    { name: 'overscan', type: 'number', default: '3', desc: '虚拟化视口上下缓冲行数' },
    { name: 'status', type: "'idle'|'loading'|'empty'", default: "'idle'", desc: '列状态；loading 显示加载中、empty 显示空文案' },
    { name: 'emptyText', type: 'string', default: 'i18n', desc: '空状态文案' },
    { name: 'loadingText', type: 'string', default: 'i18n', desc: '加载中文案' },
    { name: 'onLoadMore', type: '() => void', default: 'undefined', desc: '单列滚到末尾触发加载更多（非 cyclic）' },
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
  events: [
    { name: 'onChange', desc: '居中选中项变化（滚动落定 / 点击 / 键盘 / 拖拽惯性）；单列回调 {value,item,index}，多列回调 {value:数组,column}' },
    { name: 'onLoadMore', desc: '滚到末尾触发加载更多' },
  ],
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
    {
      title: '多列联动（年/月/日）',
      code: '<ScrollList columns={[{ data: years }, { data: months }, { data: days, cyclic: true }]} value={[2024, 2, 15]} onChange={(i) => (date = i.value)} />',
    },
    {
      title: 'cyclic 循环 + 惯性拖拽',
      code: '<ScrollList data={hours} cyclic defaultValue={12} />',
    },
    {
      title: '虚拟化 + loadMore + status',
      code: '<ScrollList data={big} virtualized status={loading ? "loading" : "idle"} onLoadMore={fetchMore} />',
    },
  ],
} as const;
