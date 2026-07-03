/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Tabs',
  category: 'navigation',
  description:
    '标签页，在同一区域内组织并切换多组对等内容。支持 line/card/button 类型、数据驱动 tabList 或纯声明式 <Tabs.Pane> 自动收集、renderTabBar 自定义标签栏、roving tabindex 键盘导航、可关闭标签与溢出滚动/下拉收纳（overflow）。',
  props: [
    { name: 'value', type: 'string|number', default: 'undefined', desc: '受控选中标签 key' },
    { name: 'defaultValue', type: 'string|number', default: '首个标签', desc: '非受控初始 key' },
    { name: 'type', type: "'line'|'card'|'button'", default: 'line', desc: '视觉风格（button=分段按钮组）' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    {
      name: 'tabPosition',
      type: "'top'|'bottom'|'left'|'right'",
      default: 'top',
      desc: '标签栏位置',
    },
    { name: 'lazy', type: 'boolean', default: 'false', desc: '首次激活后才挂载面板' },
    { name: 'keepDOM', type: 'boolean', default: 'false', desc: '激活过的面板保留 DOM' },
    {
      name: 'tabList',
      type: 'TabItem[]',
      default: 'undefined',
      desc: '数据驱动标签定义；不传则从子 <Tabs.Pane> 的 tab/itemKey/disabled/closable 纯声明式自动收集',
    },
    { name: 'closable', type: 'boolean', default: 'false', desc: '全局可关闭（单项可覆盖）' },
    {
      name: 'addable',
      type: 'boolean',
      default: 'false',
      desc: '标签栏末尾显示「+」按钮，点击触发 onAdd（受控，由父组件追加）',
    },
    {
      name: 'keyboardActivation',
      type: "'auto'|'manual'",
      default: 'auto',
      desc: '方向键聚焦即激活 / 需 Enter/Space 激活',
    },
    {
      name: 'overflow',
      type: "'scroll'|'dropdown'",
      default: 'scroll',
      desc: '横向溢出处理：scroll 前/后滚动箭头；dropdown 收纳进末尾「更多」下拉（仅 top/bottom 生效，纵向始终滚动）',
    },
    {
      name: 'collapsible',
      type: 'boolean',
      default: 'false',
      desc: 'line 风格横向溢出时启用折叠收纳（便捷开关，等价 overflow=dropdown：放不下的标签进末尾「更多」下拉，仅 top/bottom 生效）',
    },
    {
      name: 'more',
      type: "number | { count?: number; render?: Snippet; dropdownProps?: object }",
      default: 'undefined',
      desc: '溢出折叠配置：数字简写或对象形式，仅 dropdown 模式有效',
    },
    {
      name: 'arrowPosition',
      type: "'start'|'end'|'both'",
      default: 'both',
      desc: 'scroll 模式中前/后箭头位置',
    },
    {
      name: 'renderArrow',
      type: "Snippet<[{ type: 'start'|'end'; onClick: () => void }]>",
      default: 'undefined',
      desc: '自定义前/后滚动箭头',
    },
    {
      name: 'showRestInDropdown',
      type: 'boolean',
      default: 'true',
      desc: 'dropdown 折叠模式是否在下拉中展示收起 tabs',
    },
    {
      name: 'dropdownProps',
      type: 'object',
      default: 'undefined',
      desc: '透传给「更多」Dropdown 组件的 props',
    },
    {
      name: 'onVisibleTabsChange',
      type: '(visibleTabKeys: (string|number)[]) => void',
      default: 'undefined',
      desc: 'dropdown 模式下溢出项变化时回调，携带当前可见 tab keys',
    },
    {
      name: 'contentStyle',
      type: 'string | Record<string, string>',
      default: 'undefined',
      desc: '内容区外层样式（string 或 CSSProperties 对象）',
    },
    {
      name: 'preventScroll',
      type: 'boolean',
      default: 'false',
      desc: 'Tab 聚焦时是否阻止页面滚动',
    },
    {
      name: 'tabPaneMotion',
      type: 'boolean',
      default: 'true',
      desc: '面板切换是否启用动画',
    },
    {
      name: 'tabBarExtraContent',
      type: 'Snippet',
      default: 'undefined',
      desc: '标签栏右侧额外内容',
    },
    { name: 'onChange', type: '(key: string|number) => void', default: 'undefined' },
    { name: 'onTabClose', type: '(key: string|number) => void', default: 'undefined' },
    {
      name: 'onTabClick',
      type: '(key: string|number, event: MouseEvent) => void',
      default: 'undefined',
      desc: '标签被点击触发（含已选中标签，未必触发 onChange；disabled 拦截前发出，可用于埋点）',
    },
    {
      name: 'onAdd',
      type: '() => void',
      default: 'undefined',
      desc: 'addable=true 时点击「+」按钮回调（受控数据，组件内不改 tabList）',
    },
    {
      name: 'renderTabBar',
      type: 'Snippet<[TabItem[], string|number|undefined, (key) => void]>',
      default: 'undefined',
      desc: '自定义整个标签栏渲染（接收 tab 列表、当前激活 key、切换回调 setActive）；传入时跳过内置标签栏与溢出处理，面板内容仍按 activeKey 显隐',
    },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '声明式 TabPane 内容（<Tabs.Pane>）' },
  ],
  a11y: {
    role: 'tablist',
    keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', 'Space'],
    notes: [
      'tablist 内每个标签为 role=tab，aria-selected 标记激活，aria-controls 关联面板',
      'roving tabindex：仅激活标签 tabindex=0，其余 -1',
      'keyboardActivation=auto 聚焦即激活，manual 需 Enter/Space 确认',
      '面板 role=tabpanel；关闭叉为带 aria-label 的原生 button',
      '标签溢出时出现前/后滚动箭头（带 aria-label，tabindex=-1 不入 Tab 序），激活标签自动滚到可视区',
      'overflow=dropdown 时溢出标签收进末尾「更多」下拉（aria-haspopup=menu，带 aria-label），激活标签始终保持可见',
      'addable 的「+」为带 aria-label 的原生 button',
      'renderTabBar 自定义标签栏时由调用方负责无障碍语义（role=tab/aria-selected 等）',
      'preventScroll=true 时 Tab 聚焦不触发页面滚动',
    ],
  },
  tokens: [
    // 全量对齐 Semi tabs/variables.scss（121 变量）的语义层：
    '--cd-color-tabs-tab-line-*', // 线条式各状态文本/背景/标示线
    '--cd-color-tabs-tab-card-*', // 卡片式各状态
    '--cd-color-tabs-tab-button-*', // 按钮式各状态
    '--cd-color-tabs-tab-icon-*',
    '--cd-color-tabs-tab-pane-arrow-*', // 滚动折叠箭头
    '--cd-color-tabs-tab-slash-line',
    '--cd-color-tabs-tab-outline-focus',
    '--cd-font-tabs-*', // 字重 / 字号 / 行高
    '--cd-width-tabs-*',
    '--cd-height-tabs-*',
    '--cd-spacing-tabs-*', // 各类型内/外边距 + 内容区
    '--cd-radius-tabs-*',
    // 组件实际消费的老 token（值对齐 Semi）：
    '--cd-tabs-tab-color', '--cd-tabs-tab-color-active', '--cd-tabs-tab-color-disabled',
    '--cd-tabs-tab-padding', '--cd-tabs-tab-font-size',
    '--cd-tabs-ink-color', '--cd-tabs-ink-height', '--cd-tabs-bar-border',
    '--cd-tabs-card-bg', '--cd-tabs-card-bg-active', '--cd-tabs-card-radius',
    '--cd-tabs-button-bg', '--cd-tabs-button-bg-hover', '--cd-tabs-button-bg-active',
    '--cd-tabs-button-color-active', '--cd-tabs-button-gap', '--cd-tabs-button-pad',
    '--cd-focus-ring', '--cd-border-radius-small', '--cd-spacing-*',
  ],
} as const;
